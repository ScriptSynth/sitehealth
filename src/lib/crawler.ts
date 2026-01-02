import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface CrawlResult {
    url: string;
    statusCode: number | null;
    type: 'BROKEN_LINK' | 'BROKEN_IMAGE' | 'MISSING_ASSET';
    pageUrl: string;
}

export async function crawlSite(siteId: string, startUrl: string) {
    console.log(`Starting crawl for ${startUrl} (Site ID: ${siteId})`);

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

    // Create a new scan record
    const { data: scan, error: scanError } = await supabase
        .from('scans')
        .insert({
            site_id: siteId,
            status: 'PROCESSING',
        })
        .select()
        .single();

    if (scanError || !scan) {
        console.error('Error creating scan:', scanError);
        return;
    }

    const issues: CrawlResult[] = [];
    const visitedUrls = new Set<string>();
    const urlsToVisit: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];
    const MAX_DEPTH = 3;
    const MAX_PAGES = 50; // Safety limit
    let pagesCrawled = 0;

    // Helper to check if same domain
    const isSameDomain = (url1: string, url2: string) => {
        try {
            return new URL(url1).hostname === new URL(url2).hostname;
        } catch { return false; }
    };

    try {
        const { chromium } = await import('playwright');
        const browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SiteHealthBot/1.0',
            ignoreHTTPSErrors: true
        });

        while (urlsToVisit.length > 0 && pagesCrawled < MAX_PAGES) {
            const { url: currentUrl, depth } = urlsToVisit.shift()!;

            // Normalize URL (remove trailing slash for dedup checking)
            const normalizedUrl = currentUrl.replace(/\/$/, '');
            if (visitedUrls.has(normalizedUrl) || depth > MAX_DEPTH) continue;
            visitedUrls.add(normalizedUrl);
            pagesCrawled++;

            console.log(`Crawling: ${currentUrl} (depth: ${depth})`);

            const page = await context.newPage();

            try {
                // Navigate with better timeout handling
                const response = await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });

                if (response && response.status() >= 400) {
                    issues.push({
                        url: currentUrl,
                        statusCode: response.status(),
                        type: 'BROKEN_LINK',
                        pageUrl: 'Entry Point',
                    });
                    continue; // Skip crawling error pages
                }

                // Wait a bit for JS hydration
                await page.waitForTimeout(1000);

                // Check ALL links (internal + external)
                const links = await page.$$eval('a[href]', (anchors) =>
                    anchors.map((a) => (a as HTMLAnchorElement).href)
                );

                for (const link of links) {
                    // Skip javascript: mailto: etc
                    if (!link.startsWith('http')) continue;

                    try {
                        const isInternal = isSameDomain(link, startUrl);

                        // Add to recursive queue if internal and not visited
                        const normalizedLink = link.replace(/\/$/, '');
                        if (isInternal && !visitedUrls.has(normalizedLink) && depth < MAX_DEPTH) {
                            urlsToVisit.push({ url: link, depth: depth + 1 });
                        }

                        // VALIDATE THE LINK
                        // We check:
                        // 1. Internal links: Always
                        // 2. External links: Check HEAD/GET but don't crawl

                        // Use fetch from inside the page context to share cookies/headers if needed, 
                        // or just simple request.get from playwright context
                        const linkResponse = await page.request.head(link).catch(() => page.request.get(link));

                        const status = linkResponse ? linkResponse.status() : 0;

                        if (status >= 400 || status === 0) {
                            // Double check with GET if HEAD failed (some servers block HEAD)
                            let confirmedStatus = status;
                            if (status === 404 || status === 405 || status === 0) {
                                const getResp = await page.request.get(link);
                                confirmedStatus = getResp.status();
                            }

                            if (confirmedStatus >= 400 || confirmedStatus === 0) {
                                issues.push({
                                    url: link,
                                    statusCode: confirmedStatus,
                                    type: 'BROKEN_LINK',
                                    pageUrl: currentUrl,
                                });
                            }
                        }
                    } catch (err) {
                        // Network error or timeout = broken
                        issues.push({
                            url: link,
                            statusCode: 0,
                            type: 'BROKEN_LINK',
                            pageUrl: currentUrl,
                        });
                    }
                }

                // Check Images
                const images = await page.$$eval('img', (imgs) =>
                    imgs.map((img) => ({
                        src: (img as HTMLImageElement).src,
                        naturalWidth: (img as HTMLImageElement).naturalWidth,
                    }))
                );

                for (const img of images) {
                    if (!img.src || img.src.startsWith('data:')) continue;

                    let isBroken = img.naturalWidth === 0;
                    let status = 200;

                    if (isBroken) {
                        // Verify with request
                        try {
                            const resp = await page.request.get(img.src);
                            status = resp.status();
                            if (status >= 400) isBroken = true;
                        } catch {
                            status = 0;
                            isBroken = true;
                        }
                    }

                    if (isBroken) {
                        issues.push({
                            url: img.src,
                            statusCode: status,
                            type: 'BROKEN_IMAGE',
                            pageUrl: currentUrl,
                        });
                    }
                }

            } catch (err) {
                console.error(`Error crawling ${currentUrl}:`, err);
            } finally {
                await page.close();
            }
        }

        await browser.close();

        // Dedup issues
        const uniqueIssues = issues.filter((issue, index, self) =>
            index === self.findIndex((t) => (
                t.url === issue.url && t.pageUrl === issue.pageUrl
            ))
        );

        // Store issues in Supabase
        if (uniqueIssues.length > 0) {
            const { error: issuesError } = await supabase
                .from('issues')
                .insert(
                    uniqueIssues.map(issue => ({
                        scan_id: scan.id,
                        type: issue.type,
                        url: issue.url,
                        page_url: issue.pageUrl,
                        status_code: issue.statusCode,
                    }))
                );

            if (issuesError) {
                console.error('Error storing issues:', issuesError);
            }
        }

        // Update scan status
        await supabase
            .from('scans')
            .update({
                status: 'COMPLETED',
                completed_at: new Date().toISOString(),
            })
            .eq('id', scan.id);

        // Update site last scan time
        await supabase
            .from('sites')
            .update({
                last_scan_at: new Date().toISOString(),
                status: 'COMPLETED',
            })
            .eq('id', siteId);

        console.log(`Crawl completed. Found ${uniqueIssues.length} issues.`);
    } catch (error) {
        console.error('Crawl error:', error);

        await supabase
            .from('scans')
            .update({ status: 'FAILED' })
            .eq('id', scan.id);

        await supabase
            .from('sites')
            .update({ status: 'ERROR' })
            .eq('id', siteId);
    }
}


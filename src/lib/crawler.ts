import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface CrawlResult {
    url: string;
    statusCode: number | null;
    type: 'BROKEN_LINK' | 'BROKEN_IMAGE' | 'MISSING_ASSET';
    pageUrl: string;
}

export async function crawlSite(siteId: string, url: string) {
    console.log(`Starting crawl for ${url} (Site ID: ${siteId})`);

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
    const urlsToVisit: { url: string; depth: number }[] = [{ url, depth: 0 }];
    const MAX_DEPTH = 3;

    try {
        // Import Playwright dynamically to avoid issues
        const { chromium } = await import('playwright');
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();

        while (urlsToVisit.length > 0) {
            const { url: currentUrl, depth } = urlsToVisit.shift()!;

            if (visitedUrls.has(currentUrl) || depth > MAX_DEPTH) continue;
            visitedUrls.add(currentUrl);

            console.log(`Crawling: ${currentUrl} (depth: ${depth})`);

            const page = await context.newPage();

            try {
                await page.goto(currentUrl, { waitUntil: 'networkidle', timeout: 30000 });

                // Check for broken links
                const links = await page.$$eval('a[href]', (anchors) =>
                    anchors.map((a) => (a as HTMLAnchorElement).href)
                );

                for (const link of links) {
                    try {
                        const linkUrl = new URL(link);
                        const baseUrl = new URL(url);

                        // Only check internal links
                        if (linkUrl.origin === baseUrl.origin && !visitedUrls.has(link)) {
                            if (depth < MAX_DEPTH) {
                                urlsToVisit.push({ url: link, depth: depth + 1 });
                            }

                            // Check if link is broken
                            const linkResponse = await page.request.get(link);
                            if (linkResponse.status() === 404 || linkResponse.status() === 410) {
                                issues.push({
                                    url: link,
                                    statusCode: linkResponse.status(),
                                    type: 'BROKEN_LINK',
                                    pageUrl: currentUrl,
                                });
                            }
                        }
                    } catch (err) {
                        console.error(`Error checking link ${link}:`, err);
                    }
                }

                // Check for broken images
                const images = await page.$$eval('img[src]', (imgs) =>
                    imgs.map((img) => ({
                        src: (img as HTMLImageElement).src,
                        naturalWidth: (img as HTMLImageElement).naturalWidth,
                    }))
                );

                for (const img of images) {
                    try {
                        if (img.naturalWidth === 0 || !img.src) {
                            const imgResponse = await page.request.get(img.src);
                            if (imgResponse.status() === 404 || imgResponse.status() >= 400) {
                                issues.push({
                                    url: img.src,
                                    statusCode: imgResponse.status(),
                                    type: 'BROKEN_IMAGE',
                                    pageUrl: currentUrl,
                                });
                            }
                        }
                    } catch (err) {
                        issues.push({
                            url: img.src,
                            statusCode: null,
                            type: 'BROKEN_IMAGE',
                            pageUrl: currentUrl,
                        });
                    }
                }

                // Check for broken PDF/file downloads
                const downloadLinks = await page.$$eval('a[href$=".pdf"], a[href$=".zip"], a[href$=".doc"], a[href$=".docx"]', (anchors) =>
                    anchors.map((a) => (a as HTMLAnchorElement).href)
                );

                for (const downloadLink of downloadLinks) {
                    try {
                        const downloadResponse = await page.request.get(downloadLink);
                        if (downloadResponse.status() === 404 || downloadResponse.status() === 410) {
                            issues.push({
                                url: downloadLink,
                                statusCode: downloadResponse.status(),
                                type: 'MISSING_ASSET',
                                pageUrl: currentUrl,
                            });
                        }
                    } catch (err) {
                        console.error(`Error checking download ${downloadLink}:`, err);
                    }
                }
            } catch (err) {
                console.error(`Error crawling ${currentUrl}:`, err);
            } finally {
                await page.close();
            }
        }

        await browser.close();

        // Store issues in Supabase
        if (issues.length > 0) {
            const { error: issuesError } = await supabase
                .from('issues')
                .insert(
                    issues.map(issue => ({
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

        console.log(`Crawl completed. Found ${issues.length} issues.`);
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

    return scan.id;
}

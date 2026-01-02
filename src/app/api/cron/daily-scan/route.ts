import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { crawlSite } from '@/lib/crawler';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

        // Get all sites that need scanning
        const { data: sites, error } = await supabase
            .from('sites')
            .select('id, url, last_scan_at')
            .order('last_scan_at', { ascending: true, nullsFirst: true });

        if (error) {
            console.error('Error fetching sites:', error);
            return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 });
        }

        if (!sites || sites.length === 0) {
            return NextResponse.json({ message: 'No sites to scan', scanned: 0 });
        }

        // Trigger scans for all sites
        const scanPromises = sites.map(site =>
            crawlSite(site.id, site.url).catch(err => {
                console.error(`Failed to scan ${site.url}:`, err);
                return null;
            })
        );

        await Promise.all(scanPromises);

        return NextResponse.json({
            message: 'Daily scans triggered successfully',
            scanned: sites.length,
            sites: sites.map(s => s.url)
        });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Allow GET for testing
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
        message: 'Cron endpoint is working',
        timestamp: new Date().toISOString()
    });
}

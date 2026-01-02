import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { crawlSite } from '@/lib/crawler';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Check if site exists
        const { data: site, error } = await supabase
            .from('sites')
            .select('id, url')
            .eq('id', id)
            .single();

        if (error || !site) {
            return NextResponse.json({ error: 'Site not found' }, { status: 404 });
        }

        // Trigger scan
        crawlSite(site.id, site.url).catch(console.error);

        return NextResponse.json({ message: 'Scan started' });
    } catch (error) {
        console.error('Error triggering scan:', error);
        return NextResponse.json({ error: 'Failed to trigger scan' }, { status: 500 });
    }
}

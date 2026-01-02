import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { crawlSite } from '@/lib/crawler';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }

        // Create site in Supabase
        const { data: site, error: siteError } = await supabase
            .from('sites')
            .insert({
                url,
                user_id: user.id,
                status: 'IDLE',
            })
            .select()
            .single();

        if (siteError) {
            console.error('Error creating site:', siteError);
            return NextResponse.json({ error: 'Failed to create site' }, { status: 500 });
        }

        // Trigger initial scan in background
        crawlSite(site.id, url).catch(console.error);

        return NextResponse.json({ site }, { status: 201 });
    } catch (error) {
        console.error('Error creating site:', error);
        return NextResponse.json({ error: 'Failed to create site' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: sites, error } = await supabase
            .from('sites')
            .select(`
        *,
        scans (
          id,
          status,
          started_at,
          completed_at,
          issues (
            id,
            type
          )
        )
      `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching sites:', error);
            return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 });
        }

        return NextResponse.json({ sites });
    } catch (error) {
        console.error('Error fetching sites:', error);
        return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 });
    }
}

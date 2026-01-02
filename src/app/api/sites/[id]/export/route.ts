import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Fetch site with latest scan and issues
        const { data: site, error } = await supabase
            .from('sites')
            .select(`
                url,
                scans (
                    started_at,
                    issues (
                        type,
                        url,
                        page_url,
                        status_code,
                        detected_at
                    )
                )
            `)
            .eq('id', id)
            .order('started_at', { referencedTable: 'scans', ascending: false })
            .limit(1, { referencedTable: 'scans' })
            .single();

        if (error || !site) {
            return NextResponse.json({ error: 'Site not found' }, { status: 404 });
        }

        const latestScan = site.scans?.[0];
        if (!latestScan || !latestScan.issues || latestScan.issues.length === 0) {
            return NextResponse.json({ error: 'No issues found' }, { status: 404 });
        }

        // Generate CSV
        const headers = ['Type', 'Broken URL', 'Found On Page', 'Status Code', 'Detected At'];
        const rows = latestScan.issues.map((issue: any) => [
            issue.type.replace(/_/g, ' '),
            issue.url,
            issue.page_url,
            issue.status_code?.toString() || 'N/A',
            new Date(issue.detected_at).toISOString(),
        ]);

        const csv = [
            headers.join(','),
            ...rows.map((row: string[]) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="sitehealth-${site.url}-${new Date().toISOString()}.csv"`,
            },
        });
    } catch (error) {
        console.error('Error exporting CSV:', error);
        return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
    }
}

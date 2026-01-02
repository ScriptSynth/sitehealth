import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const site = await prisma.site.findUnique({
            where: { id },
            include: {
                scans: {
                    take: 1,
                    orderBy: { startedAt: 'desc' },
                    include: {
                        issues: true,
                    },
                },
            },
        });

        if (!site) {
            return NextResponse.json({ error: 'Site not found' }, { status: 404 });
        }

        const latestScan = site.scans[0];
        if (!latestScan || !latestScan.issues.length) {
            return NextResponse.json({ error: 'No issues found' }, { status: 404 });
        }

        // Generate CSV
        const headers = ['Type', 'Broken URL', 'Found On Page', 'Status Code', 'Detected At'];
        const rows = latestScan.issues.map((issue) => [
            issue.type.replace(/_/g, ' '),
            issue.url,
            issue.pageUrl,
            issue.statusCode?.toString() || 'N/A',
            new Date(issue.detectedAt).toISOString(),
        ]);

        const csv = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
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

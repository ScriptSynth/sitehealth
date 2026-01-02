import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { crawlSite } from '@/lib/crawler';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const site = await prisma.site.findUnique({
            where: { id },
        });

        if (!site) {
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

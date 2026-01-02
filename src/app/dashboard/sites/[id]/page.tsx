```javascript
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, Download, AlertCircle, ExternalLink, RefreshCw, CheckCircle2, Globe, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ScanButton from "@/components/ScanButton";

export const dynamic = 'force-dynamic';

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch site with latest scan and issues
    const { data: site, error } = await supabase
        .from('sites')
        .select(`
    *,
    scans(
        id,
        status,
        started_at,
        completed_at,
        issues(
            id,
            type,
            url,
            page_url,
            status_code,
            detected_at
        )
    )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .order('started_at', { referencedTable: 'scans', ascending: false })
        .limit(1, { referencedTable: 'scans' })
        .single();

    if (error || !site) {
        notFound();
    }

    const latestScan = site.scans?.[0];
    const issues = latestScan?.issues || [];
    const isScanning = latestScan?.status === 'PROCESSING' || latestScan?.status === 'PENDING';

    // Calculate stats
    const totalIssues = issues.length;
    const brokenLinks = issues.filter((i: any) => i.type === 'BROKEN_LINK').length;
    const brokenImages = issues.filter((i: any) => i.type === 'BROKEN_IMAGE').length;
    const missingAssets = issues.filter((i: any) => i.type === 'MISSING_ASSET').length;

    // Health Score Calculation
    let healthScore = 100;
    if (totalIssues > 0) {
        healthScore = Math.max(0, 100 - (totalIssues * 5));
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-slide-up">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/sites" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold">{site.url}</h1>
                            {isScanning && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20 animate-pulse">
                                    Scanning...
                                </span>
                            )}
                        </div>
                        <p className="text-slate-400 text-sm flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Last scanned: {latestScan ? new Date(latestScan.started_at).toLocaleString() : 'Never'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <ScanButton siteId={id} initialIsScanning={isScanning} />
                    <a
                        href={`/ api / sites / ${ id }/export`}
download
className = {`px-4 py-2 btn-primary text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-transform hover:-translate-y-0.5 ${totalIssues === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                    >
    <Download className="w-4 h-4" />
                        Export Report
                    </a >
                </div >
            </div >

    {/* Health Overview */ }
    < div className = "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-up" style = {{ animationDelay: '0.1s' }}>
                <div className="glass-card p-5 rounded-xl border-l-4 border-indigo-500">
                    <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Health Score
                    </div>
                    <div className="text-3xl font-bold text-white">{healthScore}%</div>
                    <div className="mt-2 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full bg-${healthScore > 70 ? 'emerald' : healthScore > 40 ? 'yellow' : 'red'}-500`} style={{ width: `${healthScore}%` }}></div>
                    </div>
                </div>

                <div className="glass-card p-5 rounded-xl border-l-4 border-red-500">
                    <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Broken Links
                    </div>
                    <div className="text-3xl font-bold text-red-400">{brokenLinks}</div>
                </div>

                <div className="glass-card p-5 rounded-xl border-l-4 border-orange-500">
                    <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Broken Images
                    </div>
                    <div className="text-3xl font-bold text-orange-400">{brokenImages}</div>
                </div>

                <div className="glass-card p-5 rounded-xl border-l-4 border-yellow-500">
                    <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2">
                        <Download className="w-4 h-4" /> Missing Assets
                    </div>
                    <div className="text-3xl font-bold text-yellow-400">{missingAssets}</div>
                </div>
            </div >

    {/* Issues List */ }
    < div className = "glass-card rounded-xl overflow-hidden animate-slide-up" style = {{ animationDelay: '0.2s' }}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-800/50 to-transparent">
            <h2 className="font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Detailed Issue Report
            </h2>
            <span className="text-sm text-slate-500">Showing {issues.length} issues</span>
        </div>

{
    issues.length === 0 ? (
        <div className="p-16 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Excellent! No issues found.</h3>
            <p className="text-slate-400">Your site is healthy and free of broken links.</p>
        </div>
    ) : (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-900/50 text-slate-400 font-medium">
                <tr>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Issue Type</th>
                    <th className="px-6 py-4">Broken Resource</th>
                    <th className="px-6 py-4">Found On Page</th>
                    <th className="px-6 py-4">Fix Recommendation</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {issues.map((issue: any) => {
                    // Generate automated fix suggestion based on error
                    let fixSuggestion = "Investigate the broken resource.";
                    const code = issue.status_code;

                    if (code === 404) fixSuggestion = "The file was deleted or moved. Update the link or restore the file.";
                    else if (code === 500) fixSuggestion = "Server error. Check the server logs for the linked resource.";
                    else if (code === 403) fixSuggestion = "Permission denied. Check file permissions or access control.";
                    else if (code === 0) fixSuggestion = "Connection refused. The server might be down or DNS failed.";

                    if (issue.type === "BROKEN_IMAGE") fixSuggestion += " Replace the image.";

                    return (
                        <tr key={issue.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                    {issue.status_code || 'ERR'}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${issue.type === "BROKEN_LINK" ? "bg-red-500/10 text-red-400" :
                                    issue.type === "BROKEN_IMAGE" ? "bg-orange-500/10 text-orange-400" :
                                        "bg-yellow-500/10 text-yellow-400"
                                    }`}>
                                    {issue.type.replace(/_/g, " ")}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 max-w-xs">
                                    <code className="text-xs bg-black/30 px-2 py-1 rounded text-red-300 truncate w-full block" title={issue.url}>
                                        {issue.url}
                                    </code>
                                    <a href={issue.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <a
                                    href={`https://${site.url.replace(/^https?:\/\//, '')}${issue.page_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 max-w-[200px] truncate"
                                >
                                    {issue.page_url || '/'}
                                </a>
                            </td>
                            <td className="px-6 py-4 text-slate-300 text-sm">
                                <div className="flex items-start gap-2 max-w-xs">
                                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"></div>
                                    <span>{fixSuggestion}</span>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
)
}
            </div >
        </div >
    );
}

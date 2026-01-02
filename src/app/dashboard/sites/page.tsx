import { createClient } from '@/lib/supabase/server';
import { Plus, Globe, Search, Filter } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SitesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch sites with latest scan status
    const { data: sites, error } = await supabase
        .from('sites')
        .select(`
            *,
            scans (
                id,
                status,
                started_at,
                issues (count)
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching sites:", error);
    }

    const sitesData = sites || [];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-slide-up">
                <div>
                    <h1 className="text-3xl font-bold mb-1 text-gradient">My Websites</h1>
                    <p className="text-slate-400 text-sm">Manage and monitor all your web properties.</p>
                </div>
                <Link
                    href="/dashboard/sites/new"
                    className="px-5 py-2.5 btn-primary text-white text-sm font-medium rounded-lg flex items-center gap-2 justify-center"
                >
                    <Plus className="w-4 h-4" />
                    Add New Site
                </Link>
            </header>

            {/* Filters & Search (Visual only for now) */}
            <div className="flex gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search sites..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                    />
                </div>
                <button className="px-4 py-2.5 glass-button rounded-lg flex items-center gap-2 text-sm text-slate-300">
                    <Filter className="w-4 h-4" />
                    Filter
                </button>
            </div>

            {/* Sites Grid/Table */}
            <div className="glass-card rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {sitesData.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Globe className="w-10 h-10 text-slate-700" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No sites found</h3>
                        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                            You haven't added any websites yet. Start monitoring your first site today.
                        </p>
                        <Link
                            href="/dashboard/sites/new"
                            className="inline-flex items-center gap-2 px-6 py-3 btn-primary text-white rounded-lg font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Add Website
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-900/50 text-slate-400 font-medium border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4">Website</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Health Score</th>
                                    <th className="px-6 py-4">Last Scan</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sitesData.map((site) => {
                                    const latestScan = site.scans?.[0];
                                    const issueCount = latestScan?.issues?.[0]?.count || 0;
                                    const isScanning = latestScan?.status === 'PROCESSING' || latestScan?.status === 'PENDING';

                                    // Calculate simple health score
                                    let healthScore = 100;
                                    let statusColor = "emerald";
                                    let statusText = "Healthy";

                                    if (issueCount > 0) {
                                        healthScore = Math.max(0, 100 - (issueCount * 5));
                                        statusColor = healthScore > 70 ? "yellow" : "red";
                                        statusText = `${issueCount} Issues`;
                                    }

                                    if (isScanning) {
                                        statusText = "Scanning...";
                                        statusColor = "blue";
                                    } else if (!latestScan) {
                                        statusText = "Pending";
                                        statusColor = "slate";
                                    }

                                    return (
                                        <tr key={site.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg bg-${statusColor}-500/10 text-${statusColor}-400`}>
                                                        <Globe className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium group-hover:text-white transition-colors">{site.url}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${statusColor}-500/10 text-${statusColor}-400 border border-${statusColor}-500/20`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full bg-${statusColor}-400 ${isScanning ? 'animate-pulse' : ''}`} />
                                                    {statusText}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full bg-${statusColor}-400`}
                                                            style={{ width: `${healthScore}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-slate-400 font-mono text-xs">{healthScore}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {latestScan ? new Date(latestScan.started_at).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/dashboard/sites/${site.id}`}
                                                    className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium transition-colors"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

import { createClient } from '@/lib/supabase/server';
import { Plus, AlertCircle, CheckCircle2, Clock, Globe } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    // Fetch real sites data from Supabase
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

    const sitesData = sites || [];

    // Calculate stats
    const totalSites = sitesData.length;
    const totalIssues = sitesData.reduce((acc, site) => {
        const latestScan = site.scans?.[0];
        return acc + (latestScan?.issues?.length || 0);
    }, 0);
    const healthySites = sitesData.filter(site => {
        const latestScan = site.scans?.[0];
        return latestScan && latestScan.issues?.length === 0;
    }).length;

    const lastScanTime = sitesData.length > 0 && sitesData[0].scans?.[0]
        ? new Date(sitesData[0].scans[0].started_at).toLocaleString()
        : 'Never';

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex items-center justify-between mb-8 animate-slide-up">
                <div>
                    <h1 className="text-3xl font-bold mb-1 text-gradient">Dashboard</h1>
                    <p className="text-slate-400 text-sm">Welcome back, here is what's happening today.</p>
                </div>
                <Link
                    href="/dashboard/sites/new"
                    className="px-5 py-2.5 btn-primary text-white text-sm font-medium rounded-lg flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Site
                </Link>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: "Total Sites", value: totalSites.toString(), icon: <Globe className="w-5 h-5 text-indigo-400" />, color: "from-indigo-500/20 to-purple-500/20" },
                    { label: "Broken Links", value: totalIssues.toString(), icon: <AlertCircle className="w-5 h-5 text-red-400" />, color: "from-red-500/20 to-orange-500/20" },
                    { label: "Healthy Sites", value: healthySites.toString(), icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, color: "from-emerald-500/20 to-green-500/20" },
                    { label: "Last Scan", value: lastScanTime === 'Never' ? 'Never' : 'Recently', icon: <Clock className="w-5 h-5 text-blue-400" />, color: "from-blue-500/20 to-cyan-500/20" },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="glass-card p-6 rounded-xl card-3d group relative overflow-hidden animate-slide-up"
                        style={{ animationDelay: `${0.1 * i}s` }}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-slate-400 text-sm font-medium group-hover:text-slate-300 transition-colors">{stat.label}</span>
                                <div className="p-2 bg-slate-900/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold group-hover:scale-105 transition-transform">{stat.value}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sites Table */}
            <div className="glass-card rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-indigo-500/5 to-transparent">
                    <h2 className="font-semibold text-lg">Monitored Sites</h2>
                </div>

                {sitesData.length === 0 ? (
                    <div className="p-12 text-center">
                        <Globe className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No sites yet</h3>
                        <p className="text-slate-400 mb-6">Add your first website to start monitoring for broken links</p>
                        <Link
                            href="/dashboard/sites/new"
                            className="inline-flex items-center gap-2 px-6 py-3 btn-primary text-white rounded-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Add Your First Site
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-900/50 text-slate-400 font-medium border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4">Site URL</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Issues</th>
                                    <th className="px-6 py-4">Last Scan</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sitesData.map((site) => {
                                    const latestScan = site.scans?.[0];
                                    const issueCount = latestScan?.issues?.length || 0;
                                    const status = latestScan?.status === 'PROCESSING' ? 'Scanning...' :
                                        issueCount > 0 ? 'Issues Found' : 'Healthy';
                                    const lastScan = latestScan
                                        ? new Date(latestScan.started_at).toLocaleString()
                                        : 'Never';

                                    return (
                                        <tr key={site.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 font-medium group-hover:text-white transition-colors">{site.url}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${status === "Healthy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                    status === "Issues Found" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                                        "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${status === "Healthy" ? "bg-emerald-400" :
                                                        status === "Issues Found" ? "bg-red-400" :
                                                            "bg-blue-400 animate-pulse"
                                                        }`} />
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 font-semibold">{issueCount}</td>
                                            <td className="px-6 py-4 text-slate-400">{lastScan}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/dashboard/sites/${site.id}`}
                                                    className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium transition-colors"
                                                >
                                                    View Report →
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

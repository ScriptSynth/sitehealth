import { ArrowLeft, Download, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function SiteDetailPage({ params }: { params: { id: string } }) {
    // In real app, fetch site data and issues by ID
    const siteUrl = "myshop.com";
    const issues = [
        { id: 1, type: "BROKEN_LINK", url: "/products/old-item", pageUrl: "/products", statusCode: 404, detectedAt: "2024-01-02T10:30:00Z" },
        { id: 2, type: "BROKEN_IMAGE", url: "/images/hero.jpg", pageUrl: "/", statusCode: 404, detectedAt: "2024-01-02T10:31:00Z" },
        { id: 3, type: "MISSING_ASSET", url: "/downloads/guide.pdf", pageUrl: "/resources", statusCode: 404, detectedAt: "2024-01-02T10:32:00Z" },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-1">{siteUrl}</h1>
                    <p className="text-slate-400 text-sm">Last scanned 10 minutes ago</p>
                </div>
                <button className="px-4 py-2 glass-button rounded-lg text-sm font-medium flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Scan Now
                </button>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: "Total Issues", value: issues.length, color: "text-red-400" },
                    { label: "Broken Links", value: issues.filter(i => i.type === "BROKEN_LINK").length, color: "text-orange-400" },
                    { label: "Missing Assets", value: issues.filter(i => i.type !== "BROKEN_LINK").length, color: "text-yellow-400" },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-5 rounded-xl">
                        <div className="text-slate-400 text-sm font-medium mb-2">{stat.label}</div>
                        <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Issues Table */}
            <div className="glass-card rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        Issues Found
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-900/50 text-slate-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Broken URL</th>
                                <th className="px-6 py-4">Found On Page</th>
                                <th className="px-6 py-4">Status Code</th>
                                <th className="px-6 py-4">Detected</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {issues.map((issue) => (
                                <tr key={issue.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${issue.type === "BROKEN_LINK" ? "bg-orange-500/10 text-orange-400" :
                                                issue.type === "BROKEN_IMAGE" ? "bg-red-500/10 text-red-400" :
                                                    "bg-yellow-500/10 text-yellow-400"
                                            }`}>
                                            {issue.type.replace(/_/g, " ")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-300">{issue.url}</td>
                                    <td className="px-6 py-4">
                                        <a href={`https://${siteUrl}${issue.pageUrl}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1">
                                            {issue.pageUrl}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                                            {issue.statusCode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">{new Date(issue.detectedAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

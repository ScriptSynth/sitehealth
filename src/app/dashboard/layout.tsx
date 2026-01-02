import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Activity, LayoutDashboard, Globe, Settings, LogOut } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-mesh-gradient flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-slate-900/30 backdrop-blur-xl hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-white/10">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-1.5 rounded-md bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                            <Activity className="w-5 h-5 text-indigo-400" />
                        </div>
                        <span className="font-semibold tracking-tight">SiteHealth</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-white bg-white/10 rounded-lg transition-all group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <LayoutDashboard className="w-4 h-4 text-indigo-400 relative z-10" />
                        <span className="relative z-10">Overview</span>
                    </Link>
                    <Link
                        href="/dashboard/sites"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
                    >
                        <Globe className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                        Sites
                    </Link>
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
                    >
                        <Settings className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                        Settings
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="mb-3 px-3 py-2 bg-slate-900/50 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Signed in as</div>
                        <div className="text-sm text-slate-300 truncate">{user.email}</div>
                    </div>
                    <form action="/api/auth/logout" method="POST">
                        <button
                            type="submit"
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all group"
                        >
                            <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}

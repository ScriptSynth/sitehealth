import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-all duration-300 border border-indigo-500/20">
                        <Activity className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <span className="font-semibold text-lg tracking-tight group-hover:text-gradient-primary transition-all">SiteHealth</span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors relative group">
                        Login
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                    <Link
                        href="/register"
                        className="px-5 py-2.5 text-sm font-medium btn-primary text-white rounded-full"
                    >
                        Start Monitoring
                    </Link>
                </div>
            </div>
        </nav>
    );
}

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-slate-950 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-sm text-slate-500">
                        © {new Date().getFullYear()} SiteHealth. All rights reserved.
                    </div>
                    <div className="flex gap-6 text-sm text-slate-400">
                        <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

import Link from 'next/link';
import { AlertCircle, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4">
            <div className="p-4 bg-slate-900/50 rounded-full mb-6 animate-float">
                <AlertCircle className="w-12 h-12 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-gradient">Page Not Found</h1>
            <p className="text-slate-400 mb-8 max-w-md">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Link
                href="/"
                className="px-6 py-3 btn-primary text-white rounded-lg font-medium flex items-center gap-2 transition-transform hover:-translate-y-1"
            >
                <Home className="w-4 h-4" />
                Return Home
            </Link>
        </div>
    );
}

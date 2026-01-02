'use client';

import Link from 'next/link';
import { Activity } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // If email confirmation is enabled, we shouldn't try to sign in immediately
            // unless we know for sure it's disabled. Safest UX is to tell them to check email.
            setSuccess(true);
            // Optional: Redirect after a delay
            // setTimeout(() => router.push('/login'), 5000);

        } catch (err: any) {
            setError(err.message || 'Failed to create account');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-mesh-gradient px-4 relative overflow-hidden">
                <div className="w-full max-w-md glass-card p-8 rounded-2xl relative z-10 card-3d animate-slide-up text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-3 rounded-full bg-green-500/20 text-green-400">
                            <Activity className="w-8 h-8" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Check your email</h2>
                    <p className="text-slate-400 mb-8">
                        We've sent a confirmation link to <span className="text-white font-medium">{email}</span>.
                        Please click the link to verify your account and sign in.
                    </p>
                    <Link href="/login" className="btn-primary w-full py-3 rounded-lg block font-semibold text-white">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-mesh-gradient px-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="w-full max-w-md glass-card p-8 rounded-2xl relative z-10 card-3d animate-slide-up">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                            <Activity className="w-6 h-6 text-indigo-400" />
                        </div>
                        <span className="font-semibold text-xl tracking-tight">SiteHealth</span>
                    </Link>
                </div>

                <h2 className="text-3xl font-bold text-center mb-2">Create an account</h2>
                <p className="text-slate-400 text-center mb-8">Start monitoring your websites today.</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 hover:border-white/20"
                            placeholder="name@company.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 hover:border-white/20"
                            placeholder="••••••••"
                        />
                        <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Already have an account? <Link href="/login" className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">Sign in</Link>
                </div>
            </div>
        </div>
    );
}

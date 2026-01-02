'use client';

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddSitePage() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate URL
            let validUrl: string;
            try {
                const urlObj = new URL(url);
                validUrl = urlObj.toString();
            } catch {
                throw new Error('Please enter a valid URL (e.g., https://example.com)');
            }

            console.log('Submitting URL:', validUrl);

            const response = await fetch('/api/sites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: validUrl }),
            });

            const data = await response.json();
            console.log('API Response:', response.status, data);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('You must be logged in to add a site');
                }
                throw new Error(data.error || `Server error: ${response.status}`);
            }

            // Success! Redirect to dashboard
            console.log('Site added successfully:', data.site);
            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            console.error('Error adding site:', err);
            setError(err.message || 'Failed to add site. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-8 animate-slide-up">
                <h1 className="text-3xl font-bold mb-2 text-gradient">Add New Site</h1>
                <p className="text-slate-400">Start monitoring a website for broken links and missing assets.</p>
            </div>

            <div className="glass-card p-8 rounded-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-2">
                            Website URL
                        </label>
                        <input
                            type="text"
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            required
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 hover:border-white/20"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            We'll crawl your homepage, navigation, footer, and internal links up to depth 3.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href="/dashboard"
                            className="flex-1 text-center px-4 py-3 glass-button rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 btn-primary text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Adding Site...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Add Site & Start Scan
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <p className="text-sm text-indigo-300">
                        <strong>Note:</strong> The initial scan will start immediately. After that, your site will be automatically scanned every 24 hours.
                    </p>
                </div>
            </div>
        </div>
    );
}

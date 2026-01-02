'use client';

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScanButton({ siteId, initialIsScanning }: { siteId: string, initialIsScanning: boolean }) {
    const [isScanning, setIsScanning] = useState(initialIsScanning);
    const router = useRouter();

    const handleScan = async () => {
        setIsScanning(true);
        try {
            const res = await fetch(`/api/sites/${siteId}/scan`, {
                method: 'POST',
            });
            if (!res.ok) throw new Error('Scan failed to start');

            // Refresh to show "Scanning..." state from server if verified, 
            // but for now local state is faster feedback
            router.refresh();
        } catch (error) {
            console.error(error);
            setIsScanning(false);
            alert("Failed to start scan. Please try again.");
        }
    };

    return (
        <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-4 py-2 glass-button rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
        >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Scan Now'}
        </button>
    );
}

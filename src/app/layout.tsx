import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SiteHealth | Stop broken links from killing your sales",
  description: "Continuous website monitoring for broken links, missing images, and asset failures. Get instant alerts when it matters most.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-white min-h-screen bg-black selection:bg-indigo-500/30">
        {children}
      </body>
    </html>
  );
}

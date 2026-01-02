import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { CheckCircle2, Zap, Shield, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col pt-16 bg-mesh-gradient">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 glass-card rounded-full animate-slide-up">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-slate-300">Automated Website Monitoring</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-6 max-w-5xl mx-auto leading-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
              We stop <span className="relative inline-block">
                <span className="text-gradient-primary">broken links</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5.5C40 2.5 80 1 120 2.5C160 4 180 6 199 5.5" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="50%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </svg>
              </span> from killing your sales.
            </h1>

            <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              No more manual checking. No more <span className="text-red-400 font-semibold">'Page Not Found.'</span> Just instant alerts when it matters most.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link
                href="/register"
                className="px-8 py-4 btn-primary text-white rounded-full font-semibold flex items-center gap-2 group"
              >
                Start Monitoring
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#how-it-works"
                className="px-8 py-4 glass-button rounded-full text-slate-300 hover:text-white font-medium"
              >
                How it works
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              {[
                { value: "99.9%", label: "Uptime" },
                { value: "< 1min", label: "Detection" },
                { value: "24/7", label: "Monitoring" }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gradient-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features / How it works */}
        <section id="how-it-works" className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                How <span className="text-gradient-primary">SiteHealth</span> Works
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Three simple steps to protect your website's reputation and revenue
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="w-6 h-6 text-amber-400" />,
                  title: "Instant Detection",
                  desc: "We crawl your entire site daily to catch broken links, missing images, and failed downloads.",
                  color: "from-amber-500/20 to-orange-500/20"
                },
                {
                  icon: <Shield className="w-6 h-6 text-emerald-400" />,
                  title: "Protect SEO",
                  desc: "Broken links hurt your ranking. We help you fix them before Google notices.",
                  color: "from-emerald-500/20 to-green-500/20"
                },
                {
                  icon: <CheckCircle2 className="w-6 h-6 text-blue-400" />,
                  title: "Simple Alerts",
                  desc: "Get a clean report in your inbox. No complex dashboards, just the broken stuff.",
                  color: "from-blue-500/20 to-cyan-500/20"
                }
              ].map((item, i) => (
                <div
                  key={i}
                  className="glass-card p-8 rounded-2xl card-3d card-3d-hover group animate-slide-up relative overflow-hidden"
                  style={{ animationDelay: `${0.1 * i}s` }}
                >
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}></div>

                  <div className="relative z-10">
                    <div className="mb-6 p-4 bg-slate-900/80 rounded-xl inline-block border border-white/5 group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-white transition-colors">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing MVP */}
        <section className="py-24 border-t border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent"></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 text-lg mb-12">No hidden fees. Cancel anytime.</p>

            <div className="glass-card max-w-md mx-auto p-10 rounded-3xl border-indigo-500/30 relative overflow-hidden card-3d animate-glow">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent pointer-events-none"></div>

              <div className="relative z-10">
                <div className="inline-block px-4 py-1 bg-indigo-500/20 text-indigo-300 text-sm font-semibold rounded-full mb-4">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="text-5xl font-bold mb-8">
                  <span className="text-gradient-primary">$9</span>
                  <span className="text-lg text-slate-500 font-normal">/mo</span>
                </div>

                <ul className="text-left space-y-4 mb-8 text-slate-300">
                  {[
                    "Daily Automated Scans",
                    "Unlimited Pages",
                    "Instant Email Alerts",
                    "PDF & Image Checks",
                    "CSV Export",
                    "Priority Support"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 group">
                      <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="group-hover:text-white transition-colors">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="block w-full py-4 btn-primary text-white font-bold rounded-xl text-lg"
                >
                  Get Started Now
                </Link>

                <p className="text-xs text-slate-500 mt-4">14-day money-back guarantee</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

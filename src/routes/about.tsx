import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/public-header";
import {
  ArrowRight, Globe, Shield, Zap, Users, Star, BadgeCheck,
  Video, BookOpen, Database, Landmark, CreditCard,
  HeartHandshake, TrendingUp, Clock, Award,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

const SERVICES = [
  {
    icon: Video,
    title: "Video Watching Tasks",
    desc: "Watch promotional or educational videos (5–10 per day) using our tamper-proof player. Earnings are credited the moment a video is marked complete.",
    earn: "₨80/day",
    from: "from-emerald-600", to: "to-emerald-900",
  },
  {
    icon: BookOpen,
    title: "Assignment Writing",
    desc: "Write essays, product descriptions, and research summaries. Tasks are structured with clear briefs — ideal for fluent Urdu or English writers.",
    earn: "₨250/day",
    from: "from-violet-600", to: "to-violet-900",
  },
  {
    icon: Database,
    title: "Data Entry",
    desc: "Copy, format, and verify structured data sets. No specialist skills needed — just accuracy and consistency. Tasks reviewed within 24 hours.",
    earn: "₨400/day",
    from: "from-amber-500", to: "to-orange-700",
  },
];

const PARTNERS = [
  {
    name: "OPay",
    logo: "💳",
    color: "from-green-500 to-green-700",
    desc: "Pakistan's fastest mobile wallet. Instant deposit & withdrawal — receive your PKR earnings in under 60 seconds.",
    features: ["Instant transfers", "Zero withdrawal fee", "Available nationwide"],
  },
  {
    name: "Mashreq Bank",
    logo: "🏦",
    color: "from-red-600 to-red-800",
    desc: "A trusted regional bank with full Pakistan coverage. Ideal for larger withdrawals and members who prefer bank transfers.",
    features: ["Bank-level security", "Same-day settlement", "All major cities"],
  },
];

const FOREIGN_STEPS = [
  { num: "01", title: "Create your account", desc: "Sign up with any valid email address — no Pakistani CNIC required for basic account setup." },
  { num: "02", title: "Choose a package", desc: "Select Starter, Professional, or Premium based on your skill set and earning goal." },
  { num: "03", title: "Pay via bank transfer", desc: "International members can pay via SWIFT / wire transfer to our Mashreq Bank account. Contact support for details." },
  { num: "04", title: "Complete tasks remotely", desc: "All tasks are fully online. Work from anywhere — UAE, UK, USA, Saudi Arabia, or beyond." },
  { num: "05", title: "Withdraw in PKR", desc: "Earnings are held in PKR. Withdraw to any Pakistani bank account or mobile wallet on your behalf." },
];

const VALUES = [
  { icon: Shield, title: "Transparent Payouts", desc: "Every earning and withdrawal is logged and visible in your dashboard in real time." },
  { icon: HeartHandshake, title: "Admin-Verified Tasks", desc: "Human admins review every submission — no bots, no automated rejections." },
  { icon: Clock, title: "Daily Earning Cycle", desc: "Tasks reset daily. Complete them before midnight PKR to lock in that day's earnings." },
  { icon: Award, title: "Tier-Based Rewards", desc: "Upgrade your package anytime to unlock higher-value tasks and bigger daily earnings." },
];

const STATS = [
  { icon: Users, value: "2,400+", label: "Active Members" },
  { icon: Star, value: "4.9★", label: "Avg. Rating" },
  { icon: TrendingUp, value: "₨50L+", label: "Total Paid Out" },
  { icon: Globe, value: "12+", label: "Countries" },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-hero text-primary-foreground overflow-x-hidden">
      <PublicHeader />

      <main className="px-4 sm:px-8 max-w-7xl mx-auto">

        {/* ── Hero ─────────────────────────────── */}
        <section className="pt-14 pb-12 sm:pt-24 sm:pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur border border-white/20 px-4 py-1.5 text-xs font-semibold mb-6 uppercase tracking-widest">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-300" /> Pakistan's Trusted Earning Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto">
            We help people earn{" "}
            <span className="relative inline-block">
              <span className="relative z-10">real PKR</span>
              <span className="absolute inset-x-0 bottom-1 h-3 bg-white/25 -rotate-1 rounded" />
            </span>{" "}
            — every single day.
          </h1>
          <p className="mt-6 text-base sm:text-lg opacity-80 max-w-2xl mx-auto leading-relaxed">
            Expert Solutions is a Pakistan-based digital task platform operating since 2023. We connect verified members with paid tasks — video watching, writing, and data entry — with daily PKR payouts via OPay and Mashreq Bank.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold shadow-xl">
              <Link to="/auth" className="flex items-center gap-2">
                Join now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-primary-foreground hover:bg-white/20">
              <Link to="/faq">View FAQ</Link>
            </Button>
          </div>
        </section>

        {/* ── Stats ────────────────────────── */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-16 border-t border-white/10 pt-10">
          {STATS.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5 border border-white/10 text-center">
              <s.icon className="h-5 w-5 mx-auto mb-2 opacity-60" />
              <div className="text-2xl sm:text-3xl font-black">{s.value}</div>
              <div className="text-xs opacity-60 mt-1">{s.label}</div>
            </div>
          ))}
        </section>

        {/* ── Services ─────────────────────── */}
        <section className="pb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">What We Do</h2>
          <p className="text-center opacity-60 text-sm mb-10">Three types of paid work — choose what suits you</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${s.from} ${s.to} p-6 text-white shadow-xl`}>
                  <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                  <div className="relative">
                    <div className="h-11 w-11 rounded-2xl bg-white/15 grid place-items-center mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                    <p className="text-sm opacity-75 leading-relaxed mb-4">{s.desc}</p>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/30 px-3 py-1 text-xs font-bold">
                      <TrendingUp className="h-3 w-3" /> Up to {s.earn}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Payment Partners ─────────────── */}
        <section className="pb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Our Payment Partners</h2>
            <p className="opacity-60 text-sm">Official collaborations — pay to join & withdraw your earnings</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {PARTNERS.map((p) => (
              <div key={p.name} className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${p.color} p-7 text-white shadow-xl`}>
                <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-white/20 grid place-items-center text-3xl shadow-inner">
                      {p.logo}
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest opacity-60 mb-0.5">Official Partner</div>
                      <h3 className="text-2xl font-black">{p.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm opacity-80 leading-relaxed mb-5">{p.desc}</p>
                  <ul className="flex flex-wrap gap-2">
                    {p.features.map((f) => (
                      <li key={f} className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 rounded-full px-3 py-1 text-xs font-semibold">
                        <BadgeCheck className="h-3 w-3 text-white/80" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 glass rounded-2xl border border-white/10 p-5 text-center">
            <p className="text-sm opacity-70">
              <CreditCard className="h-4 w-4 inline mr-1.5 opacity-50" />
              All transactions are processed in <strong>Pakistani Rupees (PKR)</strong>. Withdrawal requests are reviewed and approved within <strong>1–6 hours</strong> on business days.
            </p>
          </div>
        </section>

        {/* ── For Foreigners ───────────────── */}
        <section className="pb-16">
          <div className="rounded-3xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur">
            <div className="bg-gradient-to-r from-indigo-600/50 to-violet-600/50 px-6 sm:px-10 py-8 border-b border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 grid place-items-center">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest opacity-60">International Members</div>
                  <h2 className="text-xl sm:text-2xl font-bold">For Members Outside Pakistan</h2>
                </div>
              </div>
              <p className="opacity-75 text-sm max-w-2xl leading-relaxed">
                Expert Solutions welcomes members from the UAE, UK, USA, Saudi Arabia, Canada, Australia, and all other countries. Our tasks are fully online — work from anywhere with an internet connection.
              </p>
            </div>
            <div className="px-6 sm:px-10 py-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FOREIGN_STEPS.map((s) => (
                  <div key={s.num} className="glass rounded-2xl p-5 border border-white/10 hover:border-white/25 transition-all">
                    <div className="text-3xl font-black opacity-20 mb-2 leading-none">{s.num}</div>
                    <h3 className="font-bold text-sm mb-1.5">{s.title}</h3>
                    <p className="text-xs opacity-65 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-xs">
                {["UAE 🇦🇪", "UK 🇬🇧", "USA 🇺🇸", "Saudi Arabia 🇸🇦", "Canada 🇨🇦", "Australia 🇦🇺", "Germany 🇩🇪", "Qatar 🇶🇦"].map((c) => (
                  <span key={c} className="bg-white/10 border border-white/20 rounded-full px-3 py-1 font-medium">{c}</span>
                ))}
                <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1 font-medium opacity-60">+ many more</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Values ───────────────────────── */}
        <section className="pb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">How We Operate</h2>
          <p className="text-center opacity-60 text-sm mb-10">Our commitments to every member</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="glass rounded-2xl p-5 border border-white/10 hover:border-white/25 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-white/15 grid place-items-center mb-3">
                    <Icon className="h-5 w-5 opacity-90" />
                  </div>
                  <h3 className="font-bold text-sm mb-2">{v.title}</h3>
                  <p className="text-xs opacity-65 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CTA ──────────────────────────── */}
        <section className="pb-20 text-center">
          <div className="glass rounded-3xl border border-white/15 px-6 py-12 sm:py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-emerald-600/10 rounded-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-semibold mb-5 uppercase tracking-widest">
                <Zap className="h-3.5 w-3.5 text-yellow-300" /> Start earning today
              </div>
              <h2 className="text-2xl sm:text-4xl font-black mb-3">Ready to join 2,400+ members?</h2>
              <p className="opacity-70 text-sm sm:text-base mb-8 max-w-lg mx-auto">
                Create your free account in 2 minutes. Choose a package, complete daily tasks, and earn real PKR — every day.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold shadow-2xl shadow-black/20">
                  <Link to="/auth" className="flex items-center gap-2">
                    Create free account <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                  <Link to="/faq">Read FAQ</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────── */}
      <footer className="border-t border-white/10 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-50">
          <span>© 2025 Expert Solutions · Pakistan</span>
          <div className="flex gap-4">
            <Link to="/" className="hover:opacity-100 transition">Home</Link>
            <Link to="/about" className="hover:opacity-100 transition">About</Link>
            <Link to="/faq" className="hover:opacity-100 transition">FAQ</Link>
            <Link to="/auth" className="hover:opacity-100 transition">Sign in</Link>
          </div>
        </div>
      </footer>

      <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 p-4 bg-gradient-to-t from-[#1e1b4b] to-transparent">
        <Button asChild size="lg" className="w-full bg-white text-primary font-bold shadow-2xl">
          <Link to="/auth" className="flex items-center justify-center gap-2">
            Get started — it&apos;s free <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

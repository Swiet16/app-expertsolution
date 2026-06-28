import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/public-header";
import { ArrowRight, ChevronDown, MessageCircle, Zap } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
});

const FAQS = [
  {
    category: "Getting Started",
    color: "from-violet-600 to-violet-900",
    items: [
      {
        q: "What is Expert Solutions?",
        a: "Expert Solutions is a Pakistan-based online earning platform. Members complete simple daily tasks — watching videos, writing assignments, or entering data — and receive PKR earnings directly to their OPay wallet or Mashreq Bank account.",
      },
      {
        q: "Who can join?",
        a: "Anyone 18 or older can join — Pakistani residents and international members alike. We have active members in the UAE, UK, USA, Saudi Arabia, Canada, Germany, Qatar, and many more countries. All tasks are completed fully online.",
      },
      {
        q: "Is this platform legitimate?",
        a: "Yes. Expert Solutions has been operating since 2023 with over 2,400 active members. Every withdrawal is processed manually by our admin team. We have official payment partnerships with OPay and Mashreq Bank.",
      },
      {
        q: "How do I sign up?",
        a: "Click 'Get started', enter your email and a password, complete your profile, then choose a package. The whole process takes under 5 minutes.",
      },
    ],
  },
  {
    category: "Packages & Payments",
    color: "from-emerald-600 to-emerald-900",
    items: [
      {
        q: "What packages are available?",
        a: "We offer three packages: Starter (₨799, earn ₨80/day via video tasks), Professional (₨1,299, earn ₨250/day via assignment writing), and Premium (₨4,500, earn ₨400/day via video + data entry). The joining fee is a one-time payment.",
      },
      {
        q: "How do I pay to join?",
        a: "You can pay via OPay (mobile wallet), Mashreq Bank transfer, or direct bank transfer. After payment, send your transaction screenshot to our admin team, who will approve your account and email you an activation key.",
      },
      {
        q: "Can I upgrade my package later?",
        a: "Yes. You can upgrade from Starter to Professional or Premium at any time. Pay the difference amount and submit proof to the admin panel. Upgrades are typically approved within a few hours.",
      },
      {
        q: "What if my payment is rejected?",
        a: "If your payment screenshot is rejected, the admin team will provide a reason. Common reasons include unclear screenshots, incorrect amounts, or unrecognised sender accounts. Contact support and we'll help resolve it.",
      },
      {
        q: "Are there any hidden fees?",
        a: "No hidden fees at all. The package price is a one-time joining fee. Withdrawals are free. OPay and Mashreq Bank may apply their own standard transfer charges on their end.",
      },
    ],
  },
  {
    category: "Earning & Tasks",
    color: "from-amber-500 to-orange-700",
    items: [
      {
        q: "How do I complete tasks?",
        a: "After activation, go to the Tasks or Video Tasks page in your dashboard. Watch assigned videos until completion, or submit written assignments with a screenshot proof. Completed tasks are reviewed by admins within 24 hours.",
      },
      {
        q: "How many tasks can I do per day?",
        a: "Starter members watch 5–10 videos per day. Professional members complete 1–3 writing tasks per day. Premium members do a combination of video and data entry tasks. Tasks reset at midnight PKR time.",
      },
      {
        q: "What happens if I miss a day?",
        a: "Missing a day simply means no earnings for that day. There is no penalty, ban, or expiry — your account and package remain fully active. Just resume tasks the next day.",
      },
      {
        q: "Can I earn more than the daily limit?",
        a: "Daily limits are fixed per package to ensure fair distribution of tasks. You can earn more by upgrading to a higher package. Referral bonuses (when available) are separate from daily task earnings.",
      },
    ],
  },
  {
    category: "Withdrawals",
    color: "from-cyan-600 to-cyan-900",
    items: [
      {
        q: "When can I withdraw my earnings?",
        a: "You can request a withdrawal as soon as your wallet balance meets the minimum threshold (₨500 for OPay, ₨1,000 for Mashreq Bank). Withdrawals are processed within 1–6 hours on business days (Mon–Sat, 9am–9pm PKR).",
      },
      {
        q: "Which withdrawal methods are supported?",
        a: "We support OPay (mobile wallet — fastest, usually under 60 seconds after approval), Mashreq Bank (direct account transfer — ideal for larger amounts), and general bank transfer for international members.",
      },
      {
        q: "How do I request a withdrawal?",
        a: "Go to your Wallet page, tap 'Withdraw', enter your OPay number or Mashreq Bank account details, and confirm. The admin team receives the request and processes it manually.",
      },
      {
        q: "I'm outside Pakistan — how do I withdraw?",
        a: "International members can request withdrawal to any Pakistani bank account or mobile wallet they have access to (e.g., a family member's OPay account). We do not currently support direct international SWIFT withdrawals.",
      },
    ],
  },
  {
    category: "Account & Security",
    color: "from-rose-600 to-rose-900",
    items: [
      {
        q: "Is my personal information safe?",
        a: "Yes. We use Supabase with Row Level Security — meaning your data is only accessible to you and authorised admin staff. We never sell or share your information with third parties.",
      },
      {
        q: "Can I have multiple accounts?",
        a: "No. Each person is allowed one account only. Multiple accounts from the same device or IP are automatically flagged and may result in suspension of all related accounts.",
      },
      {
        q: "What if I forget my password?",
        a: "Use the 'Forgot password' link on the sign-in page. An email reset link will be sent to your registered email address. If you don't receive it within 5 minutes, check your spam folder or contact support.",
      },
      {
        q: "How do I contact support?",
        a: "Use the in-app support section or reach us via WhatsApp (number listed in the app after login). Our support team is available Saturday–Thursday, 9am–10pm PKR.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-white/10 rounded-2xl overflow-hidden transition-all ${open ? "bg-white/10" : "bg-white/5 hover:bg-white/8"}`}>
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-3"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex-1 text-sm font-semibold leading-relaxed">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 mt-0.5 opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm opacity-70 leading-relaxed border-t border-white/10 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

function FaqPage() {
  return (
    <div className="min-h-screen bg-gradient-hero text-primary-foreground overflow-x-hidden">
      <PublicHeader />

      <main className="px-4 sm:px-8 max-w-4xl mx-auto">

        {/* ── Hero ─────────────────────────── */}
        <section className="pt-14 pb-12 sm:pt-20 sm:pb-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-white/15 grid place-items-center mx-auto mb-5">
            <MessageCircle className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="opacity-70 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Everything you need to know about Expert Solutions — from signing up to withdrawing your first earnings.
          </p>
        </section>

        {/* ── FAQ Categories ───────────────── */}
        <div className="space-y-10 pb-16">
          {FAQS.map((cat) => (
            <section key={cat.category}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-1.5 w-8 rounded-full bg-gradient-to-r ${cat.color}`} />
                <h2 className="text-base font-bold uppercase tracking-widest opacity-70">{cat.category}</h2>
              </div>
              <div className="space-y-2">
                {cat.items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ── Still have questions ──────────── */}
        <section className="pb-20 text-center">
          <div className="glass rounded-3xl border border-white/15 px-6 py-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-emerald-600/10 rounded-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-semibold mb-4 uppercase tracking-widest">
                <Zap className="h-3.5 w-3.5 text-yellow-300" /> Still have questions?
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-3">We're here to help</h2>
              <p className="opacity-65 text-sm mb-7 max-w-md mx-auto">
                Can't find what you're looking for? Contact our support team via WhatsApp after signing in.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold shadow-xl">
                  <Link to="/auth" className="flex items-center gap-2">
                    Create free account <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                  <Link to="/about">About us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

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

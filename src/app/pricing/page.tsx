"use client";

import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Free",
    price: "$0",
    desc: "One audit, no commitment",
    features: [
      { text: "1 audit", included: true },
      { text: "Score + top 5 quick wins", included: true },
      { text: "PageSpeed analysis", included: true },
      { text: "Full audit report", included: false },
      { text: "Optimization suggestions", included: false },
      { text: "Multi-page site audit", included: false },
      { text: "Site crawler", included: false },
      { text: "Weekly monitoring", included: false },
      { text: "PDF export", included: false },
      { text: "White-label reports", included: false },
    ],
    cta: "Get started",
    href: "/signup",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    desc: "For serious store owners",
    popular: true,
    features: [
      { text: "15 audits/month", included: true },
      { text: "Full audit reports", included: true },
      { text: "AI fix suggestions (Claude Sonnet)", included: true },
      { text: "Multi-page site audit", included: true },
      { text: "Site crawler + auto-classification", included: true },
      { text: "Weekly monitoring", included: true },
      { text: "Score change alerts", included: true },
      { text: "PDF export", included: true },
      { text: "Shareable report links", included: true },
      { text: "White-label reports", included: false },
    ],
    cta: "Start Pro",
    href: "/signup?plan=pro",
  },
  {
    name: "Agency",
    price: "$99",
    period: "/month",
    desc: "For teams and agencies",
    features: [
      { text: "50 audits/month", included: true },
      { text: "Everything in Pro", included: true },
      { text: "White-label reports", included: true },
      { text: "Bulk URL audit", included: true },
      { text: "Custom branding", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Start Agency",
    href: "/signup?plan=agency",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4
        border-b border-white/6 bg-background/80 backdrop-blur-md">
        <a href="/" className="font-mono text-sm font-bold tracking-tight">
          CRO<span className="text-gradient-cro">audit</span>
        </a>
        <div className="flex items-center gap-5">
          <a
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            Log in
          </a>
          <a href="/signup">
            <Button
              size="sm"
              variant="outline"
              className="border-white/12 hover:border-white/25 hover:bg-white/6 transition-all duration-150"
            >
              Sign up
            </Button>
          </a>
        </div>
      </nav>

      {/* ── Background ── */}
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />
      <div
        className="glow-orb w-[500px] h-[500px] opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, oklch(0.72 0.19 45), transparent 70%)",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      {/* ── Pricing ── */}
      <div className="relative flex-1 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3 animate-hero-fade-up animate-hero-fade-up-1">
            <p className="text-xs font-mono text-primary/80 uppercase tracking-[0.2em]">
              Pricing
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Start free. Upgrade when you need more.
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Simple, transparent pricing. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 animate-hero-fade-up animate-hero-fade-up-2">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-8 space-y-7 flex flex-col card-lift
                  ${tier.popular
                    ? "border border-primary/40 bg-primary/5 shadow-[0_0_40px_-8px_oklch(0.72_0.19_45_/_20%)]"
                    : "border border-white/8 bg-card"
                  }`}
              >
                {tier.popular && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-0.5 rounded-b-lg
                      bg-primary text-primary-foreground text-xs font-bold tracking-wide">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="space-y-1">
                  <h3 className="font-bold text-base">{tier.name}</h3>
                  <p className="text-xs text-muted-foreground">{tier.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black font-mono tabular-nums">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-muted-foreground">
                      {tier.period}
                    </span>
                  )}
                </div>

                <ul className="space-y-2.5 text-sm flex-1">
                  {tier.features.map((f) => (
                    <li
                      key={f.text}
                      className={`flex items-center gap-2.5 ${
                        f.included ? "text-foreground/80" : "text-muted-foreground/30"
                      }`}
                    >
                      {f.included ? (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-emerald-400 shrink-0"
                        >
                          <path
                            d="M13.25 4.75L6 12L2.75 8.75"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-muted-foreground/30 shrink-0"
                        >
                          <path
                            d="M11.25 4.75L4.75 11.25M4.75 4.75L11.25 11.25"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {f.text}
                    </li>
                  ))}
                </ul>

                <a href={tier.href}>
                  <Button
                    variant={tier.popular ? "default" : "outline"}
                    className={`w-full rounded-xl font-semibold transition-all duration-200
                      ${tier.popular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 btn-glow"
                        : "border-white/12 hover:border-white/25 hover:bg-white/6"
                      }`}
                  >
                    {tier.cta} →
                  </Button>
                </a>
              </div>
            ))}
          </div>

          {/* ── FAQ ── */}
          <div className="mt-24 max-w-2xl mx-auto animate-hero-fade-up animate-hero-fade-up-3">
            <div className="text-center mb-12 space-y-3">
              <p className="text-xs font-mono text-primary/80 uppercase tracking-[0.2em]">
                FAQ
              </p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Common questions
              </h2>
            </div>

            <div className="rounded-2xl border border-white/8 bg-card overflow-hidden">
              {[
                {
                  q: "What counts as an audit?",
                  a: "Each individual page URL audited counts as one audit. A site with 5 pages uses 5 audits.",
                },
                {
                  q: "Can I upgrade or downgrade anytime?",
                  a: "Yes. Changes take effect immediately. When upgrading, you get instant access to additional features and audits.",
                },
                {
                  q: "What LLM models do you use?",
                  a: "Free tier uses fast models (Gemini Flash) for the audit pass. Pro and Agency tiers use Claude Sonnet for both audit and optimization passes, providing higher accuracy and better fix suggestions.",
                },
                {
                  q: "Do audits roll over?",
                  a: "No. Audit limits reset each billing cycle. Use them or lose them.",
                },
                {
                  q: "Is there an API?",
                  a: "Not yet. We're focused on the dashboard experience first. API access is on the roadmap.",
                },
              ].map(({ q, a }, i, arr) => (
                <div
                  key={q}
                  className={`px-6 py-5 space-y-2 ${
                    i < arr.length - 1 ? "border-b border-white/6" : ""
                  }`}
                >
                  <h3 className="font-semibold text-sm text-foreground/90">{q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-white/6 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center
          justify-between gap-4 text-xs text-muted-foreground/50">
          <span className="font-mono">
            CRO<span className="text-gradient-cro">audit</span>
          </span>
          <span>&copy; {new Date().getFullYear()} CROaudit. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

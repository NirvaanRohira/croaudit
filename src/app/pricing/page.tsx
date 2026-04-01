"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const tiers = [
  {
    name: "Free",
    price: "$0",
    desc: "Try it out",
    features: [
      { text: "1 audit (total)", included: true },
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
    desc: "For store owners",
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
    desc: "For CRO agencies",
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
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <a href="/" className="font-mono text-sm font-bold tracking-tight">
          CRO<span className="text-muted-foreground">audit</span>
        </a>
        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Log in
          </a>
          <a href="/signup">
            <Button size="sm" variant="outline">
              Sign up
            </Button>
          </a>
        </div>
      </nav>

      <div className="flex-1 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h1 className="text-3xl font-bold">Simple, transparent pricing</h1>
            <p className="text-muted-foreground">
              Start free. Upgrade when you need more audits and deeper insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl p-8 space-y-6 relative ${
                  tier.popular
                    ? "border-2 border-foreground bg-card"
                    : "border border-border bg-card"
                }`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most popular
                  </Badge>
                )}
                <div>
                  <h3 className="font-semibold text-lg">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground">{tier.desc}</p>
                  <div className="mt-3">
                    <span className="text-4xl font-black font-mono">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-muted-foreground text-sm">
                        {tier.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-2.5 text-sm">
                  {tier.features.map((f) => (
                    <li
                      key={f.text}
                      className={`flex items-center gap-2 ${
                        f.included
                          ? "text-foreground"
                          : "text-muted-foreground/40"
                      }`}
                    >
                      {f.included ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="text-emerald-500 shrink-0"
                        >
                          <path
                            d="M13.25 4.75L6 12L2.75 8.75"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="shrink-0"
                        >
                          <path
                            d="M11.25 4.75L4.75 11.25M4.75 4.75L11.25 11.25"
                            stroke="currentColor"
                            strokeWidth="1.5"
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
                    className="w-full"
                  >
                    {tier.cta}
                  </Button>
                </a>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-24 max-w-2xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-center">FAQ</h2>
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
            ].map(({ q, a }) => (
              <div key={q} className="space-y-2">
                <h3 className="font-semibold">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/* ── Score pill shown in the demo scores strip ── */
function ScoreDemo({ score, label }: { score: number; label: string }) {
  const [color, glow] =
    score >= 70
      ? ["text-emerald-400", "shadow-emerald-500/20"]
      : score >= 40
      ? ["text-amber-400", "shadow-amber-500/20"]
      : ["text-red-400", "shadow-red-500/20"];

  return (
    <div
      className={`flex flex-col items-center gap-2 px-5 py-4 rounded-xl border border-white/6
        bg-white/3 shadow-lg ${glow} card-lift`}
    >
      <span className={`font-mono text-3xl font-black tabular-nums ${color}`}>
        {score}
      </span>
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

/* ── Spinner used inside the CTA button ── */
function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    let normalizedUrl = url.trim();
    if (!normalizedUrl) {
      setError("Enter a URL to audit");
      return;
    }

    if (
      !normalizedUrl.startsWith("http://") &&
      !normalizedUrl.startsWith("https://")
    ) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      setError("Enter a valid URL");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/audit/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl, page_type: "home" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push(`/audit/${data.audit_id}`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4
        border-b border-white/6 bg-background/80 backdrop-blur-md">
        <a href="/" className="font-mono text-sm font-bold tracking-tight">
          CRO
          <span className="text-gradient-cro">audit</span>
        </a>
        <div className="flex items-center gap-5">
          <a
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            Pricing
          </a>
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

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center
        px-6 pt-16 sm:pt-24 pb-24 overflow-hidden">

        {/* Atmospheric background */}
        <div className="absolute inset-0 bg-dot-grid opacity-60" />
        <div
          className="glow-orb w-[600px] h-[600px] opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, oklch(0.72 0.19 45), transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -60%)",
          }}
        />
        <div
          className="glow-orb w-[400px] h-[400px] opacity-[0.04]"
          style={{
            background: "radial-gradient(circle, oklch(0.6 0.15 250), transparent 70%)",
            bottom: "0",
            right: "10%",
          }}
        />

        <div className="relative max-w-3xl w-full text-center space-y-8 z-10">
          {/* Badge */}
          <div className="animate-hero-fade-up animate-hero-fade-up-1">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full
              border border-white/10 bg-white/4 text-xs font-mono text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              304 checkpoints &middot; 8 page types &middot; 90 second turnaround
            </span>
          </div>

          {/* Headline */}
          <div className="animate-hero-fade-up animate-hero-fade-up-2 space-y-3">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05]">
              Your store is{" "}
              <br className="hidden sm:block" />
              <span className="text-gradient-danger">leaking conversions.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Paste your URL and get a 304-point CRO audit with your score,
              every failure, and exactly what to fix — in 90 seconds.
            </p>
          </div>

          {/* URL Input Form */}
          <div className="animate-hero-fade-up animate-hero-fade-up-3">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
            >
              <div className="flex-1 relative">
                {/* URL field icon */}
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                  />
                </svg>
                <Input
                  type="text"
                  placeholder="https://your-store.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-13 pl-10 pr-4 font-mono text-sm
                    bg-white/5 border-white/10 hover:border-white/20 focus:border-primary/60
                    placeholder:text-muted-foreground/40 transition-colors duration-150 rounded-xl"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-13 px-7 font-semibold rounded-xl bg-primary text-primary-foreground
                  hover:bg-primary/90 btn-glow transition-all duration-200 shrink-0"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    Auditing...
                  </span>
                ) : (
                  "Audit my store →"
                )}
              </Button>
            </form>

            {error && (
              <p className="text-sm text-red-400 font-medium mt-3">{error}</p>
            )}

            {/* Trust micro-copy */}
            <div className="flex items-center justify-center gap-6 mt-5 text-xs text-muted-foreground/60">
              <span className="flex items-center gap-1.5">
                <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="4" />
                </svg>
                Free instant audit
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span>No signup required</span>
              <span className="w-px h-3 bg-white/10" />
              <span className="font-mono">304 checks</span>
            </div>
          </div>

          {/* Social proof strip */}
          <div className="animate-hero-fade-up animate-hero-fade-up-4">
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full
              border border-white/8 bg-white/3 text-xs text-muted-foreground">
              <div className="flex -space-x-1.5">
                {["F06", "E07", "C08", "A09", "B10"].map((seed) => (
                  <div
                    key={seed}
                    className="w-6 h-6 rounded-full border-2 border-background
                      bg-gradient-to-br from-orange-400 to-amber-600"
                    style={{ background: `hsl(${parseInt(seed, 16) * 7 % 360}, 60%, 55%)` }}
                  />
                ))}
              </div>
              <span>
                <strong className="text-foreground/80 font-semibold">2,400+</strong>
                {" "}stores audited this month
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="relative border-t border-white/6 px-6 py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-xs font-mono text-primary/80 uppercase tracking-[0.2em]">
              Process
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              How it works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/6 rounded-2xl overflow-hidden border border-white/6">
            {[
              {
                step: "01",
                title: "Paste your URL",
                desc: "Enter any e-commerce page. Home, product, category, cart, or checkout — we audit them all with page-type-specific criteria.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "AI audits 304 checkpoints",
                desc: "Our engine crawls your page, runs PageSpeed analysis, and evaluates every CRO best practice against your live storefront.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Get your score + fixes",
                desc: "See your CRO score, top quick wins, and specific fix suggestions. Export as PDF or share a live link with your team.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
              },
            ].map(({ step, title, desc, icon }) => (
              <div
                key={step}
                className="relative bg-card px-8 py-10 space-y-4 group
                  hover:bg-white/3 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20
                    flex items-center justify-center text-primary">
                    {icon}
                  </div>
                  <span className="font-mono text-4xl font-black text-white/5 group-hover:text-white/8 transition-colors">
                    {step}
                  </span>
                </div>
                <h3 className="font-bold text-base">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Score demo ───────────────────────────────────────────────── */}
      <section className="border-t border-white/6 bg-white/2 px-6 py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-xs font-mono text-primary/80 uppercase tracking-[0.2em]">
              Coverage
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Every page type, every metric
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Score your pages across trust, clarity, urgency, navigation,
              and performance — all in one report.
            </p>
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            <ScoreDemo score={82} label="Home" />
            <ScoreDemo score={61} label="Product" />
            <ScoreDemo score={34} label="Cart" />
            <ScoreDemo score={73} label="Category" />
            <ScoreDemo score={45} label="Checkout" />
          </div>

          {/* Feature chips */}
          <div className="mt-12 flex flex-wrap justify-center gap-2">
            {[
              "Trust signals",
              "Page speed",
              "CTA clarity",
              "Mobile UX",
              "Social proof",
              "Urgency tactics",
              "Navigation",
              "Accessibility",
              "Core Web Vitals",
            ].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full border border-white/8 bg-white/3
                  text-xs text-muted-foreground font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <section className="border-t border-white/6 px-6 py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-xs font-mono text-primary/80 uppercase tracking-[0.2em]">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Start free. Upgrade when you need more.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <PricingCard
              name="Free"
              price="$0"
              tagline="One audit, no commitment"
              features={[
                { text: "1 audit", included: true },
                { text: "Score + top 5 quick wins", included: true },
                { text: "PageSpeed analysis", included: true },
                { text: "Full report", included: false },
                { text: "Fix suggestions", included: false },
              ]}
              cta="Get started"
              href="/signup"
              variant="outline"
            />
            <PricingCard
              name="Pro"
              price="$29"
              period="/month"
              tagline="For serious store owners"
              popular
              features={[
                { text: "15 audits/month", included: true },
                { text: "Full audit reports", included: true },
                { text: "AI fix suggestions", included: true },
                { text: "Site crawler", included: true },
                { text: "Weekly monitoring", included: true },
                { text: "PDF export", included: true },
              ]}
              cta="Start Pro"
              href="/signup?plan=pro"
            />
            <PricingCard
              name="Agency"
              price="$99"
              period="/month"
              tagline="For teams and agencies"
              features={[
                { text: "50 audits/month", included: true },
                { text: "Everything in Pro", included: true },
                { text: "White-label reports", included: true },
                { text: "Bulk URL audit", included: true },
                { text: "Priority support", included: true },
              ]}
              cta="Start Agency"
              href="/signup?plan=agency"
              variant="outline"
            />
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-white/6 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center
          justify-between gap-4 text-xs text-muted-foreground/50">
          <span className="font-mono">
            CRO<span className="text-gradient-cro">audit</span>
          </span>
          <span>&copy; {new Date().getFullYear()} CROaudit. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-muted-foreground transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-muted-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── PricingCard ─────────────────────────────────────────────────────── */
function PricingCard({
  name,
  price,
  period,
  tagline,
  popular,
  features,
  cta,
  href,
  variant,
}: {
  name: string;
  price: string;
  period?: string;
  tagline?: string;
  popular?: boolean;
  features: { text: string; included: boolean }[];
  cta: string;
  href: string;
  variant?: "outline" | "default";
}) {
  return (
    <div
      className={`relative rounded-2xl p-8 space-y-7 flex flex-col card-lift
        ${popular
          ? "border border-primary/40 bg-primary/5 shadow-[0_0_40px_-8px_oklch(0.72_0.19_45_/_20%)]"
          : "border border-white/8 bg-card"
        }`}
    >
      {popular && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-0.5 rounded-b-lg
            bg-primary text-primary-foreground text-xs font-bold tracking-wide">
            MOST POPULAR
          </span>
        </div>
      )}

      <div className="space-y-1">
        <h3 className="font-bold text-base">{name}</h3>
        {tagline && (
          <p className="text-xs text-muted-foreground">{tagline}</p>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black font-mono tabular-nums">{price}</span>
        {period && (
          <span className="text-sm text-muted-foreground">{period}</span>
        )}
      </div>

      <ul className="space-y-2.5 text-sm flex-1">
        {features.map((f) => (
          <li
            key={f.text}
            className={`flex items-center gap-2.5 ${
              f.included ? "text-foreground/80" : "text-muted-foreground/30"
            }`}
          >
            {f.included ? <CheckIcon /> : <XIcon />}
            {f.text}
          </li>
        ))}
      </ul>

      <a href={href}>
        <Button
          variant={variant || "default"}
          className={`w-full rounded-xl font-semibold transition-all duration-200
            ${popular
              ? "bg-primary text-primary-foreground hover:bg-primary/90 btn-glow"
              : "border-white/12 hover:border-white/25 hover:bg-white/6"
            }`}
        >
          {cta} →
        </Button>
      </a>
    </div>
  );
}

function CheckIcon() {
  return (
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
  );
}

function XIcon() {
  return (
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
  );
}

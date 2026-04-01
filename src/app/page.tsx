"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function ScoreDemo({ score, label }: { score: number; label: string }) {
  const color =
    score >= 70
      ? "text-emerald-400"
      : score >= 40
      ? "text-amber-400"
      : "text-red-400";

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`font-mono text-3xl font-black tabular-nums ${color}`}>
        {score}
      </span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
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
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <a href="/" className="font-mono text-sm font-bold tracking-tight">
          CRO<span className="text-muted-foreground">audit</span>
        </a>
        <div className="flex items-center gap-4">
          <a
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </a>
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

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-32">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="font-mono text-xs">
              304 checkpoints &middot; 8 page types
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
              Your store is leaking
              <br />
              <span className="text-red-500">conversions.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Paste your URL. Get a 304-point CRO audit with your score,
              failures, and exactly what to fix. Takes 90 seconds.
            </p>
          </div>

          {/* URL Input Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <div className="flex-1">
              <Input
                type="text"
                placeholder="https://your-store.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 font-mono text-sm pl-4 pr-4 bg-muted/50 border-border"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-12 px-8 font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Auditing...
                </span>
              ) : (
                "Audit my store"
              )}
            </Button>
          </form>

          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}

          <div className="flex items-center justify-center gap-8 pt-4 text-sm text-muted-foreground">
            <span className="font-mono">304 checks</span>
            <span className="text-border">|</span>
            <span>Free instant audit</span>
            <span className="text-border">|</span>
            <span>No signup required</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/50 bg-muted/30 px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-16">
            How it works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: 1,
                title: "Paste your URL",
                desc: "Enter any e-commerce page. Home, product, category, cart, checkout \u2014 we audit them all.",
              },
              {
                step: 2,
                title: "AI audits 304 checkpoints",
                desc: "Our engine crawls your page, runs PageSpeed analysis, and evaluates every CRO best practice with AI.",
              },
              {
                step: 3,
                title: "Get your score + fixes",
                desc: "See your CRO score, quick wins, and specific fix suggestions. Export as PDF or share with your team.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-foreground text-background font-mono font-bold text-sm">
                  {step}
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Score demo */}
      <section className="border-t border-border/50 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold">
              Every page type, every metric
            </h2>
            <p className="text-muted-foreground">
              Score your pages across trust, clarity, urgency, navigation, and
              more.
            </p>
          </div>
          <div className="flex justify-center gap-12 flex-wrap">
            <ScoreDemo score={82} label="Home" />
            <ScoreDemo score={61} label="Product" />
            <ScoreDemo score={34} label="Cart" />
            <ScoreDemo score={73} label="Category" />
            <ScoreDemo score={45} label="Checkout" />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border/50 bg-muted/30 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">Pricing</h2>
          <p className="text-center text-muted-foreground mb-16">
            Start free. Upgrade when you need more.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              name="Free"
              price="$0"
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

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-mono text-xs">
            CRO<span className="opacity-50">audit</span>
          </span>
          <span>&copy; {new Date().getFullYear()} CROaudit</span>
        </div>
      </footer>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  popular,
  features,
  cta,
  href,
  variant,
}: {
  name: string;
  price: string;
  period?: string;
  popular?: boolean;
  features: { text: string; included: boolean }[];
  cta: string;
  href: string;
  variant?: "outline" | "default";
}) {
  return (
    <div
      className={`rounded-xl p-8 space-y-6 relative ${
        popular
          ? "border-2 border-foreground bg-card"
          : "border border-border bg-card"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most popular
        </Badge>
      )}
      <div>
        <h3 className="font-semibold text-lg">{name}</h3>
        <div className="mt-2">
          <span className="text-3xl font-black font-mono">{price}</span>
          {period && (
            <span className="text-muted-foreground text-sm">{period}</span>
          )}
        </div>
      </div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {features.map((f) => (
          <li
            key={f.text}
            className={`flex items-center gap-2 ${
              f.included ? "" : "opacity-40"
            }`}
          >
            {f.included ? <CheckIcon /> : <XIcon />} {f.text}
          </li>
        ))}
      </ul>
      <a href={href}>
        <Button variant={variant || "default"} className="w-full">
          {cta}
        </Button>
      </a>
    </div>
  );
}

function CheckIcon() {
  return (
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
  );
}

function XIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="text-muted-foreground/50 shrink-0"
    >
      <path
        d="M11.25 4.75L4.75 11.25M4.75 4.75L11.25 11.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

interface AuditStatus {
  id: string;
  status: string;
  score: number | null;
  performance_score: number | null;
  accessibility_score: number | null;
}

interface AuditReport {
  id: string;
  status: string;
  score: number | null;
  pass_count: number | null;
  fail_count: number | null;
  unable_count: number | null;
  total_items: number | null;
  performance_score: number | null;
  accessibility_score: number | null;
  mobile_friendly: boolean | null;
  core_web_vitals: {
    fcp: number | null;
    lcp: number | null;
    tbt: number | null;
    cls: number | null;
  } | null;
  audit_results: AuditResultItem[] | null;
  quick_wins: AuditResultItem[] | null;
  suggestions: unknown[] | null;
  pages: { url: string; page_type: string } | null;
}

interface AuditResultItem {
  item: string;
  section: string;
  status: "PASS" | "FAIL" | "UNABLE TO VERIFY";
  explanation: string;
  impact: number;
}

/* ── Animated SVG score ring ────────────────────────────────────────── */
function ScoreCircle({ score }: { score: number }) {
  const size = 160;
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const dashoffset = circumference * (1 - progress);

  const [colorStart, colorEnd, textColor] =
    score >= 70
      ? ["#34d399", "#10b981", "text-emerald-400"]
      : score >= 40
      ? ["#fbbf24", "#f59e0b", "text-amber-400"]
      : ["#f87171", "#ef4444", "text-red-400"];

  const gradId = `score-grad-${score}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Ambient glow behind the ring */}
      <div
        className="absolute inset-0 rounded-full opacity-20 blur-xl"
        style={{
          background: `radial-gradient(circle, ${colorStart}, transparent 70%)`,
        }}
      />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorStart} />
            <stop offset="100%" stopColor={colorEnd} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(1 0 0 / 6%)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          className="animate-score-ring"
          style={
            {
              "--ring-circumference": circumference,
              "--ring-target": dashoffset,
            } as React.CSSProperties
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-mono text-5xl font-black tabular-nums leading-none ${textColor}`}
        >
          {score}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest mt-1">
          CRO Score
        </span>
      </div>
    </div>
  );
}

/* ── Impact indicator ───────────────────────────────────────────────── */
function ImpactDots({ impact }: { impact: number }) {
  return (
    <span className="inline-flex gap-1 items-center">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            i <= impact
              ? impact === 3
                ? "bg-red-400"
                : impact === 2
                ? "bg-amber-400"
                : "bg-muted-foreground/60"
              : "bg-white/8"
          }`}
        />
      ))}
    </span>
  );
}

/* ── Status badge ───────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  if (status === "PASS") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md
        bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold tracking-wide">
        PASS
      </span>
    );
  }
  if (status === "FAIL") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md
        bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-mono font-bold tracking-wide">
        FAIL
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md
      bg-white/6 text-muted-foreground border border-white/10 text-[10px] font-mono font-bold tracking-wide">
      N/A
    </span>
  );
}

/* ── Nav shared ─────────────────────────────────────────────────────── */
function AuditNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4
      border-b border-white/6 bg-background/80 backdrop-blur-md">
      <a href={isLoggedIn ? "/dashboard" : "/"} className="font-mono text-sm font-bold tracking-tight">
        CRO<span className="text-gradient-cro">audit</span>
      </a>
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <a href="/dashboard">
            <Button
              size="sm"
              variant="outline"
              className="border-white/12 hover:border-white/25 transition-colors"
            >
              Dashboard
            </Button>
          </a>
        ) : (
          <a href="/signup">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign up to unlock full report
            </Button>
          </a>
        )}
      </div>
    </nav>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function AuditReportPage() {
  const params = useParams();
  const auditId = params.id as string;

  const [status, setStatus] = useState<AuditStatus | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPaidUser, setIsPaidUser] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setIsLoggedIn(true);
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan, subscription_status")
        .eq("id", user.id)
        .single();
      if (
        profile &&
        (profile.plan === "pro" || profile.plan === "agency") &&
        profile.subscription_status === "active"
      ) {
        setIsPaidUser(true);
      }
    }
    checkUser();
  }, []);

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/audit/${auditId}/status`);
      if (!res.ok) {
        setError("Audit not found");
        return false;
      }
      const data: AuditStatus = await res.json();
      setStatus(data);
      return data.status === "complete" || data.status === "failed";
    } catch {
      return false;
    }
  }, [auditId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    async function startPolling() {
      const done = await pollStatus();
      if (!done) {
        interval = setInterval(async () => {
          const finished = await pollStatus();
          if (finished) clearInterval(interval);
        }, 3000);
      }
    }
    startPolling();
    return () => clearInterval(interval);
  }, [pollStatus]);

  useEffect(() => {
    if (status?.status === "complete") {
      fetch(`/api/audit/${auditId}/report`)
        .then((r) => r.json())
        .then((data) => setReport(data))
        .catch(() => setError("Failed to load report"));
    }
  }, [status?.status, auditId]);

  /* ── Error state ── */
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AuditNav isLoggedIn={isLoggedIn} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20
              flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="font-semibold text-foreground/80">{error}</p>
            <a href="/">
              <Button
                variant="outline"
                className="border-white/12 hover:border-white/25"
              >
                Try again
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ── Loading / pending state ── */
  if (!status || status.status === "pending" || status.status === "auditing") {
    return (
      <div className="min-h-screen bg-background">
        <AuditNav isLoggedIn={isLoggedIn} />
        <div className="max-w-lg mx-auto px-6 py-32 text-center space-y-10">
          {/* Animated loader ring */}
          <div className="relative inline-flex items-center justify-center">
            <div
              className="absolute w-28 h-28 rounded-full opacity-20 blur-2xl"
              style={{ background: "radial-gradient(circle, oklch(0.72 0.19 45), transparent 70%)" }}
            />
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="oklch(1 0 0 / 8%)" strokeWidth="4" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke="oklch(0.72 0.19 45)" strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="213"
                strokeDashoffset="53"
                className="animate-spin"
                style={{ animationDuration: "1.4s" }}
              />
            </svg>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-black tracking-tight">
              Auditing your page
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Running 304 CRO checks. This usually takes 60–90 seconds.
            </p>
          </div>

          {/* Progress steps */}
          <div className="space-y-2 text-left max-w-xs mx-auto">
            <LoadingStep done label="Fetching page..." />
            <LoadingStep done={status?.status === "auditing"} active={status?.status === "auditing"} label="Running PageSpeed analysis..." />
            {status?.performance_score != null && (
              <LoadingStep done label={`PageSpeed: ${status.performance_score}/100`} />
            )}
            <LoadingStep active={status?.status === "auditing"} label="AI analyzing 304 checkpoints..." />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-full rounded-full bg-white/5" />
            <Skeleton className="h-3 w-4/5 rounded-full bg-white/4" />
            <Skeleton className="h-3 w-2/3 rounded-full bg-white/3" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Failed state ── */
  if (status.status === "failed") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AuditNav isLoggedIn={isLoggedIn} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <p className="font-semibold text-red-400">
              Audit failed. The page might be unreachable or protected.
            </p>
            <a href="/">
              <Button
                variant="outline"
                className="border-white/12 hover:border-white/25"
              >
                Try another URL
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ── Waiting for report data ── */
  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  /* ── Group results by section ── */
  const groupedResults: Record<string, AuditResultItem[]> = {};
  if (report.audit_results) {
    for (const item of report.audit_results) {
      const section = item.section || "General";
      if (!groupedResults[section]) groupedResults[section] = [];
      groupedResults[section].push(item);
    }
  }

  /* ── Score label ── */
  const scoreLabel =
    (report.score || 0) >= 70
      ? "Good"
      : (report.score || 0) >= 40
      ? "Needs work"
      : "Critical";

  const scoreLabelColor =
    (report.score || 0) >= 70
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : (report.score || 0) >= 40
      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
      : "text-red-400 bg-red-500/10 border-red-500/20";

  return (
    <div className="min-h-screen bg-background">
      <AuditNav isLoggedIn={isLoggedIn} />

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-10">

        {/* ── Score header ── */}
        <div className="relative rounded-2xl border border-white/8 bg-card overflow-hidden p-10">
          {/* Glow effect behind score */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 opacity-10 blur-3xl pointer-events-none"
            style={{
              background:
                (report.score || 0) >= 70
                  ? "radial-gradient(circle, #34d399, transparent 70%)"
                  : (report.score || 0) >= 40
                  ? "radial-gradient(circle, #fbbf24, transparent 70%)"
                  : "radial-gradient(circle, #f87171, transparent 70%)",
            }}
          />
          <div className="relative flex flex-col md:flex-row items-center gap-10">
            {/* Score ring */}
            <div className="shrink-0">
              <ScoreCircle score={report.score || 0} />
            </div>

            {/* Metadata */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="space-y-1">
                <p className="font-mono text-xs text-muted-foreground/60 break-all">
                  {report.pages?.url}
                </p>
                <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-xs font-bold ${scoreLabelColor}`}>
                    {scoreLabel}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-xs capitalize border-white/10 bg-white/5"
                  >
                    {report.pages?.page_type || "home"} page
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto md:mx-0">
                <div className="text-center md:text-left">
                  <p className="text-xl font-black font-mono text-emerald-400">
                    {report.pass_count}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mt-0.5">
                    Passed
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xl font-black font-mono text-red-400">
                    {report.fail_count}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mt-0.5">
                    Failed
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xl font-black font-mono text-muted-foreground/50">
                    {report.unable_count}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mt-0.5">
                    Unverified
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PageSpeed metrics ── */}
        {(report.performance_score != null ||
          report.accessibility_score != null) && (
          <div className="rounded-2xl border border-white/8 bg-card overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-white/6">
              <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
                PageSpeed Insights
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/6">
              <MetricCell
                label="Performance"
                value={report.performance_score}
                suffix="/100"
                highlight
              />
              <MetricCell
                label="Accessibility"
                value={report.accessibility_score}
                suffix="/100"
                highlight
              />
              <MetricCell
                label="LCP"
                value={
                  report.core_web_vitals?.lcp
                    ? `${(report.core_web_vitals.lcp / 1000).toFixed(1)}s`
                    : null
                }
              />
              <MetricCell
                label="CLS"
                value={
                  report.core_web_vitals?.cls != null
                    ? report.core_web_vitals.cls.toFixed(3)
                    : null
                }
              />
            </div>
          </div>
        )}

        {/* ── Quick wins ── */}
        {report.quick_wins && report.quick_wins.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-card overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-white/6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
                  Top Quick Wins
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Highest-impact issues to fix first
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md
                bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold">
                {report.quick_wins.length} issues
              </span>
            </div>
            <div className="divide-y divide-white/6">
              {report.quick_wins.map((item, i) => (
                <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-white/2 transition-colors">
                  <span className="font-mono text-xs text-muted-foreground/40 w-5 shrink-0 pt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={item.status} />
                      <ImpactDots impact={item.impact} />
                      <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">
                        {item.section}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-snug">{item.item}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="bg-white/6" />

        {/* ── Full results — paid vs paywall ── */}
        {isPaidUser ? (
          <div className="space-y-8">
            <h2 className="text-base font-bold uppercase tracking-wider text-foreground/60">
              Full Audit Results
            </h2>

            {Object.entries(groupedResults).map(([section, items]) => (
              <div
                key={section}
                className="rounded-2xl border border-white/8 bg-card overflow-hidden"
              >
                <div className="px-6 py-3.5 border-b border-white/6 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    {section}
                  </h3>
                  <span className="text-xs font-mono text-muted-foreground/40">
                    {items.length} checks
                  </span>
                </div>
                <div className="divide-y divide-white/4">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 px-6 py-3.5 hover:bg-white/2 transition-colors"
                    >
                      <StatusBadge status={item.status} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground/85">{item.item}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {item.explanation}
                        </p>
                      </div>
                      <ImpactDots impact={item.impact} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* AI suggestions */}
            {report.suggestions && report.suggestions.length > 0 && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-primary/10">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
                      AI Optimization Suggestions
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Personalized recommendations to improve your conversion rate
                  </p>
                </div>
                <div className="divide-y divide-primary/8">
                  {report.suggestions.map((suggestion: unknown, i: number) => {
                    const s = suggestion as Record<string, unknown>;
                    return (
                      <div
                        key={i}
                        className="px-6 py-4 hover:bg-primary/5 transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground/85">
                          {(s.title as string) ||
                            (s.suggestion as string) ||
                            String(suggestion)}
                        </p>
                        {s.description ? (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {String(s.description)}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── Paywall ── */
          <div className="relative">
            {/* Blurred preview */}
            <div className="blur-sm pointer-events-none select-none space-y-8 opacity-60">
              <h2 className="text-base font-bold uppercase tracking-wider text-foreground/60">
                Full Audit Results
              </h2>
              {Object.entries(groupedResults)
                .slice(0, 3)
                .map(([section, items]) => (
                  <div
                    key={section}
                    className="rounded-2xl border border-white/8 bg-card overflow-hidden"
                  >
                    <div className="px-6 py-3.5 border-b border-white/6">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                        {section}
                      </h3>
                    </div>
                    <div className="divide-y divide-white/4">
                      {items.slice(0, 4).map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 px-6 py-3.5"
                        >
                          <StatusBadge status={item.status} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{item.item}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.explanation}
                            </p>
                          </div>
                          <ImpactDots impact={item.impact} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            {/* Upgrade overlay */}
            <div className="absolute inset-0 flex items-end justify-center
              bg-gradient-to-b from-transparent via-background/60 to-background pb-8">
              <div className="w-full max-w-md mx-auto">
                <div className="rounded-2xl border border-primary/25 bg-card/95 backdrop-blur-sm
                  shadow-[0_0_60px_-10px_oklch(0.72_0.19_45_/_30%)] p-8 text-center space-y-5">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20
                    flex items-center justify-center mx-auto">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight">
                      Unlock the full report
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Sign up to see all{" "}
                      <strong className="text-foreground/80">
                        {report.total_items}
                      </strong>{" "}
                      audit results with detailed explanations, plus
                      AI-powered fix suggestions.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <a href="/signup">
                      <Button
                        size="lg"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 btn-glow font-semibold rounded-xl"
                      >
                        Sign up free →
                      </Button>
                    </a>
                    <a href="/pricing">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white/12 hover:border-white/25 rounded-xl"
                      >
                        View plans
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Metric cell for PageSpeed grid ─────────────────────────────────── */
function MetricCell({
  label,
  value,
  suffix,
  highlight,
}: {
  label: string;
  value: number | string | null | undefined;
  suffix?: string;
  highlight?: boolean;
}) {
  const numVal = typeof value === "number" ? value : null;
  const scoreColor =
    numVal != null
      ? numVal >= 70
        ? "text-emerald-400"
        : numVal >= 40
        ? "text-amber-400"
        : "text-red-400"
      : "";

  return (
    <div className="bg-card px-6 py-5 space-y-1">
      <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">
        {label}
      </p>
      <p
        className={`font-mono text-2xl font-black tabular-nums leading-none
          ${highlight && numVal != null ? scoreColor : "text-foreground/85"}`}
      >
        {value != null ? (
          <>
            {value}
            {suffix && (
              <span className="text-xs text-muted-foreground/40 font-normal">
                {suffix}
              </span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground/30 text-lg">--</span>
        )}
      </p>
    </div>
  );
}

/* ── Loading step indicator ─────────────────────────────────────────── */
function LoadingStep({
  label,
  done,
  active,
}: {
  label: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          done
            ? "bg-emerald-400"
            : active
            ? "bg-primary animate-pulse"
            : "bg-white/15"
        }`}
      />
      <span
        className={
          done
            ? "text-foreground/60 line-through"
            : active
            ? "text-foreground/80"
            : "text-muted-foreground/40"
        }
      >
        {label}
      </span>
    </div>
  );
}


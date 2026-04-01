"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function ScoreCircle({ score }: { score: number }) {
  const color =
    score >= 70
      ? "text-emerald-500 border-emerald-500/30"
      : score >= 40
      ? "text-amber-500 border-amber-500/30"
      : "text-red-500 border-red-500/30";

  return (
    <div
      className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${color}`}
    >
      <span className="font-mono text-5xl font-black tabular-nums">{score}</span>
    </div>
  );
}

function ImpactDots({ impact }: { impact: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i <= impact ? "bg-foreground" : "bg-muted-foreground/30"
          }`}
        />
      ))}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "PASS") {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
        PASS
      </Badge>
    );
  }
  if (status === "FAIL") {
    return (
      <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">
        FAIL
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs">
      UNABLE
    </Badge>
  );
}

export default function AuditReportPage() {
  const params = useParams();
  const auditId = params.id as string;

  const [status, setStatus] = useState<AuditStatus | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPaidUser, setIsPaidUser] = useState(false);

  // Check auth and profile
  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
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

  // Fetch full report when complete
  useEffect(() => {
    if (status?.status === "complete") {
      fetch(`/api/audit/${auditId}/report`)
        .then((r) => r.json())
        .then((data) => setReport(data))
        .catch(() => setError("Failed to load report"));
    }
  }, [status?.status, auditId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-red-500">{error}</p>
          <a href="/">
            <Button variant="outline">Try again</Button>
          </a>
        </div>
      </div>
    );
  }

  // Loading / pending state
  if (!status || status.status === "pending" || status.status === "auditing") {
    return (
      <div className="min-h-screen bg-background">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <a href="/" className="font-mono text-sm font-bold tracking-tight">
            CRO<span className="text-muted-foreground">audit</span>
          </a>
        </nav>
        <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-bold">Auditing your page...</h1>
            <p className="text-muted-foreground">
              Running 304 CRO checks. This usually takes 60-90 seconds.
            </p>
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            {status?.status === "auditing" && (
              <div className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>AI is analyzing your page...</span>
              </div>
            )}
            {status?.performance_score != null && (
              <div className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  PageSpeed: {status.performance_score}/100
                </span>
              </div>
            )}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  if (status.status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-red-500">
            Audit failed. The page might be unreachable or protected.
          </p>
          <a href="/">
            <Button variant="outline">Try another URL</Button>
          </a>
        </div>
      </div>
    );
  }

  // Report loaded
  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  const groupedResults: Record<string, AuditResultItem[]> = {};
  if (report.audit_results) {
    for (const item of report.audit_results) {
      const section = item.section || "General";
      if (!groupedResults[section]) groupedResults[section] = [];
      groupedResults[section].push(item);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <a href="/" className="font-mono text-sm font-bold tracking-tight">
          CRO<span className="text-muted-foreground">audit</span>
        </a>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <a href="/dashboard">
              <Button size="sm" variant="outline">Dashboard</Button>
            </a>
          ) : (
            <a href="/signup">
              <Button size="sm">Sign up to unlock full report</Button>
            </a>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Score header */}
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-mono">
              {report.pages?.url}
            </p>
            <Badge variant="secondary" className="text-xs">
              {report.pages?.page_type || "home"} page
            </Badge>
          </div>

          <ScoreCircle score={report.score || 0} />

          <div className="flex items-center justify-center gap-6 text-sm">
            <span className="text-emerald-600 font-mono">
              {report.pass_count} passed
            </span>
            <span className="text-red-600 font-mono">
              {report.fail_count} failed
            </span>
            <span className="text-muted-foreground font-mono">
              {report.unable_count} unverified
            </span>
          </div>
        </div>

        {/* PageSpeed metrics */}
        {(report.performance_score != null || report.accessibility_score != null) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">PageSpeed Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <MetricItem
                  label="Performance"
                  value={report.performance_score}
                  suffix="/100"
                />
                <MetricItem
                  label="Accessibility"
                  value={report.accessibility_score}
                  suffix="/100"
                />
                <MetricItem
                  label="LCP"
                  value={
                    report.core_web_vitals?.lcp
                      ? `${(report.core_web_vitals.lcp / 1000).toFixed(1)}s`
                      : null
                  }
                />
                <MetricItem
                  label="CLS"
                  value={
                    report.core_web_vitals?.cls != null
                      ? report.core_web_vitals.cls.toFixed(3)
                      : null
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick wins */}
        {report.quick_wins && report.quick_wins.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Top Quick Wins
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Highest-impact issues to fix first
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.quick_wins.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0"
                >
                  <span className="font-mono text-sm text-muted-foreground w-6 shrink-0">
                    {i + 1}.
                  </span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status} />
                      <ImpactDots impact={item.impact} />
                    </div>
                    <p className="text-sm font-medium">{item.item}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Full results - shown fully for paid users, blurred for free */}
        {isPaidUser ? (
          <div>
            <h2 className="text-lg font-bold mb-6">Full Audit Results</h2>
            {Object.entries(groupedResults).map(([section, items]) => (
              <div key={section} className="mb-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  {section}
                </h3>
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 py-2 border-b border-border/30"
                  >
                    <StatusBadge status={item.status} />
                    <div className="flex-1">
                      <p className="text-sm">{item.item}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.explanation}
                      </p>
                    </div>
                    <ImpactDots impact={item.impact} />
                  </div>
                ))}
              </div>
            ))}

            {/* Optimization suggestions for paid users */}
            {report.suggestions && report.suggestions.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-base">
                    AI Optimization Suggestions
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Personalized recommendations to improve your conversion rate
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report.suggestions.map((suggestion: unknown, i: number) => {
                    const s = suggestion as Record<string, unknown>;
                    return (
                      <div
                        key={i}
                        className="py-3 border-b border-border/50 last:border-0"
                      >
                        <p className="text-sm font-medium">
                          {(s.title as string) || (s.suggestion as string) || String(suggestion)}
                        </p>
                        {s.description ? (
                          <p className="text-xs text-muted-foreground mt-1">
                            {String(s.description)}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="relative">
            <div className="blur-sm pointer-events-none select-none">
              <h2 className="text-lg font-bold mb-6">Full Audit Results</h2>
              {Object.entries(groupedResults)
                .slice(0, 3)
                .map(([section, items]) => (
                  <div key={section} className="mb-8">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                      {section}
                    </h3>
                    {items.slice(0, 5).map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 py-2 border-b border-border/30"
                      >
                        <StatusBadge status={item.status} />
                        <div className="flex-1">
                          <p className="text-sm">{item.item}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.explanation}
                          </p>
                        </div>
                        <ImpactDots impact={item.impact} />
                      </div>
                    ))}
                  </div>
                ))}
            </div>

            {/* Upgrade CTA overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-background/0 via-background/80 to-background">
              <div className="text-center space-y-4 p-8">
                <h3 className="text-xl font-bold">
                  Unlock the full report
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  Sign up to see all {report.total_items} audit results with detailed
                  explanations, plus AI-powered fix suggestions.
                </p>
                <div className="flex gap-3 justify-center">
                  <a href="/signup">
                    <Button size="lg">
                      Sign up free
                    </Button>
                  </a>
                  <a href="/pricing">
                    <Button size="lg" variant="outline">
                      View plans
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricItem({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number | string | null | undefined;
  suffix?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="font-mono text-lg font-bold tabular-nums">
        {value != null ? (
          <>
            {value}
            {suffix && (
              <span className="text-xs text-muted-foreground font-normal">
                {suffix}
              </span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground">--</span>
        )}
      </p>
    </div>
  );
}

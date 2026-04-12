"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Site, Page, Audit } from "@/lib/supabase/types";

const PAGE_TYPES = [
  "home",
  "product",
  "category",
  "landing",
  "cart",
  "checkout",
  "thank_you",
  "general",
];

/* ── Score pill ───────────────────────────────────────────────────────── */
function ScoreColor({ score }: { score: number | null }) {
  if (score == null)
    return <span className="font-mono text-muted-foreground/40">--</span>;
  const [color, bg, border] =
    score >= 70
      ? ["text-emerald-400", "bg-emerald-500/10", "border-emerald-500/20"]
      : score >= 40
      ? ["text-amber-400", "bg-amber-500/10", "border-amber-500/20"]
      : ["text-red-400", "bg-red-500/10", "border-red-500/20"];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md border
        font-mono text-sm font-black tabular-nums ${color} ${bg} ${border}`}
    >
      {score}
    </span>
  );
}

/* ── Status badge ─────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-xs text-muted-foreground/40">Not audited</span>;

  const styles =
    status === "complete"
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : status === "failed"
      ? "text-red-400 bg-red-500/10 border-red-500/20"
      : "text-amber-400 bg-amber-500/10 border-amber-500/20";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-bold capitalize ${styles}`}>
      {status}
    </span>
  );
}

export default function SiteDetailPage() {
  const params = useParams();
  const siteId = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [site, setSite] = useState<Site | null>(null);
  const [pages, setPages] = useState<(Page & { latest_audit?: Audit })[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState("product");
  const [scanning, setScanning] = useState(false);
  const [auditingAll, setAuditingAll] = useState(false);
  const [auditingPage, setAuditingPage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: siteData } = await supabase
        .from("sites")
        .select("*")
        .eq("id", siteId)
        .single();

      if (!siteData) {
        router.push("/dashboard");
        return;
      }

      setSite(siteData);

      const { data: pagesData } = await supabase
        .from("pages")
        .select("*")
        .eq("site_id", siteId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (pagesData) {
        const pagesWithAudits = await Promise.all(
          pagesData.map(async (page) => {
            const { data: audit } = await supabase
              .from("audits")
              .select("*")
              .eq("page_id", page.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            return { ...page, latest_audit: audit || undefined };
          })
        );
        setPages(pagesWithAudits);
      }

      setLoading(false);
    }
    load();
  }, [siteId, router, supabase]);

  async function handleAddPage() {
    let url = newUrl.trim();
    if (!url) return;

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    const { data, error } = await supabase
      .from("pages")
      .insert({
        site_id: siteId,
        url,
        page_type: newType,
        classification_confidence: 1.0,
      })
      .select()
      .single();

    if (!error && data) {
      setPages([{ ...data, latest_audit: undefined }, ...pages]);
      setNewUrl("");
    }
  }

  async function handleRunAudit(pageId: string, url: string, pageType: string) {
    setAuditingPage(pageId);
    try {
      const res = await fetch("/api/audit/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, page_type: pageType, page_id: pageId, site_id: siteId }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/audit/${data.audit_id}`);
      } else {
        alert(data.error || "Failed to start audit");
      }
    } catch {
      alert("Failed to start audit");
    } finally {
      setAuditingPage(null);
    }
  }

  async function handleAuditAll() {
    const unaudited = pages.filter(
      (p) => !p.latest_audit || p.latest_audit.status === "failed"
    );
    if (unaudited.length === 0) {
      alert("All pages have already been audited.");
      return;
    }

    setAuditingAll(true);

    const first = unaudited[0];
    for (let i = 1; i < unaudited.length; i++) {
      const p = unaudited[i];
      fetch("/api/audit/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: p.url,
          page_type: p.page_type,
          page_id: p.id,
          site_id: siteId,
        }),
      }).catch(() => {});
    }

    try {
      const res = await fetch("/api/audit/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: first.url,
          page_type: first.page_type,
          page_id: first.id,
          site_id: siteId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/audit/${data.audit_id}`);
      }
    } catch {
      alert("Failed to start audits");
    } finally {
      setAuditingAll(false);
    }
  }

  async function handleScanSite() {
    if (!site) return;
    setScanning(true);

    try {
      const res = await fetch(`/api/sites/${siteId}/crawl`, {
        method: "POST",
      });
      if (res.ok) {
        router.push(`/sites/${siteId}/scan`);
      }
    } catch {
      setScanning(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const unauditedCount = pages.filter(p => !p.latest_audit || p.latest_audit.status === "failed").length;

  // Aggregate score stats
  const completedPages = pages.filter(p => p.latest_audit?.status === "complete");
  const avgScore = completedPages.length > 0
    ? Math.round(completedPages.reduce((sum, p) => sum + (p.latest_audit?.score || 0), 0) / completedPages.length)
    : null;

  // Page type breakdown
  const typeBreakdown: { type: string; count: number; avgScore: number }[] = [];
  if (completedPages.length > 0) {
    const grouped = new Map<string, number[]>();
    for (const page of completedPages) {
      const scores = grouped.get(page.page_type) || [];
      scores.push(page.latest_audit?.score || 0);
      grouped.set(page.page_type, scores);
    }
    for (const [type, scores] of grouped) {
      typeBreakdown.push({
        type,
        count: scores.length,
        avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      });
    }
    typeBreakdown.sort((a, b) => b.count - a.count);
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* ── Background ── */}
      <div className="fixed inset-0 bg-dot-grid opacity-30 pointer-events-none" />

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4
        border-b border-white/6 bg-background/80 backdrop-blur-md">
        <a href="/dashboard" className="font-mono text-sm font-bold tracking-tight">
          CRO<span className="text-gradient-cro">audit</span>
        </a>
        <div className="flex items-center gap-4">
          <a
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            Dashboard
          </a>
        </div>
      </nav>

      <div className="relative max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight">
              {site?.name || site?.domain}
            </h1>
            <p className="text-sm text-muted-foreground/50 font-mono">
              {site?.domain}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {pages.length > 0 && unauditedCount > 0 && (
              <Button
                onClick={handleAuditAll}
                disabled={auditingAll}
                className="rounded-xl bg-primary text-primary-foreground
                  hover:bg-primary/90 font-semibold btn-glow"
              >
                {auditingAll ? "Starting..." : `Audit all (${unauditedCount})`}
              </Button>
            )}
            <Button
              onClick={handleScanSite}
              variant="outline"
              disabled={scanning}
              className="rounded-xl border-white/12 hover:border-white/25
                hover:bg-white/6 transition-all duration-150"
            >
              {scanning ? "Scanning..." : "Scan site"}
            </Button>
          </div>
        </div>

        {/* ── Score overview (only when audits exist) ── */}
        {avgScore !== null && (
          <div className="rounded-2xl border border-white/8 bg-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Big score ring */}
              <div className="relative w-24 h-24 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor"
                    className="text-white/8" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none"
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(avgScore / 100) * 264} 264`}
                    className={`score-ring-draw ${
                      avgScore >= 70 ? "text-emerald-400" : avgScore >= 40 ? "text-amber-400" : "text-red-400"
                    }`}
                    stroke="currentColor" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`font-mono text-2xl font-black tabular-nums ${
                    avgScore >= 70 ? "text-emerald-400" : avgScore >= 40 ? "text-amber-400" : "text-red-400"
                  }`}>
                    {avgScore}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 grid grid-cols-3 gap-4 text-center sm:text-left">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">
                    Total pages
                  </p>
                  <p className="font-mono text-xl font-black tabular-nums">{pages.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">
                    Audited
                  </p>
                  <p className="font-mono text-xl font-black tabular-nums">{completedPages.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">
                    Avg score
                  </p>
                  <p className={`font-mono text-xl font-black tabular-nums ${
                    avgScore >= 70 ? "text-emerald-400" : avgScore >= 40 ? "text-amber-400" : "text-red-400"
                  }`}>
                    {avgScore}
                  </p>
                </div>
              </div>
            </div>

            {/* Type breakdown */}
            {typeBreakdown.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                  By page type
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {typeBreakdown.map(({ type, count, avgScore: typeAvg }) => (
                    <div key={type} className="rounded-xl border border-white/8 bg-white/3 px-3 py-2.5
                      flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold capitalize truncate">
                          {type.replace("_", " ")}
                        </p>
                        <p className="text-[10px] text-muted-foreground/40">{count} page{count !== 1 ? "s" : ""}</p>
                      </div>
                      <ScoreColor score={typeAvg} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Add page ── */}
        <div className="rounded-2xl border border-white/8 bg-card p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
            Add a page
          </h3>
          <div className="flex gap-3">
            <Input
              placeholder={`https://${site?.domain}/product/example`}
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 font-mono text-sm h-11 rounded-xl bg-white/5 border-white/10
                hover:border-white/20 focus:border-primary/60 placeholder:text-muted-foreground/30
                transition-colors duration-150"
              onKeyDown={(e) => e.key === "Enter" && handleAddPage()}
            />
            <Select value={newType} onValueChange={(v) => { if (v) setNewType(v) }}>
              <SelectTrigger className="w-36 h-11 rounded-xl bg-white/5 border-white/10
                hover:border-white/20 transition-colors duration-150">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-white/10 bg-card">
                {PAGE_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddPage}
              className="rounded-xl bg-primary text-primary-foreground
                hover:bg-primary/90 font-semibold h-11 px-5"
            >
              Add →
            </Button>
          </div>
        </div>

        {/* ── Pages list ── */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
            Pages ({pages.length})
          </h2>

          {pages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-card
              py-20 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10
                flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground/60">No pages yet</p>
                <p className="text-xs text-muted-foreground/40">
                  Add a URL above or scan the entire site
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-card overflow-hidden">
              <div className="divide-y divide-white/6">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center justify-between px-6 py-4
                      hover:bg-white/3 transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Page type badge */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md border
                        border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-wide
                        text-muted-foreground/60 shrink-0 w-20 justify-center capitalize">
                        {page.page_type.replace("_", " ")}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-mono text-foreground/70 truncate">
                          {page.url}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 shrink-0 ml-4">
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-0.5">
                          Score
                        </p>
                        <ScoreColor score={page.latest_audit?.score ?? null} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-0.5">
                          Status
                        </p>
                        <StatusBadge status={page.latest_audit?.status} />
                      </div>
                      <div className="flex gap-2">
                        {page.latest_audit?.status === "complete" && (
                          <a href={`/audit/${page.latest_audit.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-foreground
                                hover:bg-white/6 rounded-lg text-xs"
                            >
                              View
                            </Button>
                          </a>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={auditingPage === page.id}
                          onClick={() =>
                            handleRunAudit(page.id, page.url, page.page_type)
                          }
                          className="rounded-lg border-white/12 hover:border-white/25
                            hover:bg-white/6 text-xs"
                        >
                          {auditingPage === page.id ? "Starting..." : "Audit"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

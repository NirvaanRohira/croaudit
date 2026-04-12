"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DiscoveredPage {
  url: string;
  suggested_type: string;
  confidence: number;
  selected: boolean;
  override_type: string;
}

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

const VISIBLE_PER_PAGE = 50;

export default function ScanPage() {
  const params = useParams();
  const siteId = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [crawlStatus, setCrawlStatus] = useState<string>("crawling");
  const [pages, setPages] = useState<DiscoveredPage[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(VISIBLE_PER_PAGE);

  const pollCrawl = useCallback(async () => {
    const { data: crawls } = await supabase
      .from("crawl_results")
      .select("*")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (crawls && crawls.length > 0) {
      const crawl = crawls[0];
      setCrawlStatus(crawl.status);

      if (crawl.status === "complete") {
        const raw = crawl.discovered_pages as unknown as {
          url: string;
          suggested_type: string;
          confidence: number;
        }[];
        const discovered: DiscoveredPage[] = raw.map((p) => ({
          url: p.url,
          suggested_type: p.suggested_type,
          confidence: p.confidence,
          selected: true,
          override_type: p.suggested_type,
        }));
        setPages(discovered);
        setLoading(false);
        return true;
      }

      if (crawl.status === "failed") {
        setLoading(false);
        return true;
      }
    }
    return false;
  }, [siteId, supabase]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function start() {
      const done = await pollCrawl();
      if (!done) {
        interval = setInterval(async () => {
          const finished = await pollCrawl();
          if (finished) clearInterval(interval);
        }, 2000);
      }
    }

    start();
    return () => clearInterval(interval);
  }, [pollCrawl]);

  // Stats per type
  const typeStats = useMemo(() => {
    const stats: Record<string, { total: number; selected: number }> = {};
    pages.forEach((p) => {
      const type = p.override_type || p.suggested_type;
      if (!stats[type]) stats[type] = { total: 0, selected: 0 };
      stats[type].total++;
      if (p.selected) stats[type].selected++;
    });
    return stats;
  }, [pages]);

  // Filtered pages
  const filtered = useMemo(() => {
    let result = pages;
    if (typeFilter !== "all") {
      result = result.filter(
        (p) => (p.override_type || p.suggested_type) === typeFilter
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.url.toLowerCase().includes(q));
    }
    return result;
  }, [pages, typeFilter, search]);

  // Map filtered pages back to their original indices
  const filteredWithIndex = useMemo(() => {
    const indexMap = new Map<DiscoveredPage, number>();
    pages.forEach((p, i) => indexMap.set(p, i));
    return filtered.map((p) => ({ page: p, index: indexMap.get(p)! }));
  }, [filtered, pages]);

  const visiblePages = filteredWithIndex.slice(0, visibleCount);
  const hasMore = filteredWithIndex.length > visibleCount;

  const selectedCount = pages.filter((p) => p.selected).length;
  const filteredSelectedCount = filtered.filter((p) => p.selected).length;

  function togglePage(index: number) {
    setPages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], selected: !next[index].selected };
      return next;
    });
  }

  function changeType(index: number, type: string) {
    setPages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], override_type: type };
      return next;
    });
  }

  function selectFiltered() {
    const filteredSet = new Set(filtered);
    setPages((prev) =>
      prev.map((p) => (filteredSet.has(p) ? { ...p, selected: true } : p))
    );
  }

  function deselectFiltered() {
    const filteredSet = new Set(filtered);
    setPages((prev) =>
      prev.map((p) => (filteredSet.has(p) ? { ...p, selected: false } : p))
    );
  }

  function selectOnlyType(type: string) {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        selected: (p.override_type || p.suggested_type) === type,
      }))
    );
  }

  async function handleAddPages() {
    const selected = pages.filter((p) => p.selected);
    if (selected.length === 0) return;

    const batchSize = 50;
    for (let i = 0; i < selected.length; i += batchSize) {
      const batch = selected.slice(i, i + batchSize);
      await supabase.from("pages").insert(
        batch.map((page) => ({
          site_id: siteId,
          url: page.url,
          page_type: page.override_type || page.suggested_type,
          classification_confidence: page.confidence,
        }))
      );
    }

    router.push(`/sites/${siteId}`);
  }

  // ── Loading state ──
  if (crawlStatus === "crawling" || loading) {
    return (
      <div className="min-h-screen bg-background relative">
        <div className="fixed inset-0 bg-dot-grid opacity-30 pointer-events-none" />
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4
          border-b border-white/6 bg-background/80 backdrop-blur-md">
          <a href="/dashboard" className="font-mono text-sm font-bold tracking-tight">
            CRO<span className="text-gradient-cro">audit</span>
          </a>
        </nav>
        <div className="relative max-w-3xl mx-auto px-6 py-24 text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <h1 className="text-xl font-black tracking-tight">Scanning site...</h1>
          <p className="text-muted-foreground">
            Checking sitemap, robots.txt, and homepage links. This may take a moment for large sites.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Crawling in progress
          </div>
        </div>
      </div>
    );
  }

  // ── Failed state ──
  if (crawlStatus === "failed") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20
            flex items-center justify-center mx-auto">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground/80">
            Scan failed. The site might be unreachable.
          </p>
          <a href={`/sites/${siteId}`}>
            <Button variant="outline" className="rounded-xl border-white/12 hover:border-white/25">
              Back to site
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // ── Results ──
  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 bg-dot-grid opacity-30 pointer-events-none" />

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4
        border-b border-white/6 bg-background/80 backdrop-blur-md">
        <a href="/dashboard" className="font-mono text-sm font-bold tracking-tight">
          CRO<span className="text-gradient-cro">audit</span>
        </a>
        <a
          href={`/sites/${siteId}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          Back to site
        </a>
      </nav>

      <div className="relative max-w-5xl mx-auto px-6 py-12 space-y-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight">
              Found {pages.length} pages
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedCount} selected for import
              {pages.length >= 500 && (
                <span className="ml-2 text-amber-400">
                  (capped at 500)
                </span>
              )}
            </p>
          </div>
          <Button
            onClick={handleAddPages}
            disabled={selectedCount === 0}
            className="rounded-xl bg-primary text-primary-foreground
              hover:bg-primary/90 font-semibold btn-glow shrink-0"
          >
            Add {selectedCount} pages →
          </Button>
        </div>

        {/* ── Type summary cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {Object.entries(typeStats)
            .sort(([, a], [, b]) => b.total - a.total)
            .map(([type, stats]) => {
              const isActive = typeFilter === type;
              return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(isActive ? "all" : type)}
                  className={`rounded-xl px-3 py-3 text-center space-y-1 transition-all duration-150
                    border ${
                      isActive
                        ? "border-primary/40 bg-primary/10"
                        : "border-white/8 bg-card hover:border-white/15 hover:bg-white/3"
                    }`}
                >
                  <p className="font-mono text-lg font-black tabular-nums leading-none">
                    {stats.total}
                  </p>
                  <p className="text-[10px] text-muted-foreground capitalize truncate">
                    {type.replace("_", " ")}
                  </p>
                  <p className="text-[9px] text-muted-foreground/40">
                    {stats.selected} sel.
                  </p>
                </button>
              );
            })}
        </div>

        {/* ── Filters + bulk actions ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <Input
              placeholder="Search URLs..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(VISIBLE_PER_PAGE);
              }}
              className="pl-10 h-10 rounded-xl bg-white/5 border-white/10 hover:border-white/20
                focus:border-primary/60 placeholder:text-muted-foreground/30
                transition-colors duration-150 font-mono text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectFiltered}
              className="rounded-lg border-white/12 hover:border-white/25 text-xs"
            >
              Select {typeFilter !== "all" || search ? "filtered" : "all"} ({filtered.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deselectFiltered}
              className="rounded-lg border-white/12 hover:border-white/25 text-xs"
            >
              Deselect {typeFilter !== "all" || search ? "filtered" : "all"}
            </Button>
            {typeFilter !== "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectOnlyType(typeFilter)}
                className="rounded-lg border-primary/30 text-primary hover:bg-primary/10 text-xs"
              >
                Only {typeFilter.replace("_", " ")}
              </Button>
            )}
          </div>
        </div>

        {/* ── Active filter indicator ── */}
        {(typeFilter !== "all" || search) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              Showing {filtered.length} of {pages.length} pages
            </span>
            {typeFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                border border-primary/20 bg-primary/5 text-primary capitalize">
                {typeFilter.replace("_", " ")}
                <button
                  onClick={() => setTypeFilter("all")}
                  className="ml-0.5 hover:text-foreground"
                >
                  ×
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                border border-white/10 bg-white/5">
                &quot;{search}&quot;
                <button
                  onClick={() => setSearch("")}
                  className="ml-0.5 hover:text-foreground"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* ── Page list ── */}
        <div className="rounded-2xl border border-white/8 bg-card overflow-hidden">
          {/* Column headers */}
          <div className="flex items-center gap-3 px-5 py-2.5 border-b border-white/6
            text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
            <div className="w-5" />
            <div className="flex-1">URL</div>
            <div className="w-14 text-center">Conf.</div>
            <div className="w-32 text-center">Type</div>
          </div>

          <div className="divide-y divide-white/4">
            {visiblePages.map(({ page, index }) => (
              <div
                key={page.url}
                className={`flex items-center gap-3 px-5 py-2.5 transition-colors
                  ${page.selected ? "bg-white/[0.02]" : "opacity-50"}`}
              >
                <Checkbox
                  checked={page.selected}
                  onCheckedChange={() => togglePage(index)}
                  className="shrink-0"
                />
                <span
                  className="flex-1 font-mono text-xs text-foreground/70 truncate"
                  title={page.url}
                >
                  {page.url}
                </span>
                <span className="w-14 text-center text-[10px] text-muted-foreground/50 tabular-nums">
                  {Math.round(page.confidence * 100)}%
                </span>
                <Select
                  value={page.override_type}
                  onValueChange={(v) => {
                    if (v) changeType(index, v);
                  }}
                >
                  <SelectTrigger className="w-32 h-7 text-[11px] rounded-lg bg-white/5
                    border-white/10 hover:border-white/20 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/10 bg-card">
                    {PAGE_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="text-xs capitalize">
                        {t.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {/* Show more / summary */}
          {hasMore && (
            <button
              onClick={() => setVisibleCount((v) => v + VISIBLE_PER_PAGE)}
              className="w-full py-3 text-sm text-muted-foreground hover:text-foreground
                hover:bg-white/3 transition-colors border-t border-white/6"
            >
              Show more ({filteredWithIndex.length - visibleCount} remaining)
            </button>
          )}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground/50">
              No pages match your filter
            </div>
          )}
        </div>

        {/* ── Bottom action bar ── */}
        {selectedCount > 0 && (
          <div className="sticky bottom-6 flex items-center justify-between gap-4
            rounded-2xl border border-white/10 bg-card/95 backdrop-blur-md
            px-6 py-4 shadow-[0_-4px_32px_-8px_oklch(0_0_0_/_50%)]">
            <p className="text-sm text-muted-foreground">
              <span className="font-mono font-bold text-foreground">{selectedCount}</span> pages selected
            </p>
            <Button
              onClick={handleAddPages}
              className="rounded-xl bg-primary text-primary-foreground
                hover:bg-primary/90 font-semibold btn-glow"
            >
              Add {selectedCount} pages →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

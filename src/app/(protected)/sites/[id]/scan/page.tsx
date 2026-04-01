"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const PAGES_PER_GROUP = 10;

export default function ScanPage() {
  const params = useParams();
  const siteId = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [crawlStatus, setCrawlStatus] = useState<string>("crawling");
  const [pages, setPages] = useState<DiscoveredPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, number>>({});

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

  // Group pages by their current type
  const grouped = useMemo(() => {
    const groups: Record<string, { page: DiscoveredPage; index: number }[]> = {};
    pages.forEach((page, index) => {
      const type = page.override_type || page.suggested_type;
      if (!groups[type]) groups[type] = [];
      groups[type].push({ page, index });
    });
    return groups;
  }, [pages]);

  const selectedCount = useMemo(
    () => pages.filter((p) => p.selected).length,
    [pages]
  );

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

  function selectAll() {
    setPages((prev) => prev.map((p) => ({ ...p, selected: true })));
  }

  function deselectAll() {
    setPages((prev) => prev.map((p) => ({ ...p, selected: false })));
  }

  function toggleGroup(type: string, selected: boolean) {
    setPages((prev) =>
      prev.map((p) => {
        const currentType = p.override_type || p.suggested_type;
        if (currentType === type) return { ...p, selected };
        return p;
      })
    );
  }

  function showMore(type: string) {
    setExpandedGroups((prev) => ({
      ...prev,
      [type]: (prev[type] || PAGES_PER_GROUP) + PAGES_PER_GROUP,
    }));
  }

  async function handleAuditAll() {
    const selected = pages.filter((p) => p.selected);
    if (selected.length === 0) return;

    // Batch insert (max 50 at a time to avoid timeout)
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

  if (crawlStatus === "crawling" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <a href="/" className="font-mono text-sm font-bold tracking-tight">
            CRO<span className="text-muted-foreground">audit</span>
          </a>
        </nav>
        <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
          </div>
          <h1 className="text-xl font-bold">Scanning site...</h1>
          <p className="text-muted-foreground">
            Checking sitemap, robots.txt, and homepage links. This may take a moment for large sites.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Crawling in progress
          </div>
        </div>
      </div>
    );
  }

  if (crawlStatus === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-red-500">
            Scan failed. The site might be unreachable.
          </p>
          <a href={`/sites/${siteId}`}>
            <Button variant="outline">Back to site</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <a href="/" className="font-mono text-sm font-bold tracking-tight">
          CRO<span className="text-muted-foreground">audit</span>
        </a>
        <a
          href={`/sites/${siteId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to site
        </a>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Found {pages.length} pages
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedCount} selected for audit
              {pages.length >= 500 && (
                <span className="ml-2 text-yellow-600">
                  (capped at 500 — large site)
                </span>
              )}
            </p>
          </div>
          <Button onClick={handleAuditAll} disabled={selectedCount === 0}>
            Add {selectedCount} pages
          </Button>
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-3 text-sm">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select all
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll}>
            Deselect all
          </Button>
          <span className="text-muted-foreground">
            {selectedCount} / {pages.length} selected
          </span>
        </div>

        {/* Grouped pages */}
        {Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([type, typePages]) => {
            const visibleCount = expandedGroups[type] || PAGES_PER_GROUP;
            const visiblePages = typePages.slice(0, visibleCount);
            const hasMore = typePages.length > visibleCount;
            const groupSelected = typePages.filter((tp) => tp.page.selected).length;
            const allSelected = groupSelected === typePages.length;

            return (
              <Card key={type}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={(checked) =>
                          toggleGroup(type, !!checked)
                        }
                      />
                      <CardTitle className="text-base capitalize">
                        {type.replace("_", " ")}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {typePages.length}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ({groupSelected} selected)
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  {visiblePages.map(({ page, index }) => (
                    <div
                      key={page.url}
                      className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0"
                    >
                      <Checkbox
                        checked={page.selected}
                        onCheckedChange={() => togglePage(index)}
                      />
                      <span
                        className="flex-1 font-mono text-sm truncate"
                        title={page.url}
                      >
                        {page.url}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {Math.round(page.confidence * 100)}%
                      </span>
                      <Select
                        value={page.override_type}
                        onValueChange={(v) => {
                          if (v) changeType(index, v);
                        }}
                      >
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGE_TYPES.map((t) => (
                            <SelectItem key={t} value={t} className="text-xs">
                              {t.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}

                  {hasMore && (
                    <button
                      onClick={() => showMore(type)}
                      className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Show more ({typePages.length - visibleCount} remaining)
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}

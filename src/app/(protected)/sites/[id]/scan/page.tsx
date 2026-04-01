"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

interface DiscoveredPage {
  url: string;
  suggested_type: string;
  confidence: number;
  selected?: boolean;
  override_type?: string;
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

export default function ScanPage() {
  const params = useParams();
  const siteId = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [crawlStatus, setCrawlStatus] = useState<string>("crawling");
  const [pages, setPages] = useState<DiscoveredPage[]>([]);
  const [loading, setLoading] = useState(true);

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
        const discovered = (
          crawl.discovered_pages as unknown as DiscoveredPage[]
        ).map((p) => ({
          ...p,
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

  function togglePage(index: number) {
    setPages((prev) =>
      prev.map((p, i) => (i === index ? { ...p, selected: !p.selected } : p))
    );
  }

  function changeType(index: number, type: string) {
    setPages((prev) =>
      prev.map((p, i) => (i === index ? { ...p, override_type: type } : p))
    );
  }

  async function handleAuditAll() {
    const selected = pages.filter((p) => p.selected);

    // Create pages in DB
    for (const page of selected) {
      await supabase.from("pages").insert({
        site_id: siteId,
        url: page.url,
        page_type: page.override_type || page.suggested_type,
        classification_confidence: page.confidence,
      });
    }

    // Navigate back to site
    router.push(`/sites/${siteId}`);
  }

  const selectedCount = pages.filter((p) => p.selected).length;

  // Group by type
  const grouped: Record<string, DiscoveredPage[]> = {};
  for (const page of pages) {
    const type = page.override_type || page.suggested_type;
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(page);
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-muted">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Scanning site...</h1>
          <p className="text-muted-foreground">
            Checking sitemap, robots.txt, and homepage links.
          </p>
          <div className="max-w-md mx-auto space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
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
        <a href={`/sites/${siteId}`} className="text-sm text-muted-foreground hover:text-foreground">
          Back to site
        </a>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Found {pages.length} pages
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedCount} selected for audit
            </p>
          </div>
          <Button onClick={handleAuditAll} disabled={selectedCount === 0}>
            Add {selectedCount} pages
          </Button>
        </div>

        {Object.entries(grouped).map(([type, typePages]) => (
          <Card key={type}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle className="text-base capitalize">
                  {type.replace("_", " ")}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {typePages.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {typePages.map((page) => {
                const pageIndex = pages.indexOf(page);
                return (
                  <div
                    key={page.url}
                    className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0"
                  >
                    <Checkbox
                      checked={page.selected}
                      onCheckedChange={() => togglePage(pageIndex)}
                    />
                    <span className="flex-1 font-mono text-sm truncate">
                      {page.url}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(page.confidence * 100)}%
                    </span>
                    <Select
                      value={page.override_type || page.suggested_type}
                      onValueChange={(v) => { if (v) changeType(pageIndex, v) }}
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
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

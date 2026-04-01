"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

function ScoreColor({ score }: { score: number | null }) {
  if (score == null) return <span className="text-muted-foreground">--</span>;
  const color =
    score >= 70
      ? "text-emerald-500"
      : score >= 40
      ? "text-amber-500"
      : "text-red-500";
  return <span className={`font-mono font-bold ${color}`}>{score}</span>;
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
        // Fetch latest audit for each page
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

    // Start audits for all unaudited pages (first one navigates to results)
    const first = unaudited[0];
    // Start the rest in background
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

    // Navigate to the first audit
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-foreground border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <a href="/" className="font-mono text-sm font-bold tracking-tight">
          CRO<span className="text-muted-foreground">audit</span>
        </a>
        <div className="flex items-center gap-4">
          <a
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{site?.name || site?.domain}</h1>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              {site?.domain}
            </p>
          </div>
          <div className="flex gap-2">
            {pages.length > 0 && (
              <Button onClick={handleAuditAll} disabled={auditingAll}>
                {auditingAll ? "Starting audits..." : `Audit all (${pages.filter(p => !p.latest_audit || p.latest_audit.status === "failed").length})`}
              </Button>
            )}
            <Button onClick={handleScanSite} variant="outline" disabled={scanning}>
              {scanning ? "Scanning..." : "Scan entire site"}
            </Button>
          </div>
        </div>

        {/* Add page */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add a page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder={`https://${site?.domain}/product/example`}
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="flex-1 font-mono text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleAddPage()}
              />
              <Select value={newType} onValueChange={(v) => { if (v) setNewType(v) }}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddPage}>Add</Button>
            </div>
          </CardContent>
        </Card>

        {/* Pages table */}
        {pages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No pages yet. Add a URL above or scan the entire site.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-mono text-sm max-w-xs truncate">
                    {page.url}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {page.page_type.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ScoreColor score={page.latest_audit?.score ?? null} />
                  </TableCell>
                  <TableCell>
                    {page.latest_audit ? (
                      <Badge
                        variant={
                          page.latest_audit.status === "complete"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {page.latest_audit.status}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Not audited
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {page.latest_audit?.status === "complete" && (
                        <a href={`/audit/${page.latest_audit.id}`}>
                          <Button variant="ghost" size="sm">
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
                      >
                        {auditingPage === page.id ? "Starting..." : "Audit"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

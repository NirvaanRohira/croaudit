"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Profile, Site } from "@/lib/supabase/types";

/* ── Score color pill ───────────────────────────────────────────────── */
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

/* ── Plan badge ─────────────────────────────────────────────────────── */
function PlanBadge({ plan }: { plan?: string }) {
  const p = plan || "free";
  const [color] =
    p === "pro"
      ? ["text-primary bg-primary/10 border-primary/20"]
      : p === "agency"
      ? ["text-purple-400 bg-purple-500/10 border-purple-500/20"]
      : ["text-muted-foreground bg-white/5 border-white/10"];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md border
        text-xs font-bold uppercase tracking-wide capitalize ${color}`}
    >
      {p}
    </span>
  );
}

/* ── Stat card ──────────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-card px-6 py-5 space-y-1.5 card-lift">
      <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-2xl font-black tabular-nums leading-none">
          {value}
        </span>
        {sub && (
          <span className="text-sm text-muted-foreground/50">{sub}</span>
        )}
      </div>
    </div>
  );
}

/* ── Main dashboard ─────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: sitesData } = await supabase
        .from("sites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setProfile(profileData);
      setSites(sitesData || []);
      setLoading(false);
    }
    load();
  }, [router, supabase]);

  async function handleAddSite() {
    if (!newDomain.trim()) return;

    const domain = newDomain
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("sites")
      .insert({
        user_id: user.id,
        domain,
        name: domain,
      })
      .select()
      .single();

    if (!error && data) {
      setSites([data, ...sites]);
      setNewDomain("");
      setDialogOpen(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const avgScore =
    sites.length > 0 && sites.some((s) => s.avg_score != null)
      ? Math.round(
          sites
            .filter((s) => s.avg_score != null)
            .reduce((sum, s) => sum + (s.avg_score || 0), 0) /
            sites.filter((s) => s.avg_score != null).length
        )
      : null;

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
            href="/settings"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            Settings
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground hover:bg-white/6"
          >
            Log out
          </Button>
        </div>
      </nav>

      <div className="relative max-w-5xl mx-auto px-6 py-12 space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span>{profile?.full_name || profile?.email}</span>
              <PlanBadge plan={profile?.plan} />
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger className="inline-flex shrink-0 items-center justify-center
              gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold
              hover:bg-primary/90 transition-all duration-150 btn-glow">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add site
            </DialogTrigger>
            <DialogContent className="rounded-2xl border-white/10 bg-card">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Add a site</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="font-mono bg-white/5 border-white/10 hover:border-white/20
                    focus:border-primary/60 transition-colors rounded-xl"
                  onKeyDown={(e) => e.key === "Enter" && handleAddSite()}
                />
                <Button
                  onClick={handleAddSite}
                  className="w-full rounded-xl bg-primary text-primary-foreground
                    hover:bg-primary/90 font-semibold"
                >
                  Add site →
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Sites" value={sites.length} />
          <StatCard
            label="Plan"
            value={
              <span className="capitalize text-foreground/85">
                {profile?.plan || "free"}
              </span>
            }
          />
          <StatCard
            label="Audits used"
            value={profile?.audits_used_this_month || 0}
            sub={`/ ${profile?.audits_limit || 1}`}
          />
          <StatCard
            label="Avg score"
            value={
              avgScore != null ? (
                <span
                  className={
                    avgScore >= 70
                      ? "text-emerald-400"
                      : avgScore >= 40
                      ? "text-amber-400"
                      : "text-red-400"
                  }
                >
                  {avgScore}
                </span>
              ) : (
                <span className="text-muted-foreground/30">--</span>
              )
            }
          />
        </div>

        {/* ── Run new audit shortcut ── */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5
          px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold">Run a new audit</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Audit any e-commerce page in 90 seconds
            </p>
          </div>
          <Button
            size="sm"
            className="rounded-xl bg-primary text-primary-foreground
              hover:bg-primary/90 font-semibold shrink-0"
            onClick={() => setDialogOpen(true)}
          >
            Start audit →
          </Button>
        </div>

        {/* ── Sites list ── */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
            Your sites
          </h2>

          {sites.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-card
              py-20 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10
                flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground/60">No sites yet</p>
                <p className="text-xs text-muted-foreground/40">
                  Add your first site to start auditing
                </p>
              </div>
              <Button
                onClick={() => setDialogOpen(true)}
                size="sm"
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Add site →
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-card overflow-hidden">
              <div className="divide-y divide-white/6">
                {sites.map((site) => (
                  <a
                    key={site.id}
                    href={`/sites/${site.id}`}
                    className="flex items-center justify-between px-6 py-4
                      hover:bg-white/3 transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Favicon placeholder */}
                      <div className="w-8 h-8 rounded-lg bg-white/8 border border-white/10
                        flex items-center justify-center shrink-0">
                        <span className="font-mono text-[10px] text-muted-foreground/60 uppercase">
                          {(site.name || site.domain).slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {site.name || site.domain}
                        </p>
                        <p className="text-xs text-muted-foreground/50 font-mono truncate">
                          {site.domain}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      {site.monitoring_enabled && (
                        <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px]
                          text-emerald-400 bg-emerald-500/10 border border-emerald-500/20
                          px-2 py-0.5 rounded-md font-bold uppercase tracking-wide">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                          Live
                        </span>
                      )}
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-0.5">
                          Pages
                        </p>
                        <p className="font-mono text-sm text-foreground/60">
                          {site.page_count || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-0.5">
                          Score
                        </p>
                        <ScoreColor score={site.avg_score} />
                      </div>
                      <svg
                        className="w-4 h-4 text-muted-foreground/20 group-hover:text-muted-foreground/50
                          transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Profile, Site } from "@/lib/supabase/types";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-foreground border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <a href="/" className="font-mono text-sm font-bold tracking-tight">
          CRO<span className="text-muted-foreground">audit</span>
        </a>
        <div className="flex items-center gap-4">
          <a
            href="/settings"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Settings
          </a>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {profile?.full_name || profile?.email}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <Button>Add site</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a site</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="font-mono"
                  onKeyDown={(e) => e.key === "Enter" && handleAddSite()}
                />
                <Button onClick={handleAddSite} className="w-full">
                  Add site
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Sites
              </p>
              <p className="text-2xl font-mono font-bold mt-1">
                {sites.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Plan
              </p>
              <p className="text-2xl font-mono font-bold mt-1 capitalize">
                {profile?.plan || "free"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Audits used
              </p>
              <p className="text-2xl font-mono font-bold mt-1">
                {profile?.audits_used_this_month || 0}
                <span className="text-sm text-muted-foreground font-normal">
                  /{profile?.audits_limit || 1}
                </span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Avg score
              </p>
              <p className="text-2xl font-mono font-bold mt-1">
                {sites.length > 0 && sites.some((s) => s.avg_score != null)
                  ? Math.round(
                      sites
                        .filter((s) => s.avg_score != null)
                        .reduce((sum, s) => sum + (s.avg_score || 0), 0) /
                        sites.filter((s) => s.avg_score != null).length
                    )
                  : "--"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sites list */}
        {sites.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground mb-4">
                No sites yet. Add your first site to start auditing.
              </p>
              <Button onClick={() => setDialogOpen(true)}>Add site</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sites.map((site) => (
              <a
                key={site.id}
                href={`/sites/${site.id}`}
                className="block"
              >
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{site.name || site.domain}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {site.domain}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Score</p>
                          <ScoreColor score={site.avg_score} />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Pages</p>
                          <p className="font-mono text-sm">{site.page_count}</p>
                        </div>
                        {site.monitoring_enabled && (
                          <Badge variant="secondary" className="text-xs">
                            Monitoring
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

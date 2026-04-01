"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Profile } from "@/lib/supabase/types";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
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

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setName(data.full_name || "");
      }
      setLoading(false);
    }
    load();
  }, [router, supabase]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);

    await supabase
      .from("profiles")
      .update({ full_name: name, updated_at: new Date().toISOString() })
      .eq("id", profile.id);

    setSaving(false);
  }

  async function handleManageBilling() {
    const res = await fetch("/api/billing/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  async function handleUpgrade(plan: string) {
    const res = await fetch("/api/billing/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
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
        <a
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Dashboard
        </a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <h1 className="text-2xl font-bold">Settings</h1>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={profile?.email || ""} disabled className="bg-muted/50" />
            </div>
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="capitalize text-sm">
                {profile?.plan || "free"}
              </Badge>
              {profile?.subscription_status && (
                <Badge
                  variant={
                    profile.subscription_status === "active"
                      ? "default"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {profile.subscription_status}
                </Badge>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                Audits used this month: {profile?.audits_used_this_month || 0} /{" "}
                {profile?.audits_limit || 1}
              </p>
              {profile?.current_period_end && (
                <p>
                  Current period ends:{" "}
                  {new Date(profile.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>

            {profile?.plan === "free" ? (
              <div className="flex gap-3">
                <Button onClick={() => handleUpgrade("pro")}>
                  Upgrade to Pro ($29/mo)
                </Button>
                <Button variant="outline" onClick={() => handleUpgrade("agency")}>
                  Upgrade to Agency ($99/mo)
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={handleManageBilling}>
                Manage billing
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

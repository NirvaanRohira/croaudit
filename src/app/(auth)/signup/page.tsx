"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  async function handleGoogleSignup() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-6 py-4
        border-b border-white/6 bg-background/80 backdrop-blur-md">
        <a href="/" className="font-mono text-sm font-bold tracking-tight">
          CRO<span className="text-gradient-cro">audit</span>
        </a>
      </nav>

      {/* ── Background ── */}
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 opacity-[0.05] blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(0.72 0.19 45), transparent 70%)",
        }}
      />

      {/* ── Form card ── */}
      <div className="relative flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm space-y-8">
          {/* Header */}
          <div className="text-center space-y-2 animate-hero-fade-up animate-hero-fade-up-1">
            <h1 className="text-2xl font-black tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground">
              Start auditing your store in 90 seconds
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/8 bg-card p-8 space-y-6
            shadow-[0_8px_40px_-12px_oklch(0_0_0_/_60%)]
            animate-hero-fade-up animate-hero-fade-up-2">

            {/* Google OAuth */}
            <Button
              variant="outline"
              className="w-full border-white/12 hover:border-white/25 hover:bg-white/6
                transition-all duration-150 rounded-xl h-11 gap-3"
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-sm font-medium">Continue with Google</span>
            </Button>

            <div className="relative flex items-center gap-3">
              <Separator className="flex-1 bg-white/8" />
              <span className="text-xs text-muted-foreground/40 uppercase tracking-widest px-1">
                or
              </span>
              <Separator className="flex-1 bg-white/8" />
            </div>

            {/* Email/password form */}
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider"
                >
                  Full name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  placeholder="Jane Smith"
                  className="h-11 rounded-xl bg-white/5 border-white/10 hover:border-white/20
                    focus:border-primary/60 placeholder:text-muted-foreground/30
                    transition-colors duration-150"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="you@store.com"
                  className="h-11 rounded-xl bg-white/5 border-white/10 hover:border-white/20
                    focus:border-primary/60 placeholder:text-muted-foreground/30
                    transition-colors duration-150"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                  placeholder="••••••••"
                  className="h-11 rounded-xl bg-white/5 border-white/10 hover:border-white/20
                    focus:border-primary/60 placeholder:text-muted-foreground/30
                    transition-colors duration-150"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl
                  bg-red-500/10 border border-red-500/20">
                  <svg className="w-3.5 h-3.5 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground
                  hover:bg-primary/90 font-semibold btn-glow transition-all duration-200 mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create account →"
                )}
              </Button>
            </form>
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground/50
            animate-hero-fade-up animate-hero-fade-up-3">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-foreground/70 font-semibold hover:text-foreground
                transition-colors underline underline-offset-2 decoration-white/20
                hover:decoration-white/50"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sword, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (!email || !password) {
      setError("Please enter email and password");
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        }
      });
      if (error) {
        setError(error.message);
      } else {
        // Automatically try to log in if sign up succeeds without requiring verification
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError("Account created. Please check your email to verify.");
        } else {
          router.push(redirect);
          router.refresh();
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push(redirect);
        router.refresh();
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 bg-grid">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-red flex items-center justify-center shadow-lg shadow-accent-purple/30">
              <Sword className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-white">
              Spot<span className="text-gradient-purple">Wars</span>
            </span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-white mb-2">
            Enter the Arena
          </h1>
          <p className="text-slate-400 text-sm">
            {isSignUp ? "Create an account to list your product." : "Sign in to list your product and compete."}
          </p>
        </div>

        {/* Card */}
        <div className="glass-elevated rounded-2xl border border-bg-border p-8 shadow-2xl shadow-black/30">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@startup.com"
                className="w-full bg-bg-elevated border border-bg-border rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent-purple/60 transition-colors text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-elevated border border-bg-border rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent-purple/60 transition-colors text-sm"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 mt-2 py-3.5 px-4 rounded-xl bg-accent-purple hover:bg-accent-purple-light text-white font-semibold transition-all shadow-lg shadow-accent-purple/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>

          <p className="text-center text-xs text-slate-600 mt-5">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-slate-400 hover:text-white underline">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-slate-400 hover:text-white underline">Privacy Policy</Link>.
          </p>
        </div>

        <p className="text-center text-slate-600 text-sm mt-6">
          <Link href="/" className="hover:text-slate-400 transition-colors">
            ← Back to SpotWars
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent-purple" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

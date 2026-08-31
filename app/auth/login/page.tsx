"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="font-display font-black text-2xl text-ink uppercase tracking-tight border-b border-bg-border pb-1">
              InternetBillboard.space
            </span>
          </Link>
          <h1 className="font-display font-black text-3xl text-ink mb-2 uppercase tracking-wide">
            Enter the Market
          </h1>
          <p className="text-ink-muted text-sm font-bold uppercase tracking-wider">
            {isSignUp ? "Create an account to list your product." : "Sign in to list your product and compete."}
          </p>
        </div>

        {/* Card */}
        <div className="border border-bg-border bg-bg-surface p-8">
          {error && (
            <div className="flex items-start gap-2 p-3 mb-5 border border-bg-border bg-bg">
              <AlertCircle className="w-4 h-4 text-ink flex-shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-ink uppercase tracking-wider">{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-ink uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@startup.com"
                className="w-full bg-bg border border-bg-border px-4 py-3 text-ink placeholder:text-ink-muted focus:outline-none transition-colors text-sm font-medium"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-black text-ink uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg border border-bg-border px-4 py-3 text-ink placeholder:text-ink-muted focus:outline-none transition-colors text-sm font-medium"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-bg-border text-center">
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-black text-ink hover:text-ink-muted transition-colors uppercase tracking-widest"
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>

          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-ink-muted mt-5 leading-relaxed">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-ink hover:underline">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-ink hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        <p className="text-center text-ink-muted text-xs font-bold uppercase tracking-widest mt-8">
          <Link href="/" className="hover:text-ink transition-colors">
            ← Back to Board
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-ink" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

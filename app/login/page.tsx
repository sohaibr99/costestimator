"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Building2, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = React.useState<AuthMode>("sign-in");
  const [nextPath, setNextPath] = React.useState("/projects");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get("next") ?? "/projects/new");
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured in the environment.");
      return;
    }

    setIsSubmitting(true);

    if (mode === "sign-up") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsSubmitting(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setSuccess("Account created. Check your email if confirmation is required.");
        setIsSubmitting(false);
        return;
      }

      router.replace(nextPath);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    router.replace(nextPath);
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50/50 p-4 sm:p-8">
      {/* Subtle Background Gradients */}
      <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-emerald-200/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-emerald-200/20 blur-[120px]" />

      <section className="relative flex w-full max-w-[1000px] flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-[0_40px_100px_rgba(4,43,21,0.08)] ring-1 ring-slate-200 lg:flex-row">
        
        {/* Left Column: Hero & Value Prop */}
        <div className="relative flex flex-1 flex-col justify-between bg-slate-50/50 p-8 sm:p-12 lg:p-16 lg:border-r lg:border-slate-100">
          <div className="space-y-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/50 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                Secure Access
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Manage your <br/>
                <span className="text-emerald-700">construction ledger.</span>
              </h1>
              
              <p className="max-w-md text-lg leading-relaxed text-slate-600">
                The all-in-one platform to track multi-tenant projects, manage materials, and keep your cost breakdowns perfectly in sync.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {[
                "Track real-time material costs & phases",
                "Generate comprehensive budget reports",
                "Secure, multi-tenant cloud storage"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="hidden pt-12 lg:block">
            <div className="flex items-center gap-3 text-slate-400">
              <Building2 className="h-6 w-6" />
              <span className="text-sm font-semibold uppercase tracking-wider">Arrow Systems</span>
            </div>
          </div>
        </div>

        {/* Right Column: Auth Form */}
        <div className="flex flex-1 flex-col justify-center bg-white p-8 sm:p-12 lg:p-16">
          <div className="mx-auto w-full max-w-sm space-y-8">
            
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                {mode === "sign-in" ? "Welcome back" : "Create an account"}
              </h2>
              <p className="text-slate-500">
                {mode === "sign-in"
                  ? "Enter your credentials to access your workspace."
                  : "Start managing your projects in seconds."}
              </p>
            </div>

            {/* Custom Segmented Control */}
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMode("sign-in")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  mode === "sign-in" 
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("sign-up")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  mode === "sign-up" 
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className={`space-y-5 overflow-hidden transition-all duration-300 ${mode === "sign-up" ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="space-y-2">
                  <Label htmlFor="full-name" className="text-slate-700">Full name</Label>
                  <Input 
                    id="full-name" 
                    value={fullName} 
                    onChange={(event) => setFullName(event.target.value)} 
                    placeholder="John Doe" 
                    className="h-12 rounded-xl bg-slate-50/50 focus-visible:ring-emerald-500"
                    disabled={mode === "sign-in"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-name" className="text-slate-700">Company name</Label>
                  <Input 
                    id="company-name" 
                    value={companyName} 
                    onChange={(event) => setCompanyName(event.target.value)} 
                    placeholder="Acme Construction" 
                    className="h-12 rounded-xl bg-slate-50/50 focus-visible:ring-emerald-500"
                    disabled={mode === "sign-in"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(event) => setEmail(event.target.value)} 
                  placeholder="you@example.com" 
                  required 
                  className="h-12 rounded-xl bg-slate-50/50 focus-visible:ring-emerald-500"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700">Password</Label>
                  {mode === "sign-in" && (
                    <Link href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(event) => setPassword(event.target.value)} 
                  placeholder="••••••••" 
                  required 
                  minLength={6} 
                  className="h-12 rounded-xl bg-slate-50/50 focus-visible:ring-emerald-500"
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
              
              {success ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  {success}
                </div>
              ) : null}

              <Button 
                className="h-12 w-full rounded-xl bg-emerald-700 text-base font-semibold hover:bg-emerald-800" 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : null}
                {mode === "sign-in" ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
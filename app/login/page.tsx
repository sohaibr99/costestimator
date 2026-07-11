"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle2, ShieldCheck, Building2 } from "lucide-react";
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
    setNextPath(params.get("next") ?? "/projects");
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
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 p-4">
      <section className="relative flex w-full max-w-[1000px] flex-col overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-slate-200 lg:flex-row">
        
        {/* Left Column - Hidden on small mobile, visible on tablet/desktop */}
        <div className="hidden lg:flex flex-1 flex-col justify-between bg-slate-50/50 p-12 lg:border-r">
          <div className="space-y-8">
            <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
            </Link>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase text-emerald-800">
                <ShieldCheck className="h-4 w-4" /> Secure Access
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">Manage your <span className="text-emerald-700">construction ledger.</span></h1>
            </div>
            <div className="space-y-4">
              {["Track material costs & phases", "Generate budget reports", "Secure cloud storage"].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Full width on mobile */}
        <div className="flex flex-1 flex-col justify-center p-6 sm:p-10 lg:p-16">
          <div className="w-full max-w-sm mx-auto space-y-6">
            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">{mode === "sign-in" ? "Welcome back" : "Create account"}</h2>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1">
              <button type="button" onClick={() => setMode("sign-in")} className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${mode === "sign-in" ? "bg-white shadow-sm" : "text-slate-500"}`}>Sign In</button>
              <button type="button" onClick={() => setMode("sign-up")} className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${mode === "sign-up" ? "bg-white shadow-sm" : "text-slate-500"}`}>Sign Up</button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "sign-up" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Full name</Label>
                    <Input className="h-11 rounded-lg" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Company name</Label>
                    <Input className="h-11 rounded-lg" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Inc" />
                  </div>
                </>
              )}
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Email address</Label>
                <Input className="h-11 rounded-lg" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Password</Label>
                <Input className="h-11 rounded-lg" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>

              {error && <div className="p-3 text-sm rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>}
              
              <Button className="h-11 w-full bg-emerald-700 hover:bg-emerald-800" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : (mode === "sign-in" ? "Sign In" : "Create Account")}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

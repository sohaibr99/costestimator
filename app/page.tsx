"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Building2, ShieldCheck, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-slate-50">
      {/* Premium Technical Background Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 z-0 h-96 bg-gradient-to-b from-emerald-50/50 to-transparent"></div>

      {/* Hero Section */}
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center justify-center px-6 pt-24 text-center sm:pt-32 lg:px-8">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-200/50 bg-white/60 px-4 py-1.5 text-sm font-semibold text-emerald-800 shadow-sm backdrop-blur-md">
          <HardHat className="h-4 w-4" />
          <span>Professional Ledger Systems</span>
        </div>
        
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl lg:text-8xl">
          Built for <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
            absolute accuracy.
          </span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
          The ultimate platform to track multi-tenant construction projects, manage heavy equipment costs, and keep your materials ledger perfectly synchronized.
        </p>

        <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="h-14 w-full rounded-xl bg-emerald-700 px-8 text-base shadow-lg hover:bg-emerald-800 sm:w-auto">
            <Link href="/login">
              Access Workspace <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 w-full rounded-xl border-slate-200 bg-white px-8 text-base shadow-sm hover:bg-slate-50 sm:w-auto">
            <Link href="/login">View Live Projects</Link>
          </Button>
        </div>
      </div>

      {/* Responsive Feature Grid */}
      <div className="relative z-10 mx-auto mt-20 grid w-full max-w-6xl gap-6 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {[
          { icon: Building2, title: "Multi-Tenant Sites", desc: "Isolate and manage distinct ledgers for different construction zones." },
          { icon: BarChart3, title: "Real-Time Costing", desc: "Instantly calculate weighted averages and material run rates." },
          { icon: ShieldCheck, title: "Secure Infrastructure", desc: "Enterprise-grade data protection powered by Supabase authentication." }
        ].map((feature, i) => (
          <div key={i} className="flex flex-col rounded-3xl border border-slate-200/60 bg-white/80 p-8 shadow-sm backdrop-blur-xl transition-all hover:shadow-md">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">{feature.title}</h3>
            <p className="text-base leading-relaxed text-slate-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

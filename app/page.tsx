import Link from "next/link";
import { Calculator, BarChart3, HardHat } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid w-full gap-10 overflow-hidden rounded-[2.5rem] border border-border bg-card/95 p-8 shadow-[0_30px_80px_rgba(31,59,44,0.08)] backdrop-blur sm:p-12 lg:grid-cols-2 lg:items-center">
        
        {/* Left Column: Hero Copy */}
        <div className="space-y-8 lg:pr-8">
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-900">
            Enterprise Grade
          </span>
          <div className="space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Master Your Construction Costs
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-foreground/70 sm:text-lg">
              A comprehensive project ledger and estimating platform designed for contractors. Track budgets, log material purchases, and protect your profit margins with precision.
            </p>
          </div>
          <div className="pt-2">
            <Link
              className="inline-flex h-14 items-center justify-center rounded-xl bg-emerald-900 px-8 text-base font-medium text-white transition-colors hover:bg-emerald-800 shadow-sm"
              href="/login?next=/projects"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>

        {/* Right Column: Professional Features */}
        <div className="grid gap-5 rounded-[2rem] bg-muted/40 p-6 lg:p-8 border border-border/50">
          
          <div className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-emerald-500/30">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-900 group-hover:bg-emerald-100 transition-colors">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Precision Estimating</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/65">
                Calculate weighted averages and real-time unit costs instantly as market prices fluctuate.
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-emerald-500/30">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-900 group-hover:bg-emerald-100 transition-colors">
              <HardHat className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Centralized Ledgers</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/65">
                Manage materials, vendor transactions, and daily logs across multiple active sites from one hub.
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-emerald-500/30">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-900 group-hover:bg-emerald-100 transition-colors">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Budget Protection</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/65">
                Identify cost overruns before they happen with live financial tracking and smart analytics.
              </p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Building2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProjectsRow } from "@/types/database";

export default function ProjectsDashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = React.useState<ProjectsRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (!cancelled) setError("Supabase client not initialized.");
        setIsLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!session) {
        router.replace("/login?next=/projects");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setProjects((data as ProjectsRow[]) || []);
      }
      setIsLoading(false);
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, [router]);
  
  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.replace("/login");
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
          <span className="font-medium text-slate-700">Loading your workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Responsive Header: Stacks on mobile, aligns on desktop */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Your Projects</h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">Manage and track your active construction sites.</p>
          </div>
          
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <Button onClick={handleSignOut} variant="ghost" className="h-11 flex-1 sm:flex-none text-slate-600 hover:text-slate-900">
              <LogOut className="mr-2 h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
            
            <Button asChild className="h-11 flex-1 sm:flex-none gap-2 bg-emerald-700 text-white hover:bg-emerald-800">
              <Link href="/projects/new">
                <Plus className="h-4 w-4" />
                New Project
              </Link>
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            Error loading projects: {error}
          </div>
        )}

        {projects.length === 0 && !error ? (
          <Card className="flex flex-col items-center justify-center rounded-3xl border-dashed border-slate-300 bg-transparent p-12 text-center shadow-none sm:p-16">
            <div className="mb-4 rounded-full bg-emerald-100 p-4 text-emerald-700">
              <Building2 className="h-8 w-8" />
            </div>
            <CardTitle className="mb-2 text-xl text-slate-900">No projects yet</CardTitle>
            <CardDescription className="mb-8 max-w-sm text-base">
              You haven't created any active ledgers. Get started by initializing your first site.
            </CardDescription>
            <Button asChild className="h-12 rounded-xl bg-emerald-700 px-8 text-white hover:bg-emerald-800">
              <Link href="/projects/new">Create First Project</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col overflow-hidden rounded-2xl border-slate-200 transition-all hover:border-emerald-500/50 hover:shadow-md">
                <CardHeader className="bg-white p-6 pb-4">
                  <CardTitle className="truncate text-lg text-slate-900">{project.name}</CardTitle>
                  <CardDescription className="truncate text-slate-500">
                    {project.location || "No location set"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 bg-white px-6 pb-2">
                  {/* Space reserved for future budget stats */}
                </CardContent>
                <div className="bg-slate-50 p-4">
                  <Button asChild variant="outline" className="h-11 w-full border-slate-200 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-800">
                    <Link href={`/projects/${project.id}`}>
                      Open Ledger
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

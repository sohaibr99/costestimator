"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Building2 } from "lucide-react";
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your projects...
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your Projects</h1>
          <p className="text-sm text-foreground/60">Manage and track your construction cost ledgers.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={handleSignOut} variant="ghost" className="text-foreground/65 hover:text-foreground">
            Sign out
          </Button>
          
          <Button asChild className="gap-2 bg-emerald-900 text-white hover:bg-emerald-800">
            <Link href="/projects/new">
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error loading projects: {error}
        </div>
      )}

      {projects.length === 0 && !error ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Building2 className="h-8 w-8 text-foreground/50" />
          </div>
          <CardTitle className="mb-2">No projects yet</CardTitle>
          <CardDescription className="mb-6 max-w-sm">
            You haven't created any projects. Get started by creating your first cost estimator ledger.
          </CardDescription>
          <Button asChild className="bg-emerald-900 text-white hover:bg-emerald-800">
            <Link href="/projects/new">Create your first project</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col hover:border-emerald-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="truncate">{project.name}</CardTitle>
                <CardDescription className="truncate">
                  {project.location || "No location set"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {/* Space reserved for future budget stats */}
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Button asChild variant="outline" className="w-full text-foreground hover:bg-emerald-50 hover:text-emerald-900">
                  <Link href={`/projects/${project.id}`}>
                    Open Ledger
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
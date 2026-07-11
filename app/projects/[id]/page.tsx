"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle, Trash2 } from "lucide-react";
import { CostChart } from "@/components/cost-chart";
import { AddPurchaseDialog } from "@/components/add-purchase-dialog";
import { ProjectSummary } from "@/components/project-summary";
import { TransactionTable } from "@/components/transaction-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useProjectStore } from "@/store/useProjectStore";
import type { MaterialsCatalogRow } from "@/types/database";
import type { CatalogOption } from "@/components/material-combobox";

export default function ProjectLedgerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;
  
  const loadProject = useProjectStore((state) => state.loadProject);
  const isLoading = useProjectStore((state) => state.isLoading);
  const error = useProjectStore((state) => state.error);
  const activeProject = useProjectStore((state) => state.activeProject);
  const transactions = useProjectStore((state) => state.transactions);
  
  const [materials, setMaterials] = React.useState<CatalogOption[]>([]);
  const [loadingMaterials, setLoadingMaterials] = React.useState(true);
  const [materialsError, setMaterialsError] = React.useState<string | null>(null);
  const [authChecking, setAuthChecking] = React.useState(true);

  // New states for the multi-step delete confirmation
  const [deleteStep, setDeleteStep] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!projectId) {
      return;
    }

    let cancelled = false;

    async function ensureAccess() {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        if (!cancelled) {
          setAuthChecking(false);
          void loadProject(projectId);
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) {
        return;
      }

      if (!data.session) {
        router.replace(`/login?next=${encodeURIComponent(`/projects/${projectId}`)}`);
        return;
      }

      setAuthChecking(false);
      void loadProject(projectId);
    }

    void ensureAccess();

    return () => {
      cancelled = true;
    };
  }, [loadProject, projectId, router]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadMaterials() {
      setLoadingMaterials(true);
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        if (!cancelled) {
          setMaterialsError("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not configured.");
          setMaterials([]);
          setLoadingMaterials(false);
        }
        return;
      }

      const { data, error: materialsErrorResponse } = await supabase
        .from("materials_catalog")
        .select("id, category, name, unit, is_active, created_at")
        .eq("is_active", true)
        .order("category")
        .order("name");

      if (cancelled) {
        return;
      }

      if (materialsErrorResponse) {
        setMaterialsError(materialsErrorResponse.message);
        setMaterials([]);
      } else {
        const catalogRows = (data ?? []) as MaterialsCatalogRow[];
        setMaterials(catalogRows.map((item) => ({
          id: item.id,
          category: item.category,
          name: item.name,
          unit: item.unit,
        })));
        setMaterialsError(null);
      }

      setLoadingMaterials(false);
    }

    void loadMaterials();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRetry = () => {
    if (projectId) {
      void loadProject(projectId);
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    router.replace("/login");
  };

  // The 3-Step Delete Logic Function
  const handleDeleteProject = async () => {
    if (deleteStep < 3) {
      setDeleteStep((prev) => prev + 1);
      return;
    }

    setIsDeleting(true);
    const supabase = getSupabaseBrowserClient();
    
    if (supabase && activeProject) {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", activeProject.id);

      if (!error) {
        router.replace("/projects"); // Send user back to main dashboard on success
      } else {
        console.error("Delete failed:", error.message);
        setDeleteStep(0);
        setIsDeleting(false);
      }
    }
  };

  if (authChecking || (isLoading && !activeProject)) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading project...
        </div>
      </div>
    );
  }

  if (error && !activeProject) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Project load failed
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button onClick={handleRetry}>Retry</Button>
            <Button asChild variant="outline">
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to projects
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activeProject) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-border bg-card/90 p-6 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" className="w-fit px-0 text-foreground/65 hover:text-foreground">
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{activeProject.name}</h1>
            <p className="text-sm text-foreground/60">{activeProject.location || "No location provided"}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Dynamic 3-Step Delete Button logic */}
          {deleteStep > 0 && (
            <Button onClick={() => setDeleteStep(0)} variant="ghost" className="text-foreground/65">
              Cancel
            </Button>
          )}
          
          {deleteStep === 0 && (
            <Button onClick={handleDeleteProject} variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Project
            </Button>
          )}
          {deleteStep === 1 && (
            <Button onClick={handleDeleteProject} variant="destructive">
              Are you sure? (1/3)
            </Button>
          )}
          {deleteStep === 2 && (
            <Button onClick={handleDeleteProject} variant="destructive">
              Permanent delete! (2/3)
            </Button>
          )}
          {deleteStep === 3 && (
            <Button onClick={handleDeleteProject} variant="destructive" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              YES, DELETE IT! (3/3)
            </Button>
          )}

          {/* Standard Actions */}
          {deleteStep === 0 && (
            <>
              <Button onClick={handleSignOut} variant="ghost" className="text-foreground/65 hover:text-foreground">
                Sign out
              </Button>
              <Button onClick={handleRetry} variant="outline" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Refresh ledger
              </Button>
            </>
          )}

          <AddPurchaseDialog projectId={activeProject.id} materials={materials} />
        </div>
      </div>

      {materialsError ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-900">
          <CardHeader>
            <CardTitle>Catalog fallback in use</CardTitle>
            <CardDescription>{materialsError}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">The combobox will use the built-in materials list until the live catalog becomes available.</p>
          </CardContent>
        </Card>
      ) : null}

      {loadingMaterials ? (
        <div className="text-sm text-foreground/55">Loading material catalog...</div>
      ) : null}

      <ProjectSummary />
      <CostChart transactions={transactions} />
      
      {/* Mobile-Swipeable Wrapper for the Transaction Table */}
      <div className="w-full overflow-x-auto pb-4">
        <div className="min-w-[800px]">
          <TransactionTable />
        </div>
      </div>

    </main>
  );
}

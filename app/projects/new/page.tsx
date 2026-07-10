"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProjectsRow } from "@/types/database";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [plotPrice, setPlotPrice] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured in the environment.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      router.replace("/login?next=/projects/new");
      return;
    }

    const nextPlotPrice = Number(plotPrice);
    if (!name.trim() || !Number.isFinite(nextPlotPrice) || nextPlotPrice < 0) {
      setError("Enter a project name and a valid plot price.");
      return;
    }

    setIsSubmitting(true);
    const { data, error: insertError } = await supabase
      .from("projects")
      .insert({
        owner_id: sessionData.session.user.id,
        name: name.trim(),
        location: location.trim(),
        plot_price: nextPlotPrice,
        status: "active",
      } as never)
      .select("id")
      .single<Pick<ProjectsRow, "id">>();

    setIsSubmitting(false);

    if (insertError || !data) {
      setError(insertError?.message ?? "Unable to create project.");
      return;
    }

    router.replace(`/projects/${data.id}`);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-12 lg:px-8">
      <Card className="w-full border-border/60 bg-card/95 shadow-[0_30px_80px_rgba(31,59,44,0.12)]">
        <CardHeader>
          <CardTitle className="text-2xl">Create your first project</CardTitle>
          <CardDescription>Set up a project and jump straight into the estimator and ledger.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Project name</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="3-bedroom house" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Lahore, Pakistan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plot-price">Plot price</Label>
              <Input id="plot-price" type="number" min="0" step="0.01" value={plotPrice} onChange={(event) => setPlotPrice(event.target.value)} placeholder="0.00" required />
            </div>

            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
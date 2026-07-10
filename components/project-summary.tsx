"use client";

import * as React from "react";
import { Edit2, Save, X, HardHat, PaintRoller } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProjectStore } from "@/store/useProjectStore";

const formatPKR = (value: number) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
};

export function ProjectSummary() {
  const activeProject = useProjectStore((state) => state.activeProject);
  const transactions = useProjectStore((state) => state.transactions);
  const updatePlotPrice = useProjectStore((state) => state.updatePlotPrice);
  
  const [editingPlotPrice, setEditingPlotPrice] = React.useState(false);
  const [plotPriceDraft, setPlotPriceDraft] = React.useState("");

  React.useEffect(() => {
    setPlotPriceDraft(activeProject?.plotPrice.toString() ?? "");
  }, [activeProject?.plotPrice]);

  if (!activeProject) return null;

  const totals = React.useMemo(() => {
    return (transactions || []).reduce((acc, curr) => {
      // Check for both property names to ensure data is found
      const quantity = Number(curr.quantity) || 0;
      const price = Number(curr.unitPrice ?? curr.unitPrice) || 0;
      const cost = quantity * price;

      // Handle phase calculation with case-insensitivity
      const phase = (curr.phase && String(curr.phase).toLowerCase() === "finishing") 
        ? "Finishing" 
        : "Grey Structure";

      acc[phase] = (acc[phase] || 0) + cost;
      return acc;
    }, { "Grey Structure": 0, "Finishing": 0 });
  }, [transactions]);

  const plotPrice = activeProject.plotPrice || 0;
  const grandTotal = plotPrice + totals["Grey Structure"] + totals["Finishing"];

  const handleSavePlotPrice = async () => {
    const nextPlotPrice = Number(plotPriceDraft);
    if (!Number.isFinite(nextPlotPrice) || nextPlotPrice < 0) return;
    const success = await updatePlotPrice(nextPlotPrice);
    if (success) setEditingPlotPrice(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Plot Price Card */}
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardDescription>Plot Price</CardDescription>
              <CardTitle className="mt-2 text-2xl">
                {editingPlotPrice ? (
                  <Input className="mt-1 w-44" value={plotPriceDraft} onChange={(e) => setPlotPriceDraft(e.target.value)} type="number" min="0" step="0.01" />
                ) : (
                  formatPKR(plotPrice)
                )}
              </CardTitle>
            </div>
            <div className="flex gap-2">
              {editingPlotPrice ? (
                <>
                  <Button size="icon" variant="outline" onClick={handleSavePlotPrice} aria-label="Save">
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingPlotPrice(false)} aria-label="Cancel">
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button size="icon" variant="outline" onClick={() => setEditingPlotPrice(true)} aria-label="Edit">
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Grey Structure Card */}
        <Card className="border-slate-200 bg-slate-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Grey Structure</CardTitle>
            <HardHat className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPKR(totals["Grey Structure"])}</div>
          </CardContent>
        </Card>

        {/* Finishing Card */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Finishing</CardTitle>
            <PaintRoller className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPKR(totals["Finishing"])}</div>
          </CardContent>
        </Card>
      </div>

      {/* Grand Total */}
      <Card className="border-emerald-900/20 bg-emerald-950 text-emerald-50">
        <CardHeader>
          <CardDescription className="text-emerald-200/75">Grand Total House Cost</CardDescription>
          <CardTitle className="text-3xl">{formatPKR(grandTotal)}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
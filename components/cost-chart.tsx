"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/useProjectStore";

export function CostChart() {
  const activeProject = useProjectStore((state) => state.activeProject);
  const transactions = useProjectStore((state) => state.transactions);
  
  // New state to manage whether the graph is open or closed
  const [isExpanded, setIsExpanded] = React.useState(false);

  const chartData = React.useMemo(() => {
    const dataMap = new Map<string, { name: string; spent: number; estimated: number }>();

    // 1. Add estimated budgets
    if (activeProject?.categoryBudgets) {
      Object.entries(activeProject.categoryBudgets).forEach(([name, estimated]) => {
        if (estimated > 0) {
          dataMap.set(name, { name, spent: 0, estimated });
        }
      });
    }

    // 2. Add actual spend
    transactions.forEach((t) => {
      const spent = t.quantity * t.unitPrice;
      if (dataMap.has(t.materialName)) {
        dataMap.get(t.materialName)!.spent += spent;
      } else {
        dataMap.set(t.materialName, { name: t.materialName, spent, estimated: 0 });
      }
    });

    // 3. Filter out items with 0 spent and 0 estimated, and sort by highest total value
    return Array.from(dataMap.values())
      .filter(d => d.spent > 0 || d.estimated > 0)
      .sort((a, b) => Math.max(b.spent, b.estimated) - Math.max(a.spent, a.estimated));
  }, [activeProject, transactions]);

  // Hide the chart entirely if there is no data to show
  if (chartData.length === 0) {
    return null;
  }

  // Find the absolute highest value to scale the progress bars proportionally across the screen
  const maxChartValue = Math.max(...chartData.map(d => Math.max(d.spent, d.estimated)), 1);

  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden transition-all duration-300">
      
      {/* Clickable Header to toggle the graph */}
      <div 
        className="flex cursor-pointer items-center justify-between p-6 hover:bg-slate-50/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="space-y-1.5">
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Budget vs. Actual Spend
          </CardTitle>
          <CardDescription>Visual comparison of your estimated budgets against actual cash spent.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0 rounded-full hover:bg-slate-200/50">
          {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-600" /> : <ChevronDown className="h-5 w-5 text-slate-600" />}
        </Button>
      </div>

      {/* Conditionally rendered Chart Content */}
      {isExpanded && (
        <CardContent className="space-y-7 border-t border-slate-100 pt-6 bg-slate-50/30">
          {chartData.map((item) => {
            // Calculate percentages relative to the largest bar on the chart
            const spentPercent = (item.spent / maxChartValue) * 100;
            const estimatedPercent = (item.estimated / maxChartValue) * 100;
            
            const isOverBudget = item.estimated > 0 && item.spent > item.estimated;

            return (
              <div key={item.name} className="flex flex-col gap-2">
                
                {/* Labels Row */}
                <div className="flex items-end justify-between">
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <div className="text-right flex flex-col sm:flex-row sm:gap-2 sm:items-center">
                    <span className={`text-xs sm:text-sm ${isOverBudget ? "text-red-600 font-bold" : "text-emerald-700 font-semibold"}`}>
                      Spent: Rs {item.spent.toLocaleString()}
                    </span>
                    <span className="hidden sm:inline text-slate-300">|</span>
                    <span className="text-[10px] sm:text-xs text-blue-600 font-semibold uppercase tracking-wider">
                      Est: {item.estimated > 0 ? `Rs ${item.estimated.toLocaleString()}` : "Not set"}
                    </span>
                  </div>
                </div>

                {/* Bars Row */}
                <div className="space-y-2">
                  {/* Estimated Budget Bar */}
                  <div className="flex items-center gap-3">
                    <div className="w-[50px] text-[9px] font-bold uppercase text-blue-400 tracking-wider text-right">Budget</div>
                    <div className="flex-1 h-3 w-full rounded-full bg-slate-100">
                      <div 
                        className="h-full rounded-full bg-blue-400 transition-all duration-700 ease-out" 
                        style={{ width: `${Math.min(estimatedPercent, 100)}%` }} 
                      />
                    </div>
                  </div>
                  
                  {/* Actual Spent Bar */}
                  <div className="flex items-center gap-3">
                    <div className={`w-[50px] text-[9px] font-bold uppercase tracking-wider text-right ${isOverBudget ? 'text-red-500' : 'text-emerald-600'}`}>Spent</div>
                    <div className="flex-1 h-3 w-full rounded-full bg-slate-100 relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min(spentPercent, 100)}%` }} 
                      />
                      
                      {/* Visual warning dot if over budget */}
                      {isOverBudget && (
                        <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-600 border-2 border-white animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>
                
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}

"use client";

import * as React from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Updated to accept both camelCase (frontend) and snake_case (database) formats
export interface TransactionRecord {
  id: string;
  transactionDate?: string;
  transaction_date?: string;
  quantity: number;
  unitPrice?: number;
  unit_price?: number;
}

interface CostChartProps {
  transactions?: TransactionRecord[];
}

const formatPKR = (value: number) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
};

export function CostChart({ transactions = [] }: CostChartProps) {
  const [viewType, setViewType] = React.useState<"daily" | "cumulative">("cumulative");

  const chartData = React.useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const groupedCosts = transactions.reduce((acc, current) => {
      // Safely grab the date and price regardless of which format is passed
      const date = current.transactionDate || current.transaction_date;
      const price = current.unitPrice || current.unit_price || 0;
      
      if (!date) return acc;

      const cost = current.quantity * price;
      acc[date] = (acc[date] || 0) + cost;
      return acc;
    }, {} as Record<string, number>);

    const sortedDates = Object.keys(groupedCosts).sort();

    let runningTotal = 0;
    return sortedDates.map((date) => {
      runningTotal += groupedCosts[date];
      
      const dateObj = new Date(date);
      const displayDate = dateObj.toLocaleDateString("en-PK", { month: "short", day: "numeric" });

      return {
        rawDate: date,
        displayDate,
        dailyCost: groupedCosts[date],
        cumulativeCost: runningTotal,
      };
    });
  }, [transactions]);

  const totalSpent = chartData.length > 0 ? chartData[chartData.length - 1].cumulativeCost : 0;

  if (transactions.length === 0) {
    return (
      <Card className="border-dashed shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-foreground/50">
          <BarChart3 className="mb-2 h-8 w-8 opacity-50" />
          <p>No transactions yet. Add a purchase to see your cash flow graph.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-xl">Cash Flow</CardTitle>
          <CardDescription>Total spent: <span className="font-semibold text-foreground">{formatPKR(totalSpent)}</span></CardDescription>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-1">
          <Button
            variant={viewType === "cumulative" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewType("cumulative")}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Cumulative
          </Button>
          <Button
            variant={viewType === "daily" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewType("daily")}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Daily
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewType === "cumulative" ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#064e3b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#064e3b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `Rs ${value / 1000}k`} 
                  fontSize={12} 
                  width={65}
                />
                <Tooltip 
                  formatter={(value: any) => [formatPKR(Number(value)), "Total Spent"]}
                  labelStyle={{ color: 'black', fontWeight: 'bold', marginBottom: '4px' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulativeCost" 
                  stroke="#064e3b" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCumulative)" 
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `Rs ${value / 1000}k`} 
                  fontSize={12} 
                  width={65}
                />
                <Tooltip 
                  formatter={(value: any) => [formatPKR(Number(value)), "Daily Expense"]}
                  cursor={{ fill: '#f3f4f6' }}
                  labelStyle={{ color: 'black', fontWeight: 'bold', marginBottom: '4px' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="dailyCost" fill="#064e3b" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
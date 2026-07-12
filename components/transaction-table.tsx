"use client";

import * as React from "react";
import { Check, PencilLine, Trash2, X, PlusCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectStore, type MaterialTransactionRecord } from "@/store/useProjectStore";

interface EditDraft {
  quantity: string;
  unitPrice: string;
}

export function TransactionTable() {
  const transactions = useProjectStore((state) => state.transactions);
  const activeProject = useProjectStore((state) => state.activeProject);
  const updateTransaction = useProjectStore((state) => state.updateTransaction);
  const deleteTransaction = useProjectStore((state) => state.deleteTransaction);
  const updateCategoryBudget = useProjectStore((state) => state.updateCategoryBudget);
  
  // State for Material Insights and Budget Editing
  const [selectedMaterialName, setSelectedMaterialName] = React.useState<string | null>(null);
  const [editingBudgetName, setEditingBudgetName] = React.useState<string | null>(null);
  const [budgetDraft, setBudgetDraft] = React.useState<string>("");

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<EditDraft>({ quantity: "", unitPrice: "" });
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);

  // Auto-calculate the totals for each unique material
  const summaryData = React.useMemo(() => {
    const grouped = new Map<string, { name: string; category: string; totalQty: number; totalPrice: number }>();
    
    transactions.forEach((t) => {
      const key = t.materialName;
      if (!grouped.has(key)) {
        grouped.set(key, { name: t.materialName, category: t.category, totalQty: 0, totalPrice: 0 });
      }
      const current = grouped.get(key)!;
      current.totalQty += t.quantity;
      current.totalPrice += t.quantity * t.unitPrice;
    });

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        avgPrice: item.totalQty > 0 ? item.totalPrice / item.totalQty : 0,
      }))
      .sort((a, b) => b.totalPrice - a.totalPrice); 
  }, [transactions]);

  // Auto-select the first material
  React.useEffect(() => {
    if (summaryData.length > 0 && (!selectedMaterialName || !summaryData.find(s => s.name === selectedMaterialName))) {
      setSelectedMaterialName(summaryData[0].name);
    } else if (summaryData.length === 0) {
      setSelectedMaterialName(null);
    }
  }, [summaryData, selectedMaterialName]);

  const selectedStats = summaryData.find(s => s.name === selectedMaterialName);

  // Safely grab the budget from the JSON object (defaults to 0 if not set)
  const currentBudget = selectedStats && activeProject?.categoryBudgets 
    ? (activeProject.categoryBudgets[selectedStats.name] || 0) 
    : 0;

  const handleSaveBudget = async (materialName: string) => {
    const amount = Number(budgetDraft);
    if (Number.isFinite(amount) && amount >= 0) {
      await updateCategoryBudget(materialName, amount);
    }
    setEditingBudgetName(null);
  };

  const startEditing = (transaction: MaterialTransactionRecord) => {
    setEditingId(transaction.id);
    setPendingDeleteId(null);
    setDraft({ quantity: transaction.quantity.toString(), unitPrice: transaction.unitPrice.toString() });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraft({ quantity: "", unitPrice: "" });
  };

  const commitEdit = async (transaction: MaterialTransactionRecord) => {
    const quantity = Number(draft.quantity);
    const unitPrice = Number(draft.unitPrice);
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
      return;
    }
    const success = await updateTransaction(transaction.id, { quantity, unitPrice });
    if (success) cancelEditing();
  };

  const handleDelete = async (transaction: MaterialTransactionRecord) => {
    if (pendingDeleteId !== transaction.id) {
      setPendingDeleteId(transaction.id);
      return;
    }
    const success = await deleteTransaction(transaction.id);
    if (success) setPendingDeleteId(null);
  };

  // --- ADVANCED CSV EXPORT LOGIC ---
  const handleExportCSV = () => {
    // 1. Build the Summary Section
    const summaryHeaders = ["Material", "Category", "Total Quantity Used", "Average Unit Cost", "Total Spend", "Estimated Budget"];
    
    let grandTotalSpend = 0;

    const summaryRows = summaryData.map((s) => {
      grandTotalSpend += s.totalPrice;
      const budget = activeProject?.categoryBudgets?.[s.name] || 0;
      
      return [
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.category.replace(/"/g, '""')}"`,
        s.totalQty,
        s.avgPrice.toFixed(2),
        s.totalPrice.toFixed(2),
        budget > 0 ? budget : "Not Set"
      ].join(",");
    });

    // Add a bold Grand Total row at the bottom of the summary
    const grandTotalRow = [
      `"GRAND TOTAL"`, `""`, `""`, `""`, `"${grandTotalSpend.toFixed(2)}"`, `""`
    ].join(",");

    // 2. Build the Detailed Ledger Section
    const detailedHeaders = ["Date", "Material", "Category", "Vendor", "Quantity", "Unit Price", "Line Total"];

    const detailedRows = transactions.map((t) => {
      const date = new Date(t.transactionDate).toLocaleDateString();
      const material = `"${t.materialName.replace(/"/g, '""')}"`;
      const category = `"${t.category.replace(/"/g, '""')}"`;
      const vendor = `"${(t.vendorName || "").replace(/"/g, '""')}"`;
      const quantity = t.quantity;
      const unitPrice = t.unitPrice;
      const totalCost = (t.quantity * t.unitPrice).toFixed(2);

      return [date, material, category, vendor, quantity, unitPrice, totalCost].join(",");
    });

    // 3. Combine it all together with visual line breaks
    const csvContent = [
      "MATERIAL SUMMARY",
      summaryHeaders.join(","),
      ...summaryRows,
      grandTotalRow,
      "", // Blank row for spacing
      "", // Blank row for spacing
      "DETAILED LEDGER",
      detailedHeaders.join(","),
      ...detailedRows
    ].join("\n");
    
    // 4. Trigger the download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const fileName = activeProject?.name ? `${activeProject.name.replace(/\s+/g, '_')}_Financial_Report.csv` : "Financial_Report.csv";
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. MATERIAL INSIGHTS & BUDGET SECTION */}
      {summaryData.length > 0 ? (
        <Card className="overflow-hidden border-emerald-100 shadow-sm">
          <div className="grid md:grid-cols-3">
            
            {/* Left Column: List of Materials */}
            <div className="border-b border-slate-200 bg-slate-50 p-4 md:col-span-1 md:border-b-0 md:border-r sm:p-6">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Select Material</h3>
              <div className="flex flex-row gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-y-auto md:pb-0 md:max-h-[260px] scrollbar-thin">
                {summaryData.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setSelectedMaterialName(item.name);
                      setEditingBudgetName(null);
                    }}
                    className={`flex-shrink-0 text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      selectedMaterialName === item.name
                        ? "bg-emerald-100 text-emerald-900 shadow-sm ring-1 ring-emerald-200"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Analytics & Budget Tracker */}
            <div className="flex flex-col justify-center bg-white p-4 md:col-span-2 sm:p-6">
              {selectedStats ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedStats.name}</h2>
                    <Badge variant="outline" className="mt-1 border-emerald-200 bg-emerald-50/50 text-emerald-800">
                      {selectedStats.category}
                    </Badge>
                  </div>
                  
                  {/* Top Stats Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Amount Used</div>
                      <div className="text-xl font-bold text-slate-900">{selectedStats.totalQty.toLocaleString()}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Cost</div>
                      <div className="text-xl font-bold text-slate-900">
                        Rs {selectedStats.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Financial Row (Total Spend vs Budget) */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    
                    {/* Total Spend */}
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">Total Spend</div>
                      <div className="text-2xl font-bold text-emerald-700">
                        Rs {selectedStats.totalPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Estimated Budget Controller */}
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 relative">
                      <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-blue-700">
                        <span>Est. Budget</span>
                        {!editingBudgetName && currentBudget > 0 && (
                          <button onClick={() => { setEditingBudgetName(selectedStats.name); setBudgetDraft(currentBudget.toString()); }} className="hover:text-blue-900">
                            <PencilLine className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      {editingBudgetName === selectedStats.name ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Input 
                            value={budgetDraft} onChange={(e) => setBudgetDraft(e.target.value)} 
                            type="number" min="0" placeholder="0" className="h-9 bg-white" 
                            autoFocus
                          />
                          <Button size="icon" variant="outline" className="h-9 w-9 bg-white" onClick={() => handleSaveBudget(selectedStats.name)}>
                            <Check className="h-4 w-4 text-emerald-600" />
                          </Button>
                        </div>
                      ) : currentBudget > 0 ? (
                        <div>
                          <div className="text-2xl font-bold text-blue-800">
                            Rs {currentBudget.toLocaleString()}
                          </div>
                          {/* Visual Progress Bar */}
                          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-blue-200">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${selectedStats.totalPrice > currentBudget ? 'bg-red-500' : 'bg-blue-600'}`} 
                              style={{ width: `${Math.min((selectedStats.totalPrice / currentBudget) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="mt-1 text-[10px] font-semibold text-blue-600/70 text-right">
                            {((selectedStats.totalPrice / currentBudget) * 100).toFixed(1)}% Used
                          </div>
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          className="mt-1 h-8 w-full border border-dashed border-blue-300 bg-white/50 text-blue-600 hover:bg-white hover:text-blue-800"
                          onClick={() => { setEditingBudgetName(selectedStats.name); setBudgetDraft(""); }}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Set Budget
                        </Button>
                      )}
                    </div>

                  </div>

                </div>
              ) : null}
            </div>
          </div>
        </Card>
      ) : null}

      {/* 2. DETAILED LEDGER TABLE */}
      <Card>
        {/* Updated Header with Flexbox to hold the title and the new export button side-by-side */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Detailed Ledger</CardTitle>
          {transactions.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-9 gap-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export Report</span>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-[800px] w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-[0.16em] text-foreground/55">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Material</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Unit price</th>
                  <th className="px-4 py-3">Line total</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-foreground/55" colSpan={7}>
                      No transactions yet. Add your first material purchase to start the ledger.
                    </td>
                  </tr>
                ) : null}
                {transactions.map((transaction) => {
                  const isEditing = editingId === transaction.id;
                  const isDeleteConfirm = pendingDeleteId === transaction.id;
                  const lineTotal = transaction.quantity * transaction.unitPrice;

                  return (
                    <tr key={transaction.id} className="border-t border-border/70 align-top hover:bg-slate-50/50 transition-colors">
                      <td className="whitespace-nowrap px-4 py-4">{new Date(transaction.transactionDate).toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="font-medium">{transaction.materialName}</div>
                          <Badge variant="outline">{transaction.category}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-4">{transaction.vendorName || <span className="text-foreground/45">—</span>}</td>
                      <td className="px-4 py-4">
                        {isEditing ? (
                          <Input value={draft.quantity} onChange={(e) => setDraft((c) => ({ ...c, quantity: e.target.value }))} type="number" min="0" step="0.01" />
                        ) : (
                          <span>{transaction.quantity.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {isEditing ? (
                          <Input value={draft.unitPrice} onChange={(e) => setDraft((c) => ({ ...c, unitPrice: e.target.value }))} type="number" min="0" step="0.01" />
                        ) : (
                          <span>{transaction.unitPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 font-semibold">{lineTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <Button size="icon" variant="outline" onClick={() => commitEdit(transaction)} aria-label="Confirm edit">
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={cancelEditing} aria-label="Cancel edit">
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button size="icon" variant="outline" onClick={() => startEditing(transaction)} aria-label="Edit transaction">
                              <PencilLine className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant={isDeleteConfirm ? "destructive" : "outline"}
                            onClick={() => handleDelete(transaction)}
                            aria-label={isDeleteConfirm ? "Confirm delete" : "Delete transaction"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {isDeleteConfirm ? <div className="mt-2 text-right text-xs text-red-700">Click again to confirm</div> : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

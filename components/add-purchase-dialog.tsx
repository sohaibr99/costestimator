"use client";

import * as React from "react";
import { Loader2, Plus, Receipt } from "lucide-react";
import { MaterialCombobox, type MaterialSelection, type MaterialCatalogOption } from "@/components/material-combobox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjectStore } from "@/store/useProjectStore";

export interface AddPurchaseDialogProps {
  projectId?: string;
  materials?: MaterialCatalogOption[];
  triggerLabel?: string;
}

export function AddPurchaseDialog({ projectId, materials, triggerLabel = "Add Purchase" }: AddPurchaseDialogProps) {
  const addTransaction = useProjectStore((state) => state.addTransaction);
  const [open, setOpen] = React.useState(false);
  
  const [phase, setPhase] = React.useState<"Grey Structure" | "Finishing">("Grey Structure");
  
  const [selection, setSelection] = React.useState<MaterialSelection | null>(null);
  const [quantity, setQuantity] = React.useState("");
  const [unitPrice, setUnitPrice] = React.useState("");
  const [vendorName, setVendorName] = React.useState("");
  const [transactionDate, setTransactionDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [customUnit, setCustomUnit] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const quantityValue = Number(quantity);
  const unitPriceValue = Number(unitPrice);
  const lineTotal = Number.isFinite(quantityValue) && Number.isFinite(unitPriceValue) ? quantityValue * unitPriceValue : 0;

  const resetForm = React.useCallback(() => {
    setSelection(null);
    setQuantity("");
    setUnitPrice("");
    setVendorName("");
    setPhase("Grey Structure"); 
    setTransactionDate(new Date().toISOString().slice(0, 10));
    setCustomUnit("");
    setNotes("");
    setError(null);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!selection) {
      setError("Select a material first.");
      return;
    }

    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (!Number.isFinite(unitPriceValue) || unitPriceValue < 0) {
      setError("Unit price must be zero or greater.");
      return;
    }

    setIsSubmitting(true);
    
    const result = await addTransaction({
      projectId,
      catalogId: selection.catalogId,
      customItemName: selection.mode === "custom" ? selection.materialName : null,
      customUnit: selection.mode === "custom" ? customUnit.trim() : selection.materialUnit,
      materialName: selection.materialName,
      materialUnit: selection.mode === "custom" ? customUnit.trim() : selection.materialUnit,
      category: selection.category,
      quantity: quantityValue,
      unitPrice: unitPriceValue,
      vendorName: vendorName.trim(),
      transactionDate,
      notes: notes.trim(),
      phase: phase,
    });
    
    setIsSubmitting(false);

    if (!result) {
      setError(useProjectStore.getState().error ?? "Unable to save purchase.");
      return;
    }

    resetForm();
    setOpen(false);
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        className="h-11 w-full gap-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        {/* We use flex layout to pin the header and footer, allowing ONLY the center content to scroll */}
        <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-[500px] flex-col overflow-hidden rounded-[2rem] p-0 sm:p-0">
          
          {/* Header - Pinned at top */}
          <div className="flex-shrink-0 px-6 pt-6 sm:px-8 sm:pt-8">
            <DialogHeader className="text-left">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Receipt className="h-6 w-6" />
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-900">Add Purchase</DialogTitle>
              <DialogDescription className="text-slate-500">
                Record a material transaction and set the construction phase.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Form - Scrollable middle section */}
          <div className="flex-1 overflow-y-auto px-6 py-4 sm:px-8">
            <form id="purchase-form" className="space-y-5" onSubmit={handleSubmit}>
              
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setPhase("Grey Structure")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    phase === "Grey Structure" 
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Grey Structure
                </button>
                <button
                  type="button"
                  onClick={() => setPhase("Finishing")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    phase === "Finishing" 
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Finishing
                </button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Material</Label>
                <MaterialCombobox 
                  materials={materials} 
                  value={selection} 
                  onChange={setSelection}
                  placeholder="Click to select a material..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quantity</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={quantity} 
                    onChange={(event) => setQuantity(event.target.value)} 
                    placeholder="0" 
                    className="h-12 rounded-xl bg-slate-50 focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-price" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Unit price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">Rs</span>
                    <Input 
                      id="unit-price" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={unitPrice} 
                      onChange={(event) => setUnitPrice(event.target.value)} 
                      placeholder="0.00" 
                      className="h-12 rounded-xl bg-slate-50 pl-9 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vendor-name" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Vendor name</Label>
                  <Input 
                    id="vendor-name" 
                    value={vendorName} 
                    onChange={(event) => setVendorName(event.target.value)} 
                    className="h-12 rounded-xl bg-slate-50 focus-visible:ring-emerald-500"
                    placeholder="e.g. Ali Hardware"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction-date" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Date</Label>
                  <Input 
                    id="transaction-date" 
                    type="date" 
                    value={transactionDate} 
                    onChange={(event) => setTransactionDate(event.target.value)} 
                    className="h-12 rounded-xl bg-slate-50 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-emerald-800">Line total preview</span>
                  <span className="text-lg font-bold text-emerald-900">
                    Rs {lineTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
            </form>
          </div>

          {/* Footer - Pinned at bottom */}
          <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:px-8">
            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
               <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-12 w-full rounded-xl border-slate-200 bg-white sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="purchase-form"
                disabled={isSubmitting} 
                className="h-12 w-full rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 sm:w-auto"
              >
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Save purchase"}
              </Button>
            </DialogFooter>
          </div>

        </DialogContent>
      </Dialog>
    </>
  );
}

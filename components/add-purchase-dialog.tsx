"use client";

import * as React from "react";
import { Loader2, Plus } from "lucide-react";
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
  
  // State for construction phase
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
    setPhase("Grey Structure"); // Resets the modal's internal state for the next time it opens
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
      category: selection.category, // Retains the original catalog category
      quantity: quantityValue,
      unitPrice: unitPriceValue,
      vendorName: vendorName.trim(),
      transactionDate,
      notes: notes.trim(),
      phase: phase, // Successfully attaches the user-selected phase
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
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add purchase</DialogTitle>
            <DialogDescription>Record a material transaction and set the construction phase.</DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Phase Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
              <Button 
                type="button" 
                variant={phase === "Grey Structure" ? "default" : "ghost"} 
                onClick={() => setPhase("Grey Structure")}
                className="shadow-sm"
              >
                Grey Structure
              </Button>
              <Button 
                type="button" 
                variant={phase === "Finishing" ? "default" : "ghost"} 
                onClick={() => setPhase("Finishing")}
                className="shadow-sm"
              >
                Finishing
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Material</Label>
              <MaterialCombobox 
                materials={materials} 
                value={selection} 
                onChange={setSelection}
                placeholder="Click to select a material..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" min="0" step="0.01" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit-price">Unit price</Label>
                <Input id="unit-price" type="number" min="0" step="0.01" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} placeholder="0.00" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vendor-name">Vendor name</Label>
                <Input id="vendor-name" value={vendorName} onChange={(event) => setVendorName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction-date">Date</Label>
                <Input id="transaction-date" type="date" value={transactionDate} onChange={(event) => setTransactionDate(event.target.value)} />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/35 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground/65">Line total preview</span>
                <span className="text-lg font-semibold">{lineTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-900 text-white hover:bg-emerald-800">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save purchase"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
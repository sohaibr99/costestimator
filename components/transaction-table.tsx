"use client";

import * as React from "react";
import { Check, PencilLine, Trash2, X } from "lucide-react";
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
  const updateTransaction = useProjectStore((state) => state.updateTransaction);
  const deleteTransaction = useProjectStore((state) => state.deleteTransaction);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<EditDraft>({ quantity: "", unitPrice: "" });
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);

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
    if (success) {
      cancelEditing();
    }
  };

  const handleDelete = async (transaction: MaterialTransactionRecord) => {
    if (pendingDeleteId !== transaction.id) {
      setPendingDeleteId(transaction.id);
      return;
    }

    const success = await deleteTransaction(transaction.id);
    if (success) {
      setPendingDeleteId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Material ledger</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Changed overflow-hidden to overflow-x-auto to enable horizontal scrolling on mobile */}
        <div className="overflow-x-auto rounded-2xl border border-border">
          {/* Added min-w-[800px] to force the table to stay wide enough to require scrolling */}
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
                  <tr key={transaction.id} className="border-t border-border/70 align-top">
                    <td className="px-4 py-4 whitespace-nowrap">{new Date(transaction.transactionDate).toLocaleDateString()}</td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="font-medium">{transaction.materialName}</div>
                        <Badge variant="outline">{transaction.category}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-4">{transaction.vendorName || <span className="text-foreground/45">—</span>}</td>
                    <td className="px-4 py-4">
                      {isEditing ? (
                        <Input value={draft.quantity} onChange={(event) => setDraft((current) => ({ ...current, quantity: event.target.value }))} type="number" min="0" step="0.01" />
                      ) : (
                        <span>{transaction.quantity.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {isEditing ? (
                        <Input value={draft.unitPrice} onChange={(event) => setDraft((current) => ({ ...current, unitPrice: event.target.value }))} type="number" min="0" step="0.01" />
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
                      {isDeleteConfirm ? <div className="mt-2 text-right text-xs text-red-700">Click delete again to confirm</div> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

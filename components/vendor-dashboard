"use client";

import * as React from "react";
import { Package, Wallet, FileText, Plus, Settings2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useProjectStore } from "@/store/useProjectStore";
export function VendorDashboard() {
  const vendorOrders = useProjectStore((state) => state.vendorOrders) || [];
  const addVendorOrder = useProjectStore((state) => state.addVendorOrder);
  const updateVendorOrder = useProjectStore((state) => state.updateVendorOrder);
  const deleteVendorOrder = useProjectStore((state) => state.deleteVendorOrder);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingOrder, setEditingOrder] = React.useState<any>(null);

  // Form State
  const [vendorName, setVendorName] = React.useState("");
  const [material, setMaterial] = React.useState("");
  const [unit, setUnit] = React.useState("tons");
  const [orderedQty, setOrderedQty] = React.useState("");
  const [receivedQty, setReceivedQty] = React.useState("");
  const [amountPaid, setAmountPaid] = React.useState("");

  const handleOpenNew = () => {
    setEditingOrder(null);
    setVendorName(""); setMaterial(""); setUnit("tons");
    setOrderedQty(""); setReceivedQty("0"); setAmountPaid("0");
    setIsModalOpen(true);
  };
  
// @ts-ignore
  const handleOpenEdit = (order) => {
    setEditingOrder(order);
    setVendorName(order.vendorName);
    setMaterial(order.material);
    setUnit(order.unit);
    setOrderedQty(order.orderedQty.toString());
    setReceivedQty(order.receivedQty.toString());
    setAmountPaid(order.amountPaid.toString());
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!vendorName || !material || !orderedQty) return;

    if (editingOrder) {
      await updateVendorOrder(editingOrder.id, {
        vendorName, material, unit,
        orderedQty: Number(orderedQty),
        receivedQty: Number(receivedQty),
        amountPaid: Number(amountPaid)
      });
    } else {
      await addVendorOrder({
        vendorName, material, unit,
        orderedQty: Number(orderedQty),
        receivedQty: Number(receivedQty) || 0,
        amountPaid: Number(amountPaid) || 0
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <FileText className="w-5 h-5 text-indigo-600" />
            Bulk Contracts & Advances
          </h2>
          <p className="text-sm text-slate-500">Track large orders separate from your daily material ledger.</p>
        </div>
        <Button onClick={handleOpenNew} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> New Contract
        </Button>
      </div>

      {vendorOrders.length === 0 ? (
        <Card className="border-dashed border-slate-200 bg-slate-50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <Package className="h-10 w-10 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No bulk contracts yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Use this area to track massive upfront orders (e.g. 1000 tons of steel) and monitor what has been delivered so far.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendorOrders.map((order) => {
            const remaining = order.orderedQty - order.receivedQty;
            const progress = Math.min((order.receivedQty / order.orderedQty) * 100, 100) || 0;

            return (
              <Card key={order.id} className="border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold">{order.vendorName}</CardTitle>
                      <CardDescription className="text-indigo-600 font-semibold mt-1">
                        Contract: {order.orderedQty} {order.unit} of {order.material}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(order)}>
                      <Settings2 className="w-4 h-4 mr-2" /> Manage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-6">
                  
                  {/* Delivery Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="text-slate-600">Delivered: {order.receivedQty} {order.unit}</span>
                      <span className="text-slate-900 font-bold">Remaining: {remaining > 0 ? remaining : 0} {order.unit}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {/* Financial Overview */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Advance Paid</span>
                    </div>
                    <div className="text-xl font-bold text-emerald-700">
                      Rs {order.amountPaid.toLocaleString()}
                    </div>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tracker Management Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingOrder ? "Update Contract Details" : "Create Bulk Contract"}</DialogTitle>
            <DialogDescription>Track the total ordered versus what has physically arrived at the site.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vendor Name</Label>
                <Input value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="Ali Steel" />
              </div>
              <div className="space-y-2">
                <Label>Material</Label>
                <Input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Steel Grade 60" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Ordered</Label>
                <Input type="number" value={orderedQty} onChange={(e) => setOrderedQty(e.target.value)} placeholder="1000" />
              </div>
              <div className="space-y-2">
                <Label>Unit type</Label>
                <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="tons" />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-indigo-700">How much has arrived so far?</Label>
                <Input type="number" value={receivedQty} onChange={(e) => setReceivedQty(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-emerald-700">Total Advance Paid (Rs)</Label>
                <Input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
              </div>
            </div>

          </div>
          <DialogFooter className="flex justify-between items-center sm:justify-between">
            {editingOrder ? (
              <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => {
                deleteVendorOrder(editingOrder.id);
                setIsModalOpen(false);
              }}>
                <Trash2 className="w-4 h-4 mr-2"/> Delete
              </Button>
            ) : <div/>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

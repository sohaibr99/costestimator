"use client";

import { create } from "zustand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  MaterialTransactionsInsert,
  MaterialTransactionsRow,
  ProjectsRow,
  MaterialsCatalogRow,
} from "@/types/database";

export interface CatalogOption {
  id: string;
  category: string;
  name: string;
  unit: string;
}

export interface MaterialTransactionRecord {
  id: string;
  projectId: string;
  phase?: string;
  catalogId: string | null;
  customItemName: string | null;
  customUnit: string | null;
  materialName: string;
  materialUnit: string;
  category: string;
  quantity: number;
  unitPrice: number;
  vendorName: string;
  transactionDate: string;
  notes: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRecord {
  id: string;
  ownerId: string;
  name: string;
  location: string;
  plotPrice: number;
  status: "active" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface MaterialSummary {
  key: string;
  name: string;
  unit: string;
  category: string;
  totalQuantity: number;
  totalCost: number;
  weightedAvgUnitCost: number;
  transactionCount: number;
}

interface ProjectState {
  activeProject: ProjectRecord | null;
  transactions: MaterialTransactionRecord[];
  isLoading: boolean;
  error: string | null;
  loadProject(projectId: string): Promise<void>;
  addTransaction(input: AddTransactionInput): Promise<MaterialTransactionRecord | null>;
  updateTransaction(transactionId: string, updates: UpdateTransactionInput): Promise<boolean>;
  deleteTransaction(transactionId: string): Promise<boolean>;
  updatePlotPrice(plotPrice: number): Promise<boolean>;
}

export interface AddTransactionInput {
  phase: "Grey Structure" | "Finishing";
  projectId?: string;
  catalogId?: string | null;
  customItemName?: string | null;
  customUnit?: string | null;
  materialName: string;
  materialUnit: string;
  category: string;
  quantity: number;
  unitPrice: number;
  vendorName?: string;
  transactionDate: string;
  notes?: string;
  createdBy?: string | null;
}

export interface UpdateTransactionInput {
  phase?: "Grey Structure" | "Finishing";
  quantity?: number;
  unitPrice?: number;
  vendorName?: string;
  transactionDate?: string;
  notes?: string;
  catalogId?: string | null;
  customItemName?: string | null;
  customUnit?: string | null;
  materialName?: string;
  materialUnit?: string;
  category?: string;
}

interface ProjectQueryRow extends ProjectsRow {
  material_transactions: Array<
    MaterialTransactionsRow & {
      phase?: string;
      materials_catalog: MaterialsCatalogRow | null;
    }
  > | null;
}

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeProject(row: ProjectsRow): ProjectRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    location: row.location,
    plotPrice: toNumber(row.plot_price),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeTransaction(
  row: MaterialTransactionsRow & { phase?: string },
  catalog: MaterialsCatalogRow | null,
): MaterialTransactionRecord {
  const materialName = catalog?.name ?? row.custom_item_name ?? "Custom item";
  const materialUnit = catalog?.unit ?? row.custom_unit ?? "unit";
  const category = catalog?.category ?? "Custom";

  return {
    id: row.id,
    projectId: row.project_id,
    catalogId: row.catalog_id,
    customItemName: row.custom_item_name,
    customUnit: row.custom_unit,
    materialName,
    materialUnit,
    category,
    quantity: toNumber(row.quantity),
    unitPrice: toNumber(row.unit_price),
    vendorName: row.vendor_name,
    transactionDate: row.transaction_date,
    notes: row.notes,
    phase: row.phase, 
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function materialKey(transaction: MaterialTransactionRecord): string {
  return transaction.catalogId ? transaction.catalogId : `custom:${transaction.materialName}`;
}

export function getMaterialSummaries(transactions: MaterialTransactionRecord[]): MaterialSummary[] {
  const groups = new Map<string, MaterialSummary>();

  for (const transaction of transactions) {
    const key = materialKey(transaction);
    const totalCost = transaction.quantity * transaction.unitPrice;
    const existing = groups.get(key);

    if (existing) {
      existing.totalQuantity += transaction.quantity;
      existing.totalCost += totalCost;
      existing.transactionCount += 1;
      existing.weightedAvgUnitCost = existing.totalQuantity > 0 ? existing.totalCost / existing.totalQuantity : 0;
      continue;
    }

    groups.set(key, {
      key,
      name: transaction.materialName,
      unit: transaction.materialUnit,
      category: transaction.category,
      totalQuantity: transaction.quantity,
      totalCost,
      weightedAvgUnitCost: transaction.quantity > 0 ? totalCost / transaction.quantity : 0,
      transactionCount: 1,
    });
  }

  return Array.from(groups.values()).sort((left, right) => left.category.localeCompare(right.category) || left.name.localeCompare(right.name));
}

export function getTotalMaterialCost(transactions: MaterialTransactionRecord[]): number {
  return transactions.reduce((sum, transaction) => sum + transaction.quantity * transaction.unitPrice, 0);
}

export function getGrandTotal(plotPrice: number, transactions: MaterialTransactionRecord[]): number {
  return plotPrice + getTotalMaterialCost(transactions);
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  activeProject: null,
  transactions: [],
  isLoading: false,
  error: null,

  async loadProject(projectId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      set({ isLoading: false, error: "Database client is not configured properly." });
      return;
    }

    set({ isLoading: true, error: null });

    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, owner_id, name, location, plot_price, status, created_at, updated_at, material_transactions(id, project_id, catalog_id, custom_item_name, custom_unit, quantity, unit_price, vendor_name, transaction_date, notes, phase, created_by, created_at, updated_at, materials_catalog(id, category, name, unit, is_active, created_at))",
      )
      .eq("id", projectId)
      .maybeSingle<ProjectQueryRow>();

    if (error || !data) {
      set({ isLoading: false, error: error?.message ?? "Project not found." });
      return;
    }

    const transactions = (data.material_transactions ?? []).map((transaction) =>
      normalizeTransaction(transaction, transaction.materials_catalog),
    );

    set({
      activeProject: normalizeProject(data),
      transactions,
      isLoading: false,
      error: null,
    });
  },

  async addTransaction(input: AddTransactionInput) {
    const supabase = getSupabaseBrowserClient();
    
    if (!supabase) {
      set({ error: "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not configured." });
      return null;
    }

    const projectId = input.projectId ?? get().activeProject?.id;
    if (!projectId) {
      return null;
    }

    const optimisticRow: MaterialTransactionRecord = {
      id: `temp-${Date.now()}`,
      projectId,
      catalogId: input.catalogId ?? null,
      customItemName: input.customItemName ?? null,
      customUnit: input.customUnit ?? null,
      materialName: input.materialName,
      materialUnit: input.materialUnit,
      category: input.category,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      vendorName: input.vendorName ?? "",
      transactionDate: input.transactionDate,
      phase: input.phase,
      notes: input.notes ?? "",
      createdBy: input.createdBy ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const previousTransactions = get().transactions;
    set({ transactions: [optimisticRow, ...previousTransactions] });

    const payload = {
      project_id: projectId,
      catalog_id: input.catalogId ?? null,
      custom_item_name: input.customItemName ?? null,
      custom_unit: input.customUnit ?? null,
      quantity: input.quantity,
      unit_price: input.unitPrice,
      vendor_name: input.vendorName ?? "",
      transaction_date: input.transactionDate,
      notes: input.notes ?? "",
      phase: input.phase,
      created_by: input.createdBy ?? null,
    } as any; 

    const { data, error } = await supabase
      .from("material_transactions")
      .insert([payload as never])
      .select("id, project_id, catalog_id, custom_item_name, custom_unit, quantity, unit_price, vendor_name, transaction_date, notes, phase, created_by, created_at, updated_at, materials_catalog(id, category, name, unit, is_active, created_at)")
      .single();

    if (error || !data) {
      set({ transactions: previousTransactions, error: error?.message ?? "Unable to add transaction." });
      return null;
    }

    const persisted = normalizeTransaction(
      data as MaterialTransactionsRow,
      (data as MaterialTransactionsRow & { materials_catalog: MaterialsCatalogRow | null }).materials_catalog ?? null,
    );

    set({
      transactions: get().transactions.map((transaction) => (transaction.id === optimisticRow.id ? persisted : transaction)),
      error: null,
    });

    return persisted;
  },

  async updateTransaction(transactionId: string, updates: UpdateTransactionInput) {
    const supabase = getSupabaseBrowserClient();
    
    if (!supabase) {
      set({ error: "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not configured." });
      return false;
    }

    const snapshot = get().transactions;
    const current = snapshot.find((transaction) => transaction.id === transactionId);
    if (!current) {
      return false;
    }

    const nextTransaction: MaterialTransactionRecord = {
      ...current,
      ...updates,
      phase: updates.phase ?? current.phase,
      quantity: updates.quantity ?? current.quantity,
      unitPrice: updates.unitPrice ?? current.unitPrice,
      vendorName: updates.vendorName ?? current.vendorName,
      transactionDate: updates.transactionDate ?? current.transactionDate,
      notes: updates.notes ?? current.notes,
      catalogId: updates.catalogId ?? current.catalogId,
      customItemName: updates.customItemName ?? current.customItemName,
      customUnit: updates.customUnit ?? current.customUnit,
      materialName: updates.materialName ?? current.materialName,
      materialUnit: updates.materialUnit ?? current.materialUnit,
      category: updates.category ?? current.category,
      updatedAt: new Date().toISOString(),
    };

    set({ transactions: snapshot.map((transaction) => (transaction.id === transactionId ? nextTransaction : transaction)) });

    const payload: Partial<MaterialTransactionsInsert> & { phase?: string } = {
      catalog_id: nextTransaction.catalogId,
      custom_item_name: nextTransaction.customItemName,
      custom_unit: nextTransaction.customUnit,
      quantity: nextTransaction.quantity,
      unit_price: nextTransaction.unitPrice,
      vendor_name: nextTransaction.vendorName,
      transaction_date: nextTransaction.transactionDate,
      notes: nextTransaction.notes,
      phase: nextTransaction.phase, 
    };

    const { error } = await supabase.from("material_transactions").update(payload as never).eq("id", transactionId);

    if (error) {
      set({ transactions: snapshot, error: error.message });
      return false;
    }

    set({ error: null });
    return true;
  },

  async deleteTransaction(transactionId: string) {
    const supabase = getSupabaseBrowserClient();
    
    if (!supabase) {
      set({ error: "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not configured." });
      return false;
    }

    const snapshot = get().transactions;
    set({ transactions: snapshot.filter((transaction) => transaction.id !== transactionId) });

    const { error } = await supabase.from("material_transactions").delete().eq("id", transactionId);

    if (error) {
      set({ transactions: snapshot, error: error.message });
      return false;
    }

    set({ error: null });
    return true;
  },

  async updatePlotPrice(plotPrice: number) {
    const supabase = getSupabaseBrowserClient();
    
    if (!supabase) {
      set({ error: "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not configured." });
      return false;
    }

    const project = get().activeProject;
    if (!project) {
      return false;
    }

    const snapshot = project;
    set({ activeProject: { ...project, plotPrice } });

    const { error } = await supabase.from("projects").update({ plot_price: plotPrice } as never).eq("id", project.id);

    if (error) {
      set({ activeProject: snapshot, error: error.message });
      return false;
    }

    set({ error: null });
    return true;
  },
}));
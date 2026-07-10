export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfilesRow;
        Insert: ProfilesInsert;
        Update: ProfilesUpdate;
      };
      projects: {
        Row: ProjectsRow;
        Insert: ProjectsInsert;
        Update: ProjectsUpdate;
      };
      materials_catalog: {
        Row: MaterialsCatalogRow;
        Insert: MaterialsCatalogInsert;
        Update: MaterialsCatalogUpdate;
      };
      material_transactions: {
        Row: MaterialTransactionsRow;
        Insert: MaterialTransactionsInsert;
        Update: MaterialTransactionsUpdate;
      };
    };
    Views: {
      project_material_summary: {
        Row: ProjectMaterialSummaryRow;
      };
    };
  };
}

export interface ProfilesRow {
  id: string;
  full_name: string | null;
  company_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfilesInsert {
  id: string;
  full_name?: string | null;
  company_name?: string | null;
  email?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProfilesUpdate {
  full_name?: string | null;
  company_name?: string | null;
  email?: string | null;
  updated_at?: string;
}

export interface ProjectsRow {
  id: string;
  owner_id: string;
  name: string;
  location: string;
  plot_price: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ProjectsInsert {
  id?: string;
  owner_id: string;
  name: string;
  location?: string;
  plot_price?: number | string;
  status?: 'active' | 'completed' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export interface ProjectsUpdate {
  owner_id?: string;
  name?: string;
  location?: string;
  plot_price?: number | string;
  status?: 'active' | 'completed' | 'archived';
  updated_at?: string;
}

export interface MaterialsCatalogRow {
  id: string;
  category: string;
  name: string;
  unit: string;
  is_active: boolean;
  created_at: string;
}

export interface MaterialsCatalogInsert {
  id?: string;
  category: string;
  name: string;
  unit: string;
  is_active?: boolean;
  created_at?: string;
}

export interface MaterialsCatalogUpdate {
  category?: string;
  name?: string;
  unit?: string;
  is_active?: boolean;
}

export interface MaterialTransactionsRow {
  id: string;
  project_id: string;
  catalog_id: string | null;
  custom_item_name: string | null;
  custom_unit: string | null;
  quantity: string;
  unit_price: string;
  vendor_name: string;
  transaction_date: string;
  notes: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaterialTransactionsInsert {
  id?: string;
  project_id: string;
  catalog_id?: string | null;
  custom_item_name?: string | null;
  custom_unit?: string | null;
  quantity: number | string;
  unit_price: number | string;
  vendor_name?: string;
  transaction_date?: string;
  notes?: string;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MaterialTransactionsUpdate {
  catalog_id?: string | null;
  custom_item_name?: string | null;
  custom_unit?: string | null;
  quantity?: number | string;
  unit_price?: number | string;
  vendor_name?: string;
  transaction_date?: string;
  notes?: string;
  created_by?: string | null;
  updated_at?: string;
}

export interface ProjectMaterialSummaryRow {
  project_id: string;
  item_key: string;
  item_name: string | null;
  item_unit: string | null;
  category: string | null;
  total_quantity: string | null;
  total_cost: string | null;
  weighted_avg_unit_cost: string | null;
  transaction_count: number | null;
}
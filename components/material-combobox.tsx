"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { MATERIALS_CATALOG, getMaterialsByCategory } from "@/lib/constants/materials";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandHeader, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface CatalogOption {
  id: string;
  category: string;
  name: string;
  unit: string;
}

export interface MaterialSelection {
  mode: "catalog" | "custom";
  catalogId: string | null;
  category: string;
  materialName: string;
  materialUnit: string;
}

export interface MaterialComboboxProps {
  materials?: CatalogOption[];
  value: MaterialSelection | null;
  onChange(selection: MaterialSelection): void;
  placeholder?: string;
  className?: string;
}

function normalizeMaterials(materials?: CatalogOption[]): CatalogOption[] {
  return materials && materials.length > 0 ? materials : MATERIALS_CATALOG;
}

export function MaterialCombobox({ materials, value, onChange, placeholder = "Search materials...", className }: MaterialComboboxProps) {
  const activeMaterials = React.useMemo(() => normalizeMaterials(materials), [materials]);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(value?.materialName ?? "");
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (value) {
      setQuery(value.mode === "custom" ? value.materialName : value.materialName);
    }
  }, [value]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const filteredMaterials = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return activeMaterials;
    }
    return activeMaterials.filter((material) => material.name.toLowerCase().includes(normalizedQuery));
  }, [activeMaterials, query]);

  const groupedMaterials = React.useMemo(() => getMaterialsByCategory(filteredMaterials), [filteredMaterials]);
  const queryHasExactMatch = activeMaterials.some((material) => material.name.toLowerCase() === query.trim().toLowerCase());

  const handleSelectCatalog = (material: CatalogOption) => {
    onChange({
      mode: "catalog",
      catalogId: material.id,
      category: material.category,
      materialName: material.name,
      materialUnit: material.unit,
    });
    setOpen(false);
  };

  const handleSelectCustom = () => {
    const fallbackName = query.trim();
    if (!fallbackName) {
      return;
    }

    onChange({
      mode: "custom",
      catalogId: null,
      category: "Custom",
      materialName: fallbackName,
      materialUnit: "unit",
    });
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        ref={triggerRef}
        variant="outline"
        className="w-full justify-between rounded-2xl px-4 py-3 text-left"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex min-w-0 flex-col items-start gap-1 text-left">
          <span className="truncate font-medium">{value?.materialName ?? placeholder}</span>
          <span className="text-xs text-foreground/55">{value ? `${value.category} • ${value.materialUnit}` : "Choose from the catalog or add a custom item"}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-60" />
      </Button>

      {open ? (
        <div ref={panelRef} className="absolute left-0 top-full z-50 mt-3 w-full rounded-3xl border border-border bg-card shadow-2xl">
          <Command>
            <div className="border-b border-border p-2">
              <CommandInput
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type to filter materials..."
              />
            </div>
            <CommandList>
              {query.trim() && !queryHasExactMatch ? (
                <CommandItem className="justify-start gap-2 border border-dashed border-border bg-muted/40" onClick={handleSelectCustom}>
                  <Plus className="h-4 w-4" />
                  Add “{query.trim()}” as custom item
                </CommandItem>
              ) : null}

              {Object.keys(groupedMaterials).length === 0 ? (
                <CommandEmpty>No materials found.</CommandEmpty>
              ) : (
                Object.entries(groupedMaterials).map(([category, items]) => (
                  <CommandGroup key={category}>
                    <CommandHeader>{category}</CommandHeader>
                    {items.map((material) => {
                      const selected = value?.mode === "catalog" && value.catalogId === material.id;
                      return (
                        <CommandItem key={material.id} onClick={() => handleSelectCatalog(material)}>
                          <span className="flex min-w-0 flex-col text-left">
                            <span className="truncate font-medium">{material.name}</span>
                            <span className="text-xs text-foreground/55">Unit: {material.unit}</span>
                          </span>
                          {selected ? <Check className="h-4 w-4" /> : <Badge variant="outline">{material.unit}</Badge>}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                ))
              )}

              <CommandSeparator />
              <div className="p-2 text-xs text-foreground/55">Static catalog fallback: {normalizeMaterials(materials).length} items loaded.</div>
            </CommandList>
          </Command>
        </div>
      ) : null}
    </div>
  );
}

export type { CatalogOption as MaterialCatalogOption };
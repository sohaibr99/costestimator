export interface MaterialCatalogItem {
  id: string;
  category: string;
  name: string;
  unit: string;
}

export const MATERIALS_CATALOG: MaterialCatalogItem[] = [
  { id: "foundation-opc-cement", category: "Foundation & Grey Structure", name: "Cement - OPC", unit: "bag" },
  { id: "foundation-src-cement", category: "Foundation & Grey Structure", name: "Cement - SRC", unit: "bag" },
  { id: "foundation-white-cement", category: "Foundation & Grey Structure", name: "Cement - White", unit: "bag" },
  { id: "foundation-brick-class-a", category: "Foundation & Grey Structure", name: "Bricks - Class A", unit: "piece" },
  { id: "foundation-brick-class-b", category: "Foundation & Grey Structure", name: "Bricks - Class B", unit: "piece" },
  { id: "foundation-brick-fly-ash", category: "Foundation & Grey Structure", name: "Bricks - Fly Ash", unit: "piece" },
  { id: "foundation-sand-fine", category: "Foundation & Grey Structure", name: "Sand - Fine", unit: "cft" },
  { id: "foundation-sand-coarse", category: "Foundation & Grey Structure", name: "Sand - Coarse", unit: "cft" },
  { id: "foundation-crush-gravel", category: "Foundation & Grey Structure", name: "Crush/Gravel", unit: "cft" },
  { id: "foundation-steel-grade-40", category: "Foundation & Grey Structure", name: "Steel Rebar - Grade 40", unit: "kg" },
  { id: "foundation-steel-grade-60", category: "Foundation & Grey Structure", name: "Steel Rebar - Grade 60", unit: "kg" },
  { id: "foundation-binding-wire", category: "Foundation & Grey Structure", name: "Binding Wire", unit: "kg" },
  { id: "foundation-concrete-block-4", category: "Foundation & Grey Structure", name: "Concrete Blocks - 4 inch", unit: "piece" },
  { id: "foundation-concrete-block-6", category: "Foundation & Grey Structure", name: "Concrete Blocks - 6 inch", unit: "piece" },
  { id: "foundation-concrete-block-8", category: "Foundation & Grey Structure", name: "Concrete Blocks - 8 inch", unit: "piece" },
  { id: "foundation-dpc", category: "Foundation & Grey Structure", name: "DPC", unit: "roll" },
  { id: "foundation-ready-mix-concrete", category: "Foundation & Grey Structure", name: "Ready-Mix Concrete", unit: "cubic meter" },
  { id: "foundation-scaffolding-pipe", category: "Foundation & Grey Structure", name: "Scaffolding Pipe", unit: "piece" },
  { id: "foundation-shuttering-plywood", category: "Foundation & Grey Structure", name: "Shuttering Plywood", unit: "sheet" },
  { id: "foundation-lime", category: "Foundation & Grey Structure", name: "Lime", unit: "kg" },
  { id: "foundation-waterproofing-compound", category: "Foundation & Grey Structure", name: "Waterproofing Compound", unit: "kg" },

  { id: "mep-pvc-pipe-20mm", category: "MEP", name: "PVC Pipe - 20 mm", unit: "meter" },
  { id: "mep-pvc-pipe-25mm", category: "MEP", name: "PVC Pipe - 25 mm", unit: "meter" },
  { id: "mep-pvc-pipe-32mm", category: "MEP", name: "PVC Pipe - 32 mm", unit: "meter" },
  { id: "mep-upvc-pipe-1inch", category: "MEP", name: "UPVC Pipe - 1 inch", unit: "meter" },
  { id: "mep-upvc-pipe-2inch", category: "MEP", name: "UPVC Pipe - 2 inch", unit: "meter" },
  { id: "mep-copper-wire-1-5", category: "MEP", name: "Copper Wiring - 1.5 mm²", unit: "meter" },
  { id: "mep-copper-wire-2-5", category: "MEP", name: "Copper Wiring - 2.5 mm²", unit: "meter" },
  { id: "mep-copper-wire-4", category: "MEP", name: "Copper Wiring - 4 mm²", unit: "meter" },
  { id: "mep-copper-wire-6", category: "MEP", name: "Copper Wiring - 6 mm²", unit: "meter" },
  { id: "mep-conduit-20mm", category: "MEP", name: "Conduit - 20 mm", unit: "meter" },
  { id: "mep-conduit-25mm", category: "MEP", name: "Conduit - 25 mm", unit: "meter" },
  { id: "mep-distribution-board", category: "MEP", name: "Distribution Board", unit: "piece" },
  { id: "mep-circuit-breaker", category: "MEP", name: "Circuit Breaker", unit: "piece" },
  { id: "mep-switch-socket", category: "MEP", name: "Switch Socket", unit: "piece" },
  { id: "mep-earthing-rod", category: "MEP", name: "Earthing Rod", unit: "piece" },
  { id: "mep-gate-valve", category: "MEP", name: "Gate Valve", unit: "piece" },
  { id: "mep-water-tank", category: "MEP", name: "Water Tank", unit: "piece" },
  { id: "mep-submersible-pump", category: "MEP", name: "Submersible Pump", unit: "piece" },
  { id: "mep-geyser", category: "MEP", name: "Geyser", unit: "piece" },
  { id: "mep-exhaust-fan", category: "MEP", name: "Exhaust Fan", unit: "piece" },

  { id: "finish-ceramic-tile", category: "Finishing & Interior", name: "Ceramic Tile", unit: "sqft" },
  { id: "finish-porcelain-tile", category: "Finishing & Interior", name: "Porcelain Tile", unit: "sqft" },
  { id: "finish-marble", category: "Finishing & Interior", name: "Marble", unit: "sqft" },
  { id: "finish-granite", category: "Finishing & Interior", name: "Granite", unit: "sqft" },
  { id: "finish-paint-primer", category: "Finishing & Interior", name: "Paint - Primer", unit: "liter" },
  { id: "finish-paint-emulsion", category: "Finishing & Interior", name: "Paint - Emulsion", unit: "liter" },
  { id: "finish-paint-weather-shield", category: "Finishing & Interior", name: "Paint - Weather Shield", unit: "liter" },
  { id: "finish-paint-enamel", category: "Finishing & Interior", name: "Paint - Enamel", unit: "liter" },
  { id: "finish-wood-doors", category: "Finishing & Interior", name: "Wood Doors", unit: "piece" },
  { id: "finish-wardrobes", category: "Finishing & Interior", name: "Wardrobes", unit: "piece" },
  { id: "finish-aluminum-windows", category: "Finishing & Interior", name: "Aluminum Windows", unit: "piece" },
  { id: "finish-upvc-windows", category: "Finishing & Interior", name: "UPVC Windows", unit: "piece" },
  { id: "finish-glass", category: "Finishing & Interior", name: "Glass", unit: "sqft" },
  { id: "finish-pop", category: "Finishing & Interior", name: "POP", unit: "bag" },
  { id: "finish-gypsum-board", category: "Finishing & Interior", name: "Gypsum Board", unit: "sheet" },
  { id: "finish-wall-putty", category: "Finishing & Interior", name: "Wall Putty", unit: "kg" },
  { id: "finish-tile-adhesive", category: "Finishing & Interior", name: "Tile Adhesive", unit: "bag" },
  { id: "finish-grout", category: "Finishing & Interior", name: "Grout", unit: "kg" },
  { id: "finish-skirting", category: "Finishing & Interior", name: "Skirting", unit: "rft" },
];

export function getMaterialsByCategory(materials: MaterialCatalogItem[] = MATERIALS_CATALOG): Record<string, MaterialCatalogItem[]> {
  return materials.reduce<Record<string, MaterialCatalogItem[]>>((groups, material) => {
    const bucket = groups[material.category] ?? [];
    bucket.push(material);
    groups[material.category] = bucket;
    return groups;
  }, {});
}

export function buildSeedInsertSQL(materials: MaterialCatalogItem[] = MATERIALS_CATALOG): string {
  const values = materials
    .map((material) =>
      `('${material.id}', '${material.category.replaceAll("'", "''")}', '${material.name.replaceAll("'", "''")}', '${material.unit.replaceAll("'", "''")}', true)`
    )
    .join(",\n");

  return `insert into public.materials_catalog (id, category, name, unit, is_active)\nvalues\n${values}\non conflict (category, name, unit) do update\nset id = excluded.id, is_active = excluded.is_active;`;
}
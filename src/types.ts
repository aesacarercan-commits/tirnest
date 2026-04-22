export interface PalletDef {
  id: string;
  name: string;
  w: number;
  h: number;
  weight: number;
  count: number;
  sort_order: number;
}

export interface PlacedPallet extends PalletDef {
  x: number;
  y: number;
  dw: number;
  dh: number;
  color: string;
}

export interface WeightDist {
  totalWeight: number;
  frontW: number;
  middleW: number;
  rearW: number;
  overallCG: number;
  kingpinLoad: number;
  axleLoad: number;
  frontCount: number;
  middleCount: number;
  rearCount: number;
}

export interface TirResult {
  id: number;
  placed: PlacedPallet[];
  util: number;
  weightDist: WeightDist;
}

export const PALETTE_COLORS = [
  '#378ADD', '#1D9E75', '#D85A30', '#7F77DD',
  '#BA7517', '#993556', '#639922', '#0F6E56',
  '#D4537E', '#185FA5',
];

export const PRESETS: Omit<PalletDef, 'id' | 'sort_order'>[] = [
  { name: 'Euro 80×120', w: 80, h: 120, weight: 450, count: 1 },
  { name: 'İndustriyel 100×120', w: 100, h: 120, weight: 800, count: 1 },
  { name: 'Yarım 60×80', w: 60, h: 80, weight: 250, count: 1 },
  { name: 'ABD 40×48 in', w: 101, h: 122, weight: 750, count: 1 },
  { name: 'Havacılık 88×108', w: 88, h: 108, weight: 600, count: 1 },
  { name: 'Kimya 100×100', w: 100, h: 100, weight: 700, count: 1 },
];

import { PalletDef, PlacedPallet, PALETTE_COLORS } from '../types';

export function nestOneTir(
  pallets: PalletDef[],
  colorMap: Record<string, string>,
  tLen: number,
  tWid: number,
  gap: number
): { placed: PlacedPallet[]; remaining: PalletDef[] } {
  const placed: PlacedPallet[] = [];
  
  // Her palet tanımının kaç adet kullanıldığını takip et
  const usedCounts = new Array(pallets.length).fill(0);
  
  let curX = 0;
  
  while (true) {
    if (curX >= tLen) break;
    let bestConfig: {
      p: PalletDef;
      pw: number;
      ph: number;
      slotW: number;
      slotH: number;
      countY: number;
      countX: number;
      pi: number;
    } | null = null;
    let bestScore = -1;

    for (let pi = 0; pi < pallets.length; pi++) {
      const p = pallets[pi];
      const availableCount = p.count - usedCounts[pi];
      
      // Bu paletten kullanılabilir adet yoksa atla
      if (availableCount <= 0) continue;
      
      for (let rot = 0; rot < 2; rot++) {
        const pw = rot === 0 ? p.w : p.h;
        const ph = rot === 0 ? p.h : p.w;
        const slotW = pw + gap;
        const slotH = ph + gap;
        const countY = Math.floor((tWid + gap) / slotH);
        if (countY < 1) continue;
        const countX = Math.floor((tLen - curX + gap) / slotW);
        if (countX < 1) continue;
        
        // Kullanılabilir adet kadar yerleştirebiliriz
        const maxPlaceable = Math.min(countY * countX, availableCount);
        if (maxPlaceable < 1) continue;
        
        const score = countY * slotH;
        if (score > bestScore) {
          bestScore = score;
          bestConfig = { p, pw, ph, slotW, slotH, countY, countX, pi };
        }
      }
    }

    if (!bestConfig) break;
    const { p, pw, ph, slotW, slotH, countY, countX, pi } = bestConfig;
    let colsUsed = 0;

    outer: for (let ix = 0; ix < countX; ix++) {
      let curY = 0;
      let placedInThisCol = 0;
      for (let iy = 0; iy < countY; iy++) {
        // Kullanılabilir palet var mı kontrol et
        if (usedCounts[pi] >= p.count) break outer;
        
        usedCounts[pi]++;
        placed.push({
          ...p,
          x: curX + ix * slotW,
          y: curY,
          dw: pw,
          dh: ph,
          color: colorMap[p.id] || PALETTE_COLORS[0],
        });
        curY += slotH;
        placedInThisCol++;
      }
      if (placedInThisCol > 0) colsUsed = ix + 1;
    }

    if (colsUsed === 0) break;
    curX += colsUsed * slotW;
  }

  // Kalan paletleri hesapla
  const remaining: PalletDef[] = [];
  for (let pi = 0; pi < pallets.length; pi++) {
    const remainingCount = pallets[pi].count - usedCounts[pi];
    if (remainingCount > 0) {
      remaining.push({ ...pallets[pi], count: remainingCount });
    }
  }

  return { placed, remaining };
}

export function computeUtil(placed: PlacedPallet[], tLen: number, tWid: number): number {
  const usedArea = placed.reduce((s, p) => s + p.dw * p.dh, 0);
  return Math.round((usedArea / (tLen * tWid)) * 100);
}

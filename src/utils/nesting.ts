import { PalletDef, PlacedPallet, PALETTE_COLORS } from '../types';

export function nestOneTir(
  pallets: PalletDef[],
  colorMap: Record<string, string>,
  tLen: number,
  tWid: number,
  gap: number
): { placed: PlacedPallet[]; remaining: PalletDef[] } {
  const placed: PlacedPallet[] = [];
  const remaining: PalletDef[] = [];
  const usedSlots = new Array(pallets.length).fill(false);
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
    } | null = null;
    let bestScore = -1;

    for (let pi = 0; pi < pallets.length; pi++) {
      if (usedSlots[pi]) continue;
      const p = pallets[pi];
      for (let rot = 0; rot < 2; rot++) {
        const pw = rot === 0 ? p.w : p.h;
        const ph = rot === 0 ? p.h : p.w;
        const slotW = pw + gap;
        const slotH = ph + gap;
        const countY = Math.floor((tWid + gap) / slotH);
        if (countY < 1) continue;
        const countX = Math.floor((tLen - curX + gap) / slotW);
        if (countX < 1) continue;
        const score = countY * slotH;
        if (score > bestScore) {
          bestScore = score;
          bestConfig = { p, pw, ph, slotW, slotH, countY, countX };
        }
      }
    }

    if (!bestConfig) break;
    const { p, pw, ph, slotW, slotH, countY, countX } = bestConfig;
    let colsUsed = 0;

    outer: for (let ix = 0; ix < countX; ix++) {
      let curY = 0;
      let placedInThisCol = 0;
      for (let iy = 0; iy < countY; iy++) {
        let found = -1;
        for (let pi = 0; pi < pallets.length; pi++) {
          if (usedSlots[pi]) continue;
          const pp = pallets[pi];
          if (pp.name === p.name && pp.w === p.w && pp.h === p.h) {
            found = pi;
            break;
          }
        }
        if (found === -1) break outer;
        usedSlots[found] = true;
        placed.push({
          ...pallets[found],
          x: curX + ix * slotW,
          y: curY,
          dw: pw,
          dh: ph,
          color: colorMap[pallets[found].id] || PALETTE_COLORS[0],
        });
        curY += slotH;
        placedInThisCol++;
      }
      if (placedInThisCol > 0) colsUsed = ix + 1;
    }

    if (colsUsed === 0) break;
    curX += colsUsed * slotW;
  }

  for (let pi = 0; pi < pallets.length; pi++) {
    if (!usedSlots[pi]) remaining.push(pallets[pi]);
  }

  return { placed, remaining };
}

export function computeUtil(placed: PlacedPallet[], tLen: number, tWid: number): number {
  const usedArea = placed.reduce((s, p) => s + p.dw * p.dh, 0);
  return Math.round((usedArea / (tLen * tWid)) * 100);
}

import { useState, useCallback } from 'react';
import { PalletDef, TirResult, Config } from '../types';
import { nestOneTir, computeUtil } from '../utils/nesting';
import { calculateWeightDistribution } from '../utils/weights';

interface UseTruckLoadReturn {
  tirs: TirResult[];
  activeTir: number;
  setActiveTir: (index: number) => void;
  runNest: (pallets: PalletDef[], colorMap: Record<string, string>, config: Config) => void;
  totalPlaced: number;
  avgUtil: number;
  totalWeight: number;
  avgWeight: number;
  currentTir: TirResult | undefined;
}

export function useTruckLoad(): UseTruckLoadReturn {
  const [tirs, setTirs] = useState<TirResult[]>([]);
  const [activeTir, setActiveTir] = useState(0);

  const runNest = useCallback((
    pallets: PalletDef[],
    colorMap: Record<string, string>,
    config: Config
  ) => {
    const allPallets: PalletDef[] = [];
    pallets.forEach((def) => {
      for (let j = 0; j < (def.count || 0); j++) {
        allPallets.push({ ...def });
      }
    });

    const results: TirResult[] = [];
    let remaining = [...allPallets];
    let idx = 0;

    while (remaining.length > 0 && idx < 50) {
      idx++;
      const { placed, remaining: rem } = nestOneTir(
        remaining,
        colorMap,
        config.tLen,
        config.tWid,
        config.gap
      );
      
      if (placed.length === 0) break;
      
      const util = computeUtil(placed, config.tLen, config.tWid);
      const weightDist = calculateWeightDistribution(
        placed,
        config.tLen,
        config.kingpinDist,
        config.axleDist
      );
      
      results.push({ id: idx, placed, util, weightDist });
      remaining = rem;
    }

    setTirs(results);
    setActiveTir(0);
  }, []);

  const totalPlaced = tirs.reduce((sum, t) => sum + t.placed.length, 0);
  const avgUtil = tirs.length 
    ? Math.round(tirs.reduce((sum, t) => sum + t.util, 0) / tirs.length) 
    : 0;
  const totalWeight = tirs.reduce((sum, t) => sum + t.weightDist.totalWeight, 0);
  const avgWeight = totalPlaced > 0 ? Math.round(totalWeight / totalPlaced) : 0;
  const currentTir = tirs[activeTir];

  return {
    tirs,
    activeTir,
    setActiveTir,
    runNest,
    totalPlaced,
    avgUtil,
    totalWeight,
    avgWeight,
    currentTir,
  };
}

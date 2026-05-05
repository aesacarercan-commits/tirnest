import { PlacedPallet, WeightDist } from '../types';
import { ZONE_LIMITS } from '../constants';

export interface WeightConfig {
  tLen: number;
  kingpinDist: number;
  axleDist: number;
}

export function calculateWeightDistribution(
  placed: PlacedPallet[],
  tLen: number,
  kingpinDist: number,
  axleDist: number
): WeightDist {
  const totalWeight = placed.reduce((s, p) => s + (p.weight || 500), 0);

  const frontLimit = tLen * ZONE_LIMITS.frontRatio;
  const rearStart = tLen * ZONE_LIMITS.rearRatio;

  let frontW = 0, middleW = 0, rearW = 0;
  let frontCount = 0, middleCount = 0, rearCount = 0;
  let totalMoment = 0;

  placed.forEach((p) => {
    const cx = p.x + p.dw / 2;
    const w = p.weight || 500;
    totalMoment += w * cx;
    if (cx < frontLimit) { frontW += w; frontCount++; }
    else if (cx < rearStart) { middleW += w; middleCount++; }
    else { rearW += w; rearCount++; }
  });

  const overallCG = totalWeight > 0 ? totalMoment / totalWeight : tLen / 2;

  const kingpinPos = kingpinDist;
  const axleCenterPos = kingpinDist + axleDist;
  const denominator = axleCenterPos - kingpinPos;

  let kingpinLoad = 0;
  let axleLoad = 0;

  if (denominator > 0 && totalWeight > 0) {
    kingpinLoad = totalWeight * (axleCenterPos - overallCG) / denominator;
    kingpinLoad = Math.max(0, Math.min(totalWeight, kingpinLoad));
    axleLoad = totalWeight - kingpinLoad;
  } else {
    kingpinLoad = totalWeight * 0.15;
    axleLoad = totalWeight * 0.85;
  }

  return {
    totalWeight,
    frontW, middleW, rearW,
    overallCG,
    kingpinLoad, axleLoad,
    frontCount, middleCount, rearCount,
  };
}

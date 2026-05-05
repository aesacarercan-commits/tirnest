import { useState, useEffect, useCallback, useMemo } from 'react';
import { LayoutGrid, Scale, Ruler, TrendingUp } from 'lucide-react';
import { Header } from './components/Header';
import { TruckVisual } from './components/TruckVisual';
import { PalletList } from './components/PalletList';
import { TrailerCanvas } from './components/TrailerCanvas';
import { WeightSection } from './components/WeightSection';
import { supabase, getSessionId } from './lib/supabase';
import { usePallets } from './hooks/usePallets';
import { nestOneTir, computeUtil } from './utils/nesting';
import { calculateWeightDistribution } from './utils/weights';
import { DEFAULT_CONFIG, PALETTE_COLORS } from './constants';
import type { PalletDef, TirResult, PlacedPallet } from './types';

// ============================================================================
// UI Components
// ============================================================================

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-stone-200 rounded-xl p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon, label, iconBg, iconColor }: {
  icon: React.ReactNode; label: string; iconBg: string; iconColor: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-xs"
        style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <h3 className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">{label}</h3>
    </div>
  );
}

interface NumInputProps {
  label: string;
  id: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  tooltip?: string;
}

function NumInput({ label, id, value, onChange, step, min, tooltip }: NumInputProps) {
  return (
    <div title={tooltip}>
      <label htmlFor={id} className="text-[11px] font-medium text-stone-500 block mb-1">{label}</label>
      <input 
        id={id} 
        type="number" 
        value={value} 
        min={min} 
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full px-2.5 py-1.5 border border-stone-200 rounded-md bg-stone-50 text-stone-800 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-colors" 
      />
    </div>
  );
}

// ============================================================================
// Main App Component
// ============================================================================

type Config = typeof DEFAULT_CONFIG;

export default function App() {
  const {
    pallets,
    loading,
    handleCountChange,
    handleWeightChange,
    handleRemove,
    handleAdd,
  } = usePallets();

  const [tirs, setTirs] = useState<TirResult[]>([]);
  const [activeTir, setActiveTir] = useState(0);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

  // Color map for pallets
  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    pallets.forEach((p, i) => { 
      map[p.id] = PALETTE_COLORS[i % PALETTE_COLORS.length]; 
    });
    return map;
  }, [pallets]);

  // Run nesting algorithm
  const runNest = useCallback(() => {
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
      const { placed, remaining: rem } = nestOneTir(remaining, colorMap, config.tLen, config.tWid, config.gap);
      if (placed.length === 0) break;
      const util = computeUtil(placed, config.tLen, config.tWid);
      const weightDist = calculateWeightDistribution(placed, config.tLen, config.kingpinDist, config.axleDist);
      results.push({ id: idx, placed, util, weightDist });
      remaining = rem;
    }

    setTirs(results);
    setActiveTir(0);
  }, [pallets, colorMap, config]);

  // Handle pallet move on canvas
  const handlePalletMove = useCallback((tirIndex: number, palletIndex: number, newX: number, newY: number) => {
    setTirs((prevTirs) => {
      const newTirs = [...prevTirs];
      const tir = newTirs[tirIndex];
      if (!tir) return prevTirs;

      const newPlaced = [...tir.placed];
      const pallet = newPlaced[palletIndex];
      if (!pallet) return prevTirs;

      newPlaced[palletIndex] = { ...pallet, x: newX, y: newY };
      
      const newWeightDist = calculateWeightDistribution(newPlaced, config.tLen, config.kingpinDist, config.axleDist);
      newTirs[tirIndex] = { ...tir, placed: newPlaced, weightDist: newWeightDist };

      return newTirs;
    });
  }, [config.tLen, config.kingpinDist, config.axleDist]);

  // Config setter
  const cfgSet = useCallback((key: keyof Config, val: number) => {
    setConfig((c) => ({ ...c, [key]: val }));
  }, []);

  // Statistics
  const totalPallets = useMemo(() => pallets.reduce((s, p) => s + (p.count || 0), 0), [pallets]);
  const totalPlaced = useMemo(() => tirs.reduce((s, t) => s + t.placed.length, 0), [tirs]);
  const avgUtil = useMemo(() => tirs.length ? Math.round(tirs.reduce((s, t) => s + t.util, 0) / tirs.length) : 0, [tirs]);
  const totalWeight = useMemo(() => tirs.reduce((s, t) => s + t.weightDist.totalWeight, 0), [tirs]);
  const avgWeight = useMemo(() => totalPlaced > 0 ? Math.round(totalWeight / totalPlaced) : 0, [totalPlaced, totalWeight]);
  
  const currentTir = tirs[activeTir];

  return (
    <div className="min-h-screen bg-stone-100">
      <Header />
      <div className="p-3.5 max-w-[1400px] mx-auto">
        <div className="flex gap-3.5 flex-wrap">

          {/* Left Column */}
          <div className="w-[260px] flex-shrink-0 flex flex-col gap-2.5">

            <Card>
              <CardHeader icon="🚚" label="Araç Şeması" iconBg="rgba(24,95,165,0.1)" iconColor="#185FA5" />
              {loading ? (
                <div className="h-40 flex items-center justify-center text-stone-400 text-xs">Yükleniyor...</div>
              ) : (
                <TruckVisual dist={currentTir?.weightDist ?? null} tLen={config.tLen} />
              )}
            </Card>

            <Card>
              <CardHeader icon={<Ruler size={13} />} label="Dorsé Boyutları" iconBg="rgba(24,95,165,0.1)" iconColor="#185FA5" />
              <div className="grid grid-cols-2 gap-2 mb-2">
                <NumInput label="Uzunluk (cm)" id="tLen" value={config.tLen} onChange={(v) => cfgSet('tLen', v)} step={10} />
                <NumInput label="Genişlik (cm)" id="tWid" value={config.tWid} onChange={(v) => cfgSet('tWid', v)} step={5} />
              </div>
              <NumInput label="Palet arası boşluk (cm)" id="gap" value={config.gap} onChange={(v) => cfgSet('gap', v)} min={0} />
            </Card>

            <Card>
              <CardHeader icon={<Scale size={13} />} label="Dingil Ayarları" iconBg="rgba(216,90,48,0.1)" iconColor="#D85A30" />
              <div className="grid grid-cols-2 gap-2 mb-2">
                <NumInput 
                  label="Kingpin (cm)" 
                  id="kingpin" 
                  value={config.kingpinDist}
                  onChange={(v) => cfgSet('kingpinDist', v)} 
                  step={10}
                  tooltip="Dorsé önünden kingpin'e mesafe" 
                />
                <NumInput 
                  label="Dingil grubu (cm)" 
                  id="axle" 
                  value={config.axleDist}
                  onChange={(v) => cfgSet('axleDist', v)} 
                  step={10}
                  tooltip="Kingpinden dingil grubu merkezine" 
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <NumInput label="Ön dingil (kg)" id="lFront" value={config.limitFront} onChange={(v) => cfgSet('limitFront', v)} step={100} />
                <NumInput label="Dorsé dingil (kg)" id="lTrailer" value={config.limitTrailer} onChange={(v) => cfgSet('limitTrailer', v)} step={1000} />
                <NumInput label="Toplam (kg)" id="lTotal" value={config.limitTotal} onChange={(v) => cfgSet('limitTotal', v)} step={1000} />
              </div>
            </Card>

            <Card>
              <CardHeader icon={<LayoutGrid size={13} />} label="Paletler" iconBg="rgba(29,158,117,0.1)" iconColor="#1D9E75" />
              {loading ? (
                <div className="text-xs text-stone-400 text-center py-4">Yükleniyor...</div>
              ) : (
                <PalletList
                  pallets={pallets}
                  onCountChange={handleCountChange}
                  onWeightChange={handleWeightChange}
                  onRemove={handleRemove}
                  onAdd={handleAdd}
                  onRun={runNest}
                />
              )}
            </Card>
          </div>

          {/* Right Column */}
          <div className="flex-1 min-w-[320px]">
            <Card>
              {/* Stats grid */}
              <div className="grid grid-cols-4 gap-2.5 mb-4">
                {[
                  { label: 'Tır Sayısı', value: tirs.length > 0 ? String(tirs.length) : '—', color: '#185FA5' },
                  { label: 'Toplam Palet', value: totalPallets > 0 ? String(totalPallets) : '—', color: '#1a1a1a' },
                  { label: 'Yerleştirilen', value: totalPlaced > 0 ? String(totalPlaced) : '—', color: '#1D9E75' },
                  { label: 'Ort. Doluluk', value: tirs.length > 0 ? `${avgUtil}%` : '—', color: '#BA7517' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-stone-50 rounded-lg p-2.5 border border-stone-200 hover:border-stone-300 hover:-translate-y-px transition-all">
                    <div className="text-[11px] text-stone-500 font-medium">{label}</div>
                    <div className="text-lg font-bold mt-0.5" style={{ color }}>{value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="rounded-lg p-2.5 border border-blue-100"
                  style={{ background: 'linear-gradient(135deg,rgba(24,95,165,0.08),rgba(24,95,165,0.02))' }}>
                  <div className="text-[11px] text-stone-500 font-medium">Toplam Yük</div>
                  <div className="text-lg font-bold mt-0.5" style={{ color: '#185FA5' }}>
                    {totalWeight > 0 ? totalWeight.toLocaleString() + ' kg' : '—'}
                  </div>
                </div>
                <div className="rounded-lg p-2.5 border border-emerald-100"
                  style={{ background: 'linear-gradient(135deg,rgba(29,158,117,0.08),rgba(29,158,117,0.02))' }}>
                  <div className="text-[11px] text-stone-500 font-medium">Ort. Palet Ağırlığı</div>
                  <div className="text-lg font-bold mt-0.5" style={{ color: '#1D9E75' }}>
                    {avgWeight > 0 ? avgWeight + ' kg' : '—'}
                  </div>
                </div>
              </div>

              {/* Tir tabs */}
              {tirs.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {tirs.map((t, i) => {
                    const uc = t.util >= 85 ? '#1D9E75' : t.util >= 50 ? '#BA7517' : '#378ADD';
                    const isActive = i === activeTir;
                    return (
                      <button 
                        key={t.id} 
                        onClick={() => setActiveTir(i)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all text-left ${isActive ? 'text-white' : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-white hover:border-stone-300'}`}
                        style={isActive ? { background: '#185FA5', borderColor: '#185FA5', boxShadow: '0 2px 8px rgba(24,95,165,0.3)' } : {}}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Tır {t.id}</span>
                          <span className="opacity-75">%{t.util}</span>
                        </div>
                        <div className="h-1 rounded-full mt-1 overflow-hidden w-14"
                          style={{ background: isActive ? 'rgba(255,255,255,0.2)' : '#e5e7eb' }}>
                          <div className="h-full rounded-full" style={{ width: `${t.util}%`, background: isActive ? 'rgba(255,255,255,0.85)' : uc }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Canvas */}
              {currentTir ? (
                <TrailerCanvas
                  tir={currentTir}
                  tirIndex={activeTir}
                  tirTotal={tirs.length}
                  tLen={config.tLen}
                  tWid={config.tWid}
                  onPalletMove={handlePalletMove}
                  setTirs={setTirs}
                />
              ) : (
                <div className="h-40 flex flex-col items-center justify-center gap-3 bg-stone-50 rounded-xl border-2 border-dashed border-stone-200">
                  <TrendingUp size={32} className="text-stone-300" />
                  <div className="text-sm text-stone-400 font-medium">Yerleştirme yapmak için palet ekleyin ve "Yerleştir" butonuna tıklayın</div>
                </div>
              )}

              {/* Weight Section */}
              {currentTir && (
                <WeightSection
                  dist={currentTir.weightDist}
                  limitFront={config.limitFront}
                  limitTrailer={config.limitTrailer}
                  limitTotal={config.limitTotal}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

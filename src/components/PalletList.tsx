import { useState } from 'react';
import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { PalletDef, PALETTE_COLORS, PRESETS } from '../types';

interface Props {
  pallets: PalletDef[];
  onCountChange: (id: string, count: number) => void;
  onWeightChange: (id: string, weight: number) => void;
  onRemove: (id: string) => void;
  onAdd: (p: Omit<PalletDef, 'id' | 'sort_order'>) => void;
  onRun: () => void;
}

export function PalletList({ pallets, onCountChange, onWeightChange, onRemove, onAdd, onRun }: Props) {
  const [name, setName] = useState('');
  const [w, setW] = useState('90');
  const [h, setH] = useState('110');
  const [weight, setWeight] = useState('500');
  const [presetsOpen, setPresetsOpen] = useState(false);

  function handleAdd() {
    const pw = parseFloat(w);
    const ph = parseFloat(h);
    if (!pw || !ph) return;
    onAdd({ name: name.trim() || `${pw}×${ph}`, w: pw, h: ph, weight: parseFloat(weight) || 500, count: 1 });
    setName('');
  }

  function handlePreset(p: typeof PRESETS[0]) {
    onAdd({ ...p });
  }

  return (
    <div>
      <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-0.5">
        {pallets.length === 0 ? (
          <div className="text-xs text-stone-400 text-center py-3">Henüz palet yok</div>
        ) : (
          pallets.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2 px-2.5 py-2 rounded-md border border-stone-200 bg-stone-50 hover:border-stone-300 transition-colors">
              <div className="w-2.5 h-2.5 rounded-[3px] flex-shrink-0 shadow-inner"
                style={{ background: PALETTE_COLORS[i % PALETTE_COLORS.length] }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-stone-800 truncate">{p.name}</div>
                <div className="text-[11px] text-stone-500">{p.w}×{p.h} cm</div>
                <div className="text-[11px] font-semibold" style={{ color: '#BA7517' }}>{p.weight} kg/adet</div>
              </div>
              <input
                className="w-11 text-center text-xs border border-stone-200 rounded-md py-1 px-1 bg-white font-medium text-stone-700 focus:outline-none focus:border-blue-500"
                type="number" min="0" max="999" value={p.count}
                onChange={(e) => onCountChange(p.id, parseInt(e.target.value) || 0)}
                title="Adet"
              />
              <input
                className="w-12 text-center text-[11px] border border-stone-200 rounded-md py-1 px-1 bg-white font-medium text-stone-700 focus:outline-none focus:border-blue-500"
                type="number" min="1" value={p.weight}
                onChange={(e) => onWeightChange(p.id, parseInt(e.target.value) || 500)}
                title="Ağırlık (kg)"
              />
              <button
                onClick={() => onRemove(p.id)}
                className="text-red-600 border border-red-200 rounded-md px-1.5 py-0.5 text-[11px] hover:bg-red-50 transition-colors font-medium"
              >
                <X size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-stone-200 mt-3 pt-3">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-amber-50">
            <Plus size={12} className="text-amber-600" />
          </div>
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">Yeni Palet Ekle</span>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
          <div className="mb-2">
            <label className="text-[11px] font-medium text-stone-500 block mb-1">İsim</label>
            <input
              className="w-full px-2.5 py-1.5 border border-stone-200 rounded-md bg-white text-stone-800 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-colors"
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="ör. Özel 90×110" maxLength={24}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="text-[11px] font-medium text-stone-500 block mb-1">En (cm)</label>
              <input className="w-full px-2.5 py-1.5 border border-stone-200 rounded-md bg-white text-stone-800 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                type="number" value={w} onChange={(e) => setW(e.target.value)} min="1" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-stone-500 block mb-1">Boy (cm)</label>
              <input className="w-full px-2.5 py-1.5 border border-stone-200 rounded-md bg-white text-stone-800 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                type="number" value={h} onChange={(e) => setH(e.target.value)} min="1" />
            </div>
          </div>
          <div className="mb-2.5">
            <label className="text-[11px] font-medium text-stone-500 block mb-1">Ağırlık (kg)</label>
            <input className="w-full px-2.5 py-1.5 border border-stone-200 rounded-md bg-white text-stone-800 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              type="number" value={weight} onChange={(e) => setWeight(e.target.value)} min="1" step="10" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd}
              className="flex-1 py-1.5 px-3 border border-stone-200 rounded-md text-xs font-medium bg-white text-stone-700 hover:bg-stone-100 transition-all hover:-translate-y-px flex items-center justify-center gap-1">
              <Plus size={12} /> Ekle
            </button>
            <button onClick={() => setPresetsOpen(!presetsOpen)}
              className="py-1.5 px-2.5 border border-stone-200 rounded-md text-[11px] font-medium bg-white text-stone-500 hover:bg-stone-100 transition-all flex items-center gap-1">
              Ön tanımlılar {presetsOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          </div>

          {presetsOpen && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {PRESETS.map((p) => (
                <button key={p.name} onClick={() => handlePreset(p)}
                  className="text-[11px] py-1 px-2.5 bg-white border border-stone-200 rounded text-stone-500 font-medium hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all hover:-translate-y-px">
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button onClick={onRun}
        className="w-full mt-3 py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
        style={{ background: '#185FA5', boxShadow: '0 2px 8px rgba(24,95,165,0.3)' }}>
        Yerleştir &rarr;
      </button>
    </div>
  );
}

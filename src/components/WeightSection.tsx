import { WeightDist } from '../types';

interface Props {
  dist: WeightDist;
  limitFront: number;
  limitTrailer: number;
  limitTotal: number;
}

function statusClass(val: number, limit: number) {
  if (val > limit) return { bg: '#FCEBEB', text: '#D4537E', label: 'AŞIM' };
  if (val > limit * 0.9) return { bg: '#FDF3E6', text: '#BA7517', label: 'YAKIN' };
  return { bg: '#E6F4F1', text: '#1D9E75', label: 'UYGUN' };
}

interface WeightBarProps {
  label: string;
  color: string;
  gradFrom: string;
  gradTo: string;
  weight: number;
  count: number;
  total: number;
  max: number;
}

function WeightBar({ label, color, gradFrom, gradTo, weight, count, total, max }: WeightBarProps) {
  const barPct = Math.min(100, max > 0 ? (weight / max) * 100 : 0);
  const pct = total > 0 ? Math.round((weight / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2.5 mb-2">
      <div className="w-20 text-[11px] font-semibold text-stone-500 flex items-center gap-1">
        <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
        {label}
      </div>
      <div className="flex-1 h-6 bg-stone-100 rounded-md overflow-hidden relative border border-stone-200">
        <div className="h-full rounded-md transition-all duration-500 flex items-center"
          style={{ width: `${barPct}%`, background: `linear-gradient(90deg,${gradFrom},${gradTo})` }}>
          {count > 0 && barPct > 20 && (
            <span className="absolute right-2 text-[10px] font-bold text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
              {count} adet
            </span>
          )}
        </div>
      </div>
      <div className="w-20 text-right">
        <div className="text-xs font-bold text-stone-800">{Math.round(weight).toLocaleString()} kg</div>
        <div className="text-[10px] text-stone-400 font-medium">{pct}%</div>
      </div>
    </div>
  );
}

export function WeightSection({ dist, limitFront, limitTrailer, limitTotal }: Props) {
  const total = dist.frontW + dist.middleW + dist.rearW;
  const maxW = Math.max(dist.frontW, dist.middleW, dist.rearW, 1);

  const frontPct = total > 0 ? (dist.frontW / total) * 100 : 33;
  const midPct = total > 0 ? (dist.middleW / total) * 100 : 33;
  const rearPct = total > 0 ? (dist.rearW / total) * 100 : 34;

  const kpSt = statusClass(dist.kingpinLoad, limitFront);
  const axSt = statusClass(dist.axleLoad, limitTrailer);
  const totSt = statusClass(dist.totalWeight, limitTotal);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[11px]" style={{ background: 'rgba(55,138,221,0.1)', color: '#378ADD' }}>
          ◈
        </div>
        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">Dorse Bölgesel Ağırlık Dağılımı</span>
      </div>

      <div className="relative h-10 rounded-lg overflow-hidden flex mb-4 border border-stone-200">
        <div className="h-full flex items-center justify-center text-[11px] font-bold text-white transition-all duration-500 relative"
          style={{ width: `${frontPct}%`, background: 'linear-gradient(90deg,#378ADD,#4a9ae8)', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
          <span>{Math.round(frontPct)}%</span>
          <div className="absolute right-0 top-[10%] h-[80%] w-px bg-white/30" />
        </div>
        <div className="h-full flex items-center justify-center text-[11px] font-bold text-white transition-all duration-500 relative"
          style={{ width: `${midPct}%`, background: 'linear-gradient(90deg,#1D9E75,#2ab88a)', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
          <span>{Math.round(midPct)}%</span>
          <div className="absolute right-0 top-[10%] h-[80%] w-px bg-white/30" />
        </div>
        <div className="h-full flex items-center justify-center text-[11px] font-bold text-white transition-all duration-500"
          style={{ width: `${rearPct}%`, background: 'linear-gradient(90deg,#D85A30,#e87048)', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
          <span>{Math.round(rearPct)}%</span>
        </div>
      </div>

      <WeightBar label="Ön Bölge" color="#378ADD" gradFrom="#378ADD" gradTo="#4a9ae8"
        weight={dist.frontW} count={dist.frontCount} total={total} max={maxW} />
      <WeightBar label="Orta Bölge" color="#1D9E75" gradFrom="#1D9E75" gradTo="#2ab88a"
        weight={dist.middleW} count={dist.middleCount} total={total} max={maxW} />
      <WeightBar label="Arka Bölge" color="#D85A30" gradFrom="#D85A30" gradTo="#e87048"
        weight={dist.rearW} count={dist.rearCount} total={total} max={maxW} />

      <div className="flex items-center gap-2 mt-4 mb-3">
        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[11px]" style={{ background: 'rgba(216,90,48,0.1)', color: '#D85A30' }}>
          ⚙
        </div>
        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">Dingil Yük Analizi</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {[
          { name: 'Kingpin (Çekici)', icon: '🚛', val: dist.kingpinLoad, limit: limitFront, st: kpSt, valColor: dist.kingpinLoad > limitFront ? '#D4537E' : '#185FA5' },
          { name: 'Dorsé Dingili', icon: '🛞', val: dist.axleLoad, limit: limitTrailer, st: axSt, valColor: dist.axleLoad > limitTrailer ? '#D4537E' : '#BA7517' },
          { name: 'Toplam Ağırlık', icon: '⚖️', val: dist.totalWeight, limit: limitTotal, st: totSt, valColor: dist.totalWeight > limitTotal ? '#D4537E' : '#1D9E75' },
        ].map(({ name, icon, val, limit, st, valColor }) => (
          <div key={name} className="bg-stone-50 rounded-lg p-3 text-center border border-stone-200 hover:border-stone-300 hover:-translate-y-0.5 transition-all">
            <div className="text-[11px] text-stone-500 mb-1.5 font-semibold">{icon} {name}</div>
            <div className="text-xl font-extrabold transition-colors" style={{ color: valColor }}>
              {Math.round(val).toLocaleString()} <span className="text-xs font-medium text-stone-400">kg</span>
            </div>
            <div className="text-[10px] text-stone-400 mt-1">Limit: {limit.toLocaleString()} kg</div>
            <span className="inline-block text-[10px] mt-1.5 px-2.5 py-0.5 rounded font-bold tracking-wide"
              style={{ background: st.bg, color: st.text }}>
              {st.label === 'AŞIM' ? '⚠ AŞIM' : st.label === 'YAKIN' ? '⚡ YAKIN' : '✓ UYGUN'}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 p-3 bg-stone-50 rounded-lg border border-stone-200 text-[11px] text-stone-500 leading-relaxed">
        <strong className="text-stone-700">Açıklamalar:</strong><br />
        <span className="font-medium">Kingpin yükü:</span> Dorsé önündeki yükün kingpin üzerinden çekiciye aktardığı kuvvet<br />
        <span className="font-medium">Dorsé dingili:</span> Dorsé üzerindeki toplam yük eksi kingpin yükü<br />
        <span className="font-medium">Bölge sınırları:</span> Ön (0-33%), Orta (33-66%), Arka (66-100%)
      </div>
    </div>
  );
}

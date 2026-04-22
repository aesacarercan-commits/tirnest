import { WeightDist } from '../types';

interface Props {
  dist: WeightDist | null;
  tLen: number;
}

export function TruckVisual({ dist, tLen }: Props) {
  const cgRatio = dist ? Math.min(1, Math.max(0, dist.overallCG / tLen)) : 0;
  const loadWidth = dist ? Math.max(10, cgRatio * 260) : 0;
  const dorseStart = 112;
  const dorseWidth = 270;
  const cgX = dorseStart + cgRatio * dorseWidth;
  const scaleBarWidth = cgRatio * 200;

  const fmt = (v: number) => Math.round(v / 1000) + 't';

  return (
    <div>
      <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
        <svg viewBox="0 0 420 210" width="100%" height="210" className="block mx-auto">
          <defs>
            <linearGradient id="cabGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7a9aba" />
              <stop offset="40%" stopColor="#5a7a9a" />
              <stop offset="100%" stopColor="#3a5a7a" />
            </linearGradient>
            <linearGradient id="trailerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8aaf7e" />
              <stop offset="100%" stopColor="#5a7f4e" />
            </linearGradient>
            <linearGradient id="loadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(55,138,221,0.5)" />
              <stop offset="50%" stopColor="rgba(29,158,117,0.5)" />
              <stop offset="100%" stopColor="rgba(216,90,48,0.5)" />
            </linearGradient>
            <linearGradient id="tireGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3a3a3a" />
              <stop offset="50%" stopColor="#2a2a2a" />
              <stop offset="100%" stopColor="#1a1a1a" />
            </linearGradient>
            <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#888" />
              <stop offset="100%" stopColor="#555" />
            </linearGradient>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.2" />
            </filter>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="lightGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <rect x="5" y="175" width="410" height="4" fill="#999" rx="2" />
          <rect x="5" y="180" width="410" height="16" fill="#b0b0a8" rx="2" />
          <line x1="5" y1="188" x2="415" y2="188" stroke="#a0a098" strokeWidth="1" strokeDasharray="10,8" />

          <g filter="url(#shadow)">
            <path d="M 18 140 L 18 72 Q 18 58 32 53 L 72 51 Q 88 50 93 58 L 98 72 L 98 140 Z" fill="url(#cabGrad)" />
            <path d="M 32 53 L 72 51 L 78 42 L 38 44 Z" fill="#4a6a8a" />
            <path d="M 38 44 L 78 42 L 80 38 L 42 40 Z" fill="#3a5a7a" />
            <path d="M 26 70 L 26 60 Q 26 56 30 55 L 68 53 Q 72 53 74 57 L 78 70 Z" fill="#7aa4c9" opacity="0.8" />
            <path d="M 28 68 L 28 60 L 66 58 L 70 68 Z" fill="#9ac4e8" opacity="0.6" />
            <path d="M 30 62 L 35 58 L 40 62 L 35 66 Z" fill="rgba(255,255,255,0.3)" />
            <rect x="80" y="60" width="15" height="24" rx="4" fill="#7aa4c9" opacity="0.7" />
            <rect x="82" y="62" width="11" height="20" rx="3" fill="#9ac4e8" opacity="0.5" />
            <line x1="78" y1="56" x2="78" y2="135" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
            <rect x="70" y="88" width="7" height="4" rx="2" fill="rgba(255,255,255,0.5)" />
            <rect x="60" y="125" width="16" height="4" rx="1" fill="#555" />
            <rect x="60" y="131" width="16" height="4" rx="1" fill="#555" />
            <rect x="60" y="137" width="16" height="4" rx="1" fill="#555" />
            <rect x="20" y="108" width="16" height="24" rx="3" fill="#2d4a66" />
            <line x1="22" y1="112" x2="34" y2="112" stroke="#3d5a76" strokeWidth="1.2" />
            <line x1="22" y1="116" x2="34" y2="116" stroke="#3d5a76" strokeWidth="1.2" />
            <line x1="22" y1="120" x2="34" y2="120" stroke="#3d5a76" strokeWidth="1.2" />
            <line x1="22" y1="124" x2="34" y2="124" stroke="#3d5a76" strokeWidth="1.2" />
            <line x1="22" y1="128" x2="34" y2="128" stroke="#3d5a76" strokeWidth="1.2" />
            <ellipse cx="28" cy="102" rx="6" ry="4" fill="rgba(255,255,255,0.2)" />
            <ellipse cx="22" cy="138" rx="6" ry="8" fill="#ffeb3b" filter="url(#lightGlow)" />
            <ellipse cx="22" cy="138" rx="3" ry="5" fill="#fff" />
            <polygon points="16,138 5,130 5,146" fill="rgba(255,235,59,0.15)" />
            <rect x="18" y="148" width="8" height="5" rx="2" fill="#ff9800" />
            <rect x="16" y="142" width="20" height="7" rx="3" fill="#444" />
            <rect x="18" y="144" width="16" height="3" rx="1" fill="#666" />
            <rect x="95" y="110" width="5" height="25" rx="2" fill="#777" />
            <ellipse cx="97.5" cy="108" rx="3" ry="2" fill="#999" />
          </g>

          <rect x="46" y="152" width="28" height="5" rx="2" fill="#777" />
          {[52, 74].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="162" r="13" fill="url(#tireGrad)" />
              <circle cx={cx} cy="162" r="8" fill="url(#rimGrad)" />
              <circle cx={cx} cy="162" r="4" fill="#aaa" />
              <circle cx={cx} cy="162" r="1.5" fill="#666" />
              <circle cx={cx} cy="159" r="0.8" fill="#777" />
              <circle cx={cx + 3} cy="162" r="0.8" fill="#777" />
              <circle cx={cx} cy="165" r="0.8" fill="#777" />
              <circle cx={cx - 3} cy="162" r="0.8" fill="#777" />
            </g>
          ))}

          <rect x="96" y="128" width="12" height="22" rx="2" fill="#666" />
          <rect x="99" y="122" width="6" height="10" rx="2" fill="#888" />
          <circle cx="102" cy="120" r="6" fill="#185FA5" filter="url(#glow)" />
          <circle cx="102" cy="120" r="3" fill="#4a9ae8" />
          <circle cx="102" cy="120" r="1.5" fill="#fff" />

          <g filter="url(#shadow)">
            <rect x="112" y="48" width="275" height="110" rx="8" fill="url(#trailerGrad)" />
            <rect x="112" y="50" width="275" height="6" rx="2" fill="rgba(255,255,255,0.2)" />
            <rect x="112" y="52" width="275" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
            <rect x="112" y="150" width="275" height="6" rx="2" fill="rgba(0,0,0,0.15)" />
            {[[125, 78], [218, 78], [311, 65]].map(([x, w], i) => (
              <rect key={i} x={x} y="62" width={w} height="82" rx="5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
            ))}
            {[130, 223, 316].map((x, i) => (
              <rect key={i} x={x} y="100" width="12" height="5" rx="2" fill="rgba(255,255,255,0.35)" />
            ))}
            <rect x="380" y="55" width="6" height="96" rx="2" fill="rgba(0,0,0,0.25)" />
            <rect x="382" y="132" width="8" height="5" rx="1" fill="#ff4444" filter="url(#glow)" />
            <rect x="382" y="139" width="8" height="4" rx="1" fill="#ff9800" />
            <rect x="382" y="145" width="8" height="4" rx="1" fill="#fff" />
            <rect x="382" y="50" width="6" height="5" rx="1" fill="#ffeb3b" filter="url(#glow)" />
          </g>

          {dist && loadWidth > 0 && (
            <rect x="118" y="55" width={loadWidth} height="96" rx="5" fill="url(#loadGrad)" opacity="0.7" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          )}

          <rect x="290" y="152" width="56" height="5" rx="2" fill="#777" />
          <rect x="308" y="142" width="20" height="10" rx="3" fill="#666" />
          <rect x="310" y="144" width="16" height="6" rx="2" fill="#888" />
          {[297, 318, 339].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="162" r="12" fill="url(#tireGrad)" />
              <circle cx={cx} cy="162" r="7" fill="url(#rimGrad)" />
              <circle cx={cx} cy="162" r="3.5" fill="#aaa" />
              <circle cx={cx} cy="162" r="1.5" fill="#666" />
              <circle cx={cx} cy="159" r="0.8" fill="#777" />
              <circle cx={cx + 3} cy="162" r="0.8" fill="#777" />
              <circle cx={cx} cy="165" r="0.8" fill="#777" />
              <circle cx={cx - 3} cy="162" r="0.8" fill="#777" />
            </g>
          ))}

          {dist && (
            <g transform={`translate(${cgX - 200}, 0)`}>
              <line x1="200" y1="48" x2="200" y2="18" stroke="#1D9E75" strokeWidth="2.5" />
              <polygon points="200,10 194,20 206,20" fill="#1D9E75" />
              <rect x="150" y="-2" width="100" height="18" rx="6" fill="#1D9E75" filter="url(#shadow)" />
              <text x="200" y="11" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="bold">Ağırlık Merkezi</text>
            </g>
          )}

          <g transform="translate(115, 200)">
            <rect x="0" y="0" width="200" height="6" fill="#e0e0da" rx="3" />
            <rect x="0" y="0" width={scaleBarWidth} height="6" fill="#185FA5" rx="3" />
            <text x="-8" y="-2" fontSize="9" fill="#6b6b5e" fontWeight="600">Ön</text>
            <text x="208" y="-2" fontSize="9" fill="#6b6b5e" fontWeight="600">Arka</text>
            <line x1="0" y1="-3" x2="0" y2="9" stroke="#6b6b5e" strokeWidth="1.2" />
            <line x1="100" y1="-3" x2="100" y2="9" stroke="#6b6b5e" strokeWidth="1.2" />
            <line x1="200" y1="-3" x2="200" y2="9" stroke="#6b6b5e" strokeWidth="1.2" />
            <text x="100" y="-4" fontSize="8" fill="#6b6b5e" textAnchor="middle" fontWeight="500">50%</text>
          </g>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mt-2.5">
        {[
          { label: 'Kingpin', value: dist ? fmt(dist.kingpinLoad) : '—', color: '#185FA5' },
          { label: 'Dingil', value: dist ? fmt(dist.axleLoad) : '—', color: '#D85A30' },
          { label: 'Toplam', value: dist ? fmt(dist.totalWeight) : '—', color: '#1D9E75' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center py-1.5 px-1 bg-white rounded border border-stone-200">
            <div className="text-[10px] font-semibold text-stone-500">{label}</div>
            <div className="text-[13px] font-bold mt-0.5" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

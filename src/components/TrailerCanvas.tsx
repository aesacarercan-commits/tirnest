import { useEffect, useRef } from 'react';
import { TirResult } from '../types';

interface Props {
  tir: TirResult;
  tirIndex: number;
  tirTotal: number;
  tLen: number;
  tWid: number;
}

export function TrailerCanvas({ tir, tirIndex, tirTotal, tLen, tWid }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const maxW = wrap.clientWidth - 2;
    const scale = Math.min(maxW / tLen, 220 / tWid, 0.8);
    canvas.width = Math.round(tLen * scale);
    canvas.height = Math.round(tWid * scale);

    const ctx = canvas.getContext('2d')!;
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    ctx.fillStyle = isDark ? '#2C2C2A' : '#F1EFE8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = isDark ? '#888780' : '#5F5E5A';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

    const frontLine = Math.round(tLen * 0.33 * scale);
    const rearLine = Math.round(tLen * 0.66 * scale);

    ctx.strokeStyle = isDark ? 'rgba(136,135,128,0.25)' : 'rgba(95,94,90,0.15)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(frontLine, 0); ctx.lineTo(frontLine, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rearLine, 0); ctx.lineTo(rearLine, canvas.height); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = isDark ? 'rgba(136,135,128,0.5)' : 'rgba(95,94,90,0.35)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ÖN', frontLine / 2, 14);
    ctx.fillText('ORTA', frontLine + (rearLine - frontLine) / 2, 14);
    ctx.fillText('ARKA', rearLine + (canvas.width - rearLine) / 2, 14);

    ctx.strokeStyle = isDark ? 'rgba(136,135,128,0.18)' : 'rgba(95,94,90,0.1)';
    for (let x = 100; x < tLen; x += 100) {
      const sx = x * scale;
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, canvas.height); ctx.stroke();
    }

    tir.placed.forEach((p) => {
      const px = Math.round(p.x * scale) + 1;
      const py = Math.round(p.y * scale) + 1;
      const pw = Math.round(p.dw * scale) - 1;
      const ph = Math.round(p.dh * scale) - 1;
      if (pw < 1 || ph < 1) return;

      ctx.fillStyle = p.color + 'CC';
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, pw, ph);

      if (pw > 18 && ph > 10) {
        ctx.fillStyle = '#fff';
        const fs = Math.max(8, Math.min(11, Math.min(pw, ph) / 5));
        ctx.font = `600 ${fs}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const short = p.name.length > 8 ? `${p.w}×${p.h}` : p.name;
        ctx.fillText(short, px + pw / 2, py + ph / 2);
      }
    });
  }, [tir, tLen, tWid]);

  const seen: Record<string, string> = {};
  tir.placed.forEach((p) => { if (!seen[p.name]) seen[p.name] = p.color; });

  return (
    <div>
      <div className="relative rounded-lg overflow-hidden" ref={wrapRef}>
        <canvas ref={canvasRef} className="block border border-stone-200 rounded-lg w-full" />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-semibold text-stone-500 border border-stone-200">
          Dorsé {tirIndex + 1}/{tirTotal} · {tir.placed.length} palet · %{tir.util} doluluk
        </div>
      </div>
      <div className="flex gap-3 flex-wrap mt-2.5 pt-2.5 border-t border-stone-200">
        {Object.entries(seen).map(([name, color]) => (
          <div key={name} className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium px-2 py-1 bg-stone-50 rounded">
            <div className="w-2.5 h-2.5 rounded-[2px] flex-shrink-0" style={{ background: color }} />
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}

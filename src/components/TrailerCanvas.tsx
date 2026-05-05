import { useEffect, useRef, useState, useCallback } from 'react';
import { TirResult, PlacedPallet } from '../types';

interface Props {
  tir: TirResult;
  tirIndex: number;
  tirTotal: number;
  tLen: number;
  tWid: number;
  onPalletMove?: (tirIndex: number, palletIndex: number, newX: number, newY: number) => void;
  setTirs?: React.Dispatch<React.SetStateAction<TirResult[]>>;
}

export function TrailerCanvas({ tir, tirIndex, tirTotal, tLen, tWid, onPalletMove, setTirs }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{
    palletIndex: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    palletName: string;
  } | null>(null);
  const [hoveredPallet, setHoveredPallet] = useState<number | null>(null);

  const getScale = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return 1;
    const maxW = wrap.clientWidth - 2;
    return Math.min(maxW / tLen, 220 / tWid, 0.8);
  }, [tLen, tWid]);

  const findPalletAtPoint = useCallback((clientX: number, clientY: number): number | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const scale = getScale();

    for (let i = tir.placed.length - 1; i >= 0; i--) {
      const p = tir.placed[i];
      const px = Math.round(p.x * scale) + 1;
      const py = Math.round(p.y * scale) + 1;
      const pw = Math.round(p.dw * scale) - 1;
      const ph = Math.round(p.dh * scale) - 1;
      if (x >= px && x <= px + pw && y >= py && y <= py + ph) {
        return i;
      }
    }
    return null;
  }, [tir.placed, getScale]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const palletIndex = findPalletAtPoint(e.clientX, e.clientY);
    if (palletIndex !== null) {
      const p = tir.placed[palletIndex];
      setDragging({
        palletIndex,
        startX: e.clientX,
        startY: e.clientY,
        origX: p.x,
        origY: p.y,
        palletName: p.name,
      });
    }
  }, [findPalletAtPoint, tir.placed]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const palletIndex = findPalletAtPoint(e.clientX, e.clientY);
    setHoveredPallet(palletIndex);

    if (dragging) {
      const scale = getScale();
      const dx = (e.clientX - dragging.startX) / scale;
      const dy = (e.clientY - dragging.startY) / scale;
      
      const newX = Math.max(0, Math.min(dragging.origX + dx, tLen - tir.placed[dragging.palletIndex].dw));
      const newY = Math.max(0, Math.min(dragging.origY + dy, tWid - tir.placed[dragging.palletIndex].dh));
      
      // Sürükleme sırasında geçici pozisyon güncellemesi
      setTirs((prevTirs) => {
        const newTirs = [...prevTirs];
        const tir = newTirs[tirIndex];
        if (!tir) return prevTirs;

        const newPlaced = [...tir.placed];
        const pallet = newPlaced[dragging.palletIndex];
        if (!pallet) return prevTirs;

        newPlaced[dragging.palletIndex] = { ...pallet, x: newX, y: newY };
        newTirs[tirIndex] = { ...tir, placed: newPlaced };

        return newTirs;
      });
    }
  }, [dragging, findPalletAtPoint, getScale, tLen, tWid, tir.placed, tirIndex]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragging && onPalletMove) {
      const scale = getScale();
      const dx = (e.clientX - dragging.startX) / scale;
      const dy = (e.clientY - dragging.startY) / scale;
      
      let newX = Math.round(dragging.origX + dx);
      let newY = Math.round(dragging.origY + dy);
      
      // Sınır kontrolü
      const p = tir.placed[dragging.palletIndex];
      newX = Math.max(0, Math.min(newX, tLen - p.dw));
      newY = Math.max(0, Math.min(newY, tWid - p.dh));
      
      onPalletMove(tirIndex, dragging.palletIndex, newX, newY);
    }
    setDragging(null);
  }, [dragging, onPalletMove, getScale, tirIndex, tir.placed, tLen, tWid]);

  const handleMouseLeave = useCallback(() => {
    setDragging(null);
    setHoveredPallet(null);
  }, []);

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

    tir.placed.forEach((p, idx) => {
      const px = Math.round(p.x * scale) + 1;
      const py = Math.round(p.y * scale) + 1;
      const pw = Math.round(p.dw * scale) - 1;
      const ph = Math.round(p.dh * scale) - 1;
      if (pw < 1 || ph < 1) return;

      // Hover efekti
      const isHovered = hoveredPallet === idx;
      const isDragged = dragging?.palletIndex === idx;
      
      ctx.fillStyle = isDragged 
        ? p.color + 'FF' 
        : (isHovered ? p.color + 'EE' : p.color + 'CC');
      ctx.fillRect(px, py, pw, ph);
      
      // Border ve shadow efekti
      ctx.strokeStyle = isHovered || isDragged ? '#fff' : p.color;
      ctx.lineWidth = isHovered || isDragged ? 3 : 1;
      if (isHovered || isDragged) {
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      ctx.strokeRect(px, py, pw, ph);
      ctx.shadowColor = 'transparent';

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
  }, [tir, tLen, tWid, hoveredPallet, dragging]);

  const seen: Record<string, string> = {};
  tir.placed.forEach((p) => { if (!seen[p.name]) seen[p.name] = p.color; });

  return (
    <div>
      <div className="relative rounded-lg overflow-hidden" ref={wrapRef}>
        <canvas 
          ref={canvasRef} 
          className={`block border border-stone-200 rounded-lg w-full ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-semibold text-stone-500 border border-stone-200">
          Dorsé {tirIndex + 1}/{tirTotal} · {tir.placed.length} palet · %{tir.util} doluluk
        </div>
        {dragging && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-lg">
            📦 {dragging.palletName}
          </div>
        )}
        {dragging && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-lg">
            🖱️ Paleti sürükleyin ve bırakın
          </div>
        )}
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

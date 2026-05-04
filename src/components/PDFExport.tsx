import jsPDF from 'jspdf';
import { TirResult, PalletDef } from '../types';

interface PDFExportProps {
  tirs: TirResult[];
  pallets: PalletDef[];
  config: {
    tLen: number;
    tWid: number;
    kingpinDist: number;
    axleDist: number;
    limitFront: number;
    limitTrailer: number;
    limitTotal: number;
  };
}

export function exportToPDF({ tirs, pallets, config }: PDFExportProps) {
  if (tirs.length === 0) return;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  tirs.forEach((tir, tirIndex) => {
    if (tirIndex > 0) {
      doc.addPage();
    }

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(24, 95, 165);
    doc.text(`TIR ${tir.id} YÜKLEME RAPORU`, margin, margin + 6);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Sayfa ${tirIndex + 1}/${tirs.length}`, pageWidth - margin - 30, margin + 6);

    // Tir info box
    const infoY = margin + 15;
    doc.setDrawColor(220);
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(margin, infoY, contentWidth, 18, 2, 2, 'FD');
    doc.setDrawColor(220);
    doc.line(margin, infoY, pageWidth - margin, infoY);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60);
    doc.text(`Palet Sayısı: ${tir.placed.length}`, margin + 5, infoY + 7);
    doc.text(`Doluluk Oranı: %${tir.util}`, margin + 5, infoY + 13);

    doc.text(`Toplam Ağırlık: ${Math.round(tir.weightDist.totalWeight).toLocaleString()} kg`, margin + 60, infoY + 7);
    doc.text(`Kingpin Yükü: ${Math.round(tir.weightDist.kingpinLoad).toLocaleString()} kg`, margin + 60, infoY + 13);

    doc.text(`Dingil Yükü: ${Math.round(tir.weightDist.axleLoad).toLocaleString()} kg`, margin + 130, infoY + 7);
    doc.text(`Araç Boyutları: ${config.tLen}x${config.tWid} cm`, margin + 130, infoY + 13);

    // Canvas area for trailer visualization
    const canvasY = infoY + 25;
    const canvasHeight = 80;

    // Draw trailer outline
    const trailerScale = Math.min((contentWidth - 20) / config.tLen, canvasHeight / config.tWid);
    const trailerW = config.tLen * trailerScale;
    const trailerH = config.tWid * trailerScale;
    const trailerX = margin + (contentWidth - trailerW) / 2;

    doc.setDrawColor(100);
    doc.setLineWidth(0.5);
    doc.rect(trailerX, canvasY, trailerW, trailerH);

    // Draw zone lines
    const frontLine = trailerX + config.tLen * 0.33 * trailerScale;
    const rearLine = trailerX + config.tLen * 0.66 * trailerScale;

    doc.setDrawColor(200);
    doc.setLineDash([2, 2]);
    doc.line(frontLine, canvasY, frontLine, canvasY + trailerH);
    doc.line(rearLine, canvasY, rearLine, canvasY + trailerH);
    doc.setLineDash([]);

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('ÖN', frontLine / 2 + trailerX / 2, canvasY + 5);
    doc.text('ORTA', frontLine + (rearLine - frontLine) / 2, canvasY + 5);
    doc.text('ARKA', rearLine + (trailerX + trailerW - rearLine) / 2, canvasY + 5);

    // Draw placed pallets
    tir.placed.forEach((p) => {
      const px = trailerX + p.x * trailerScale;
      const py = canvasY + p.y * trailerScale;
      const pw = p.dw * trailerScale;
      const ph = p.dh * trailerScale;

      // Convert hex color to RGB
      const hex = p.color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      doc.setFillColor(r, g, b);
      doc.setDrawColor(r, g, b);
      doc.rect(px, py, pw, ph, 'FD');

      // Add label if space permits
      if (pw > 8 && ph > 5) {
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        const label = p.name.length > 10 ? `${p.w}×${p.h}` : p.name;
        doc.text(label, px + pw / 2, py + ph / 2, { align: 'center' });
      }
    });

    // Weight distribution section
    const weightY = canvasY + canvasHeight + 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(24, 95, 165);
    doc.text('BÖLGESEL AĞIRLIK DAĞILIMI', margin, weightY);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const regions = [
      { name: 'Ön Bölge', weight: tir.weightDist.frontW, count: tir.weightDist.frontCount, color: [55, 138, 221] },
      { name: 'Orta Bölge', weight: tir.weightDist.middleW, count: tir.weightDist.middleCount, color: [29, 158, 117] },
      { name: 'Arka Bölge', weight: tir.weightDist.rearW, count: tir.weightDist.rearCount, color: [216, 90, 48] },
    ];

    const totalWeight = tir.weightDist.totalWeight || 1;
    let regionX = margin;

    regions.forEach((region) => {
      const pct = Math.round((region.weight / totalWeight) * 100);
      const barWidth = (contentWidth / 3) - 5;

      doc.setFillColor(...region.color);
      doc.rect(regionX, weightY + 5, barWidth, 8, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(`${pct}%`, regionX + barWidth / 2, weightY + 10.5, { align: 'center' });

      doc.setTextColor(60);
      doc.setFont('helvetica', 'normal');
      doc.text(region.name, regionX, weightY + 18);
      doc.text(`${Math.round(region.weight).toLocaleString()} kg (${region.count} palet)`, regionX, weightY + 23);

      regionX += barWidth + 5;
    });

    // Axle load analysis
    const axleY = weightY + 35;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(216, 90, 48);
    doc.text('DİNGİL YÜK ANALİZİ', margin, axleY);

    const axleData = [
      { name: 'Kingpin (Çekici)', val: tir.weightDist.kingpinLoad, limit: config.limitFront },
      { name: 'Dorsé Dingili', val: tir.weightDist.axleLoad, limit: config.limitTrailer },
      { name: 'Toplam', val: tir.weightDist.totalWeight, limit: config.limitTotal },
    ];

    let contentAxleY = axleY + 8;
    axleData.forEach((item, idx) => {
      const isOver = item.val > item.limit;
      const status = isOver ? 'AŞIM' : (item.val > item.limit * 0.9 ? 'YAKIN' : 'UYGUN');
      const statusColor = isOver ? [212, 83, 126] : [29, 158, 117];

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60);
      doc.text(item.name, margin, contentAxleY + (idx * 10));

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(isOver ? [212, 83, 126] : [24, 95, 165]);
      doc.text(`${Math.round(item.val).toLocaleString()} kg`, margin + 50, contentAxleY + (idx * 10));

      doc.setTextColor(100);
      doc.setFontSize(8);
      doc.text(`Limit: ${item.limit.toLocaleString()} kg`, margin + 85, contentAxleY + (idx * 10));

      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(status, margin + 140, contentAxleY + (idx * 10));
    });

    // Load list section
    const listY = contentAxleY + 32;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(29, 158, 117);
    doc.text('YÜK LİSTESİ', margin, listY);

    // Group pallets by type
    const palletGroups: Record<string, { name: string; w: number; h: number; weight: number; count: number; color: string }> = {};
    tir.placed.forEach((p) => {
      const key = `${p.name}_${p.w}_${p.h}`;
      if (!palletGroups[key]) {
        palletGroups[key] = { name: p.name, w: p.w, h: p.h, weight: p.weight, count: 0, color: p.color };
      }
      palletGroups[key].count++;
    });

    const groups = Object.values(palletGroups);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60);

    // Table header
    const tableY = listY + 8;
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, tableY, contentWidth, 6, 'F');
    doc.setDrawColor(220);
    doc.line(margin, tableY, pageWidth - margin, tableY);
    doc.line(margin, tableY + 6, pageWidth - margin, tableY + 6);

    doc.setFont('helvetica', 'bold');
    doc.text('Palet Tipi', margin + 3, tableY + 4);
    doc.text('Boyutlar (cm)', margin + 40, tableY + 4);
    doc.text('Ağırlık (kg)', margin + 75, tableY + 4);
    doc.text('Adet', margin + 110, tableY + 4);
    doc.text('Toplam Ağırlık (kg)', margin + 135, tableY + 4);

    let rowY = tableY + 12;
    groups.forEach((group) => {
      if (rowY > pageHeight - margin - 10) {
        doc.addPage();
        rowY = margin + 10;
      }

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60);
      doc.text(group.name, margin + 3, rowY);
      doc.text(`${group.w} × ${group.h}`, margin + 40, rowY);
      doc.text(group.weight.toString(), margin + 75, rowY);
      doc.text(group.count.toString(), margin + 110, rowY);
      doc.text(Math.round(group.weight * group.count).toLocaleString(), margin + 135, rowY);

      rowY += 6;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}`, margin, pageHeight - 10);
  });

  doc.save(`tir-yukleme-raporu-${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Palet tanımları ve yerleştirilmiş paletler için ortak arayüzler
 */

export interface PalletDef {
  id: string;
  name: string;
  w: number;        // Genişlik (cm)
  h: number;        // Uzunluk (cm)
  weight: number;   // Ağırlık (kg)
  count: number;    // Adet
  sort_order: number;
}

export interface PlacedPallet extends PalletDef {
  x: number;        // X pozisyonu (cm)
  y: number;        // Y pozisyonu (cm)
  dw: number;       // Çizim genişliği
  dh: number;       // Çizim yüksekliği
  color: string;    // Renk kodu
}

/**
 * Ağırlık dağılımı bilgisi
 */
export interface WeightDist {
  totalWeight: number;    // Toplam ağırlık (kg)
  frontW: number;         // Ön bölge ağırlığı (kg)
  middleW: number;        // Orta bölge ağırlığı (kg)
  rearW: number;          // Arka bölge ağırlığı (kg)
  overallCG: number;      // Genel ağırlık merkezi (cm)
  kingpinLoad: number;    // Kingpin yükü (kg)
  axleLoad: number;       // Dingil yükü (kg)
  frontCount: number;     // Ön bölge palet sayısı
  middleCount: number;    // Orta bölge palet sayısı
  rearCount: number;      // Arka bölge palet sayısı
}

/**
 * Tır yerleştirme sonucu
 */
export interface TirResult {
  id: number;
  placed: PlacedPallet[];
  util: number;           // Doluluk oranı (%)
  weightDist: WeightDist;
}

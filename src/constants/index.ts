/**
 * Sabit palet renkleri
 */
export const PALETTE_COLORS = [
  '#378ADD', '#1D9E75', '#D85A30', '#7F77DD',
  '#BA7517', '#993556', '#639922', '#0F6E56',
  '#D4537E', '#185FA5',
];

/**
 * Ön tanımlı palet tipleri
 */
export interface PalletPreset {
  name: string;
  w: number;
  h: number;
  weight: number;
  count: number;
}

export const PRESETS: PalletPreset[] = [
  { name: 'Euro 80×120', w: 80, h: 120, weight: 450, count: 1 },
  { name: 'İndustriyel 100×120', w: 100, h: 120, weight: 800, count: 1 },
  { name: 'Yarım 60×80', w: 60, h: 80, weight: 250, count: 1 },
  { name: 'ABD 40×48 in', w: 101, h: 122, weight: 750, count: 1 },
  { name: 'Havacılık 88×108', w: 88, h: 108, weight: 600, count: 1 },
  { name: 'Kimya 100×100', w: 100, h: 100, weight: 700, count: 1 },
];

/**
 * Varsayılan araç konfigürasyonu
 */
export const DEFAULT_CONFIG = {
  tLen: 1360,       // Dorse uzunluğu (cm)
  tWid: 240,        // Dorse genişliği (cm)
  gap: 0,           // Palet arası boşluk (cm)
  kingpinDist: 120, // Kingpin mesafesi (cm)
  axleDist: 270,    // Dingil grubu mesafesi (cm)
  limitFront: 8000, // Ön dingil limiti (kg)
  limitTrailer: 24000, // Dorsé dingil limiti (kg)
  limitTotal: 40000,   // Toplam ağırlık limiti (kg)
};

/**
 * Bölge sınırları (dorse uzunluğuna göre oranlar)
 */
export const ZONE_LIMITS = {
  frontRatio: 0.33,   // Ön bölge bitiş oranı
  rearRatio: 0.66,    // Arka bölge başlangıç oranı
};

/**
 * Maksimum Tır sayısı
 */
export const MAX_TIRS = 50;

/**
 * LocalStorage anahtarları
 */
export const STORAGE_KEYS = {
  SESSION_ID: 'tir_session_id',
};

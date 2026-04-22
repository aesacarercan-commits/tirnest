import { Truck } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-50 shadow-sm">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg,#185FA5,#1D9E75)', boxShadow: '0 2px 8px rgba(24,95,165,0.25)' }}>
        <Truck size={20} className="text-white" />
      </div>
      <div>
        <h1 className="text-base font-semibold text-stone-800 leading-tight">Tır Dorse Yük Dizme & Ağırlık Analizi</h1>
        <p className="text-xs text-stone-500">Palet yerleşimi, doluluk oranı ve dingil yük dağılımı</p>
      </div>
    </header>
  );
}

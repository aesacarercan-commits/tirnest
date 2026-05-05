import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { PalletDef } from '../types';

/**
 * Palet tanımları için custom hook
 * Supabase ile senkronizasyon ve CRUD işlemlerini yönetir
 */
export function usePallets() {
  const [pallets, setPallets] = useState<PalletDef[]>([]);
  const [loading, setLoading] = useState(true);

  const sessionId = useCallback(() => {
    return localStorage.getItem('tir_session_id') || '';
  }, []);

  // Paletleri yükle
  const loadPallets = useCallback(async () => {
    const defaults: PalletDef[] = [
      { id: 'def1', name: 'Euro 80×120', w: 80, h: 120, weight: 450, count: 24, sort_order: 0 },
      { id: 'def2', name: 'İndustriyel 100×120', w: 100, h: 120, weight: 800, count: 8, sort_order: 1 },
      { id: 'def3', name: 'Yarım 60×80', w: 60, h: 80, weight: 250, count: 0, sort_order: 2 },
    ];

    try {
      if (!supabase) {
        setPallets(defaults);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('pallet_definitions')
        .select('*')
        .eq('session_id', sessionId())
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setPallets(data.map((d) => ({
          id: d.id, name: d.name, w: d.w, h: d.h,
          weight: d.weight, count: d.count, sort_order: d.sort_order,
        })));
      } else {
        setPallets(defaults);
        await supabase.from('pallet_definitions').insert(
          defaults.map((d) => ({ ...d, session_id: sessionId() }))
        );
      }
    } catch (err) {
      console.error('Failed to load pallets:', err);
      setPallets(defaults);
    }
    setLoading(false);
  }, [sessionId]);

  // İlk yükleme
  useEffect(() => {
    loadPallets();
  }, [loadPallets]);

  // Palet kaydet/güncelle
  const savePallet = useCallback(async (p: PalletDef) => {
    try {
      if (supabase) {
        await supabase.from('pallet_definitions').upsert({ ...p, session_id: sessionId() });
      }
    } catch (err) {
      console.error('Failed to save pallet:', err);
    }
  }, [sessionId]);

  // Adet değiştir
  const handleCountChange = useCallback((id: string, count: number) => {
    setPallets((prev) => {
      const next = prev.map((p) => p.id === id ? { ...p, count } : p);
      const updated = next.find((p) => p.id === id);
      if (updated) savePallet(updated);
      return next;
    });
  }, [savePallet]);

  // Ağırlık değiştir
  const handleWeightChange = useCallback((id: string, weight: number) => {
    setPallets((prev) => {
      const next = prev.map((p) => p.id === id ? { ...p, weight } : p);
      const updated = next.find((p) => p.id === id);
      if (updated) savePallet(updated);
      return next;
    });
  }, [savePallet]);

  // Palet sil
  const handleRemove = useCallback(async (id: string) => {
    setPallets((prev) => prev.filter((p) => p.id !== id));
    try {
      if (supabase) {
        await supabase.from('pallet_definitions').delete().eq('id', id).eq('session_id', sessionId());
      }
    } catch (err) {
      console.error('Failed to delete pallet:', err);
    }
  }, [sessionId]);

  // Yeni palet ekle
  const handleAdd = useCallback(async (def: Omit<PalletDef, 'id' | 'sort_order'>) => {
    const id = 'p_' + Date.now().toString(36);
    const sort_order = pallets.length;
    const newPallet: PalletDef = { ...def, id, sort_order };
    setPallets((prev) => [...prev, newPallet]);
    try {
      if (supabase) {
        await supabase.from('pallet_definitions').insert({ ...newPallet, session_id: sessionId() });
      }
    } catch (err) {
      console.error('Failed to add pallet:', err);
    }
  }, [pallets.length, sessionId]);

  return {
    pallets,
    loading,
    handleCountChange,
    handleWeightChange,
    handleRemove,
    handleAdd,
    refresh: loadPallets,
  };
}

// context/TripSetupContext.tsx
// Menyimpan pilihan mode kendaraan & penempatan perangkat dari Home Dashboard,
// agar bisa dibaca layar Active Trip (mis. untuk memilih threshold sensor).
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import type { DevicePlacement, VehicleMode } from '@/types';

interface TripSetupState {
  mode: VehicleMode;
  placement: DevicePlacement;
  setMode: (m: VehicleMode) => void;
  setPlacement: (p: DevicePlacement) => void;
}

const TripSetupContext = createContext<TripSetupState | null>(null);

export function TripSetupProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<VehicleMode>('motor');
  const [placement, setPlacement] = useState<DevicePlacement>('dasbor');

  const value = useMemo(
    () => ({ mode, placement, setMode, setPlacement }),
    [mode, placement],
  );

  return <TripSetupContext.Provider value={value}>{children}</TripSetupContext.Provider>;
}

export function useTripSetup() {
  const ctx = useContext(TripSetupContext);
  if (!ctx) throw new Error('useTripSetup harus dipakai di dalam TripSetupProvider');
  return ctx;
}

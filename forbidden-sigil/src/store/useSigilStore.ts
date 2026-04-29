import { create } from 'zustand'

export interface RingParams {
  radius: number
  thickness: number
  color: string
  speed: number
}

export interface SigilState {
  rings: [RingParams, RingParams, RingParams]
  bloomStrength: number

  // アクション
  setRing: (index: 0 | 1 | 2, patch: Partial<RingParams>) => void
  setBloomStrength: (value: number) => void
}

export const useSigilStore = create<SigilState>((set) => ({
  rings: [
    { radius: 1.8, thickness: 3, color: '#00ffcc', speed: 0.5 },
    { radius: 1.3, thickness: 2, color: '#ff44aa', speed: -0.8 },
    { radius: 0.7, thickness: 4, color: '#4488ff', speed: 1.2 },
  ],
  bloomStrength: 1.5,

  setRing: (index, patch) =>
    set((state) => {
      const rings = [...state.rings] as [RingParams, RingParams, RingParams]
      rings[index] = { ...rings[index], ...patch }
      return { rings }
    }),

  setBloomStrength: (value) => set({ bloomStrength: value }),
}))

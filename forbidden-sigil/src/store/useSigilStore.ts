import { create } from 'zustand'
import type { LayerConfig, LayerType } from './layerConfigs'
import { LAYER_DEFAULTS } from './layerConfigs'

export interface GlobalSettings {
  bloomStrength: number
  bgColor: string          // 背景色
  cameraDistance: number   // カメラ距離（2〜12）
  cameraAngle: number     // カメラ俯角（5〜90度）
  cameraAzimuth: number   // カメラ水平角（度）
}

export interface SigilState {
  layers: LayerConfig[]
  global: GlobalSettings

  // レイヤー操作
  addLayer: (type: LayerType) => void
  removeLayer: (id: string) => void
  updateLayer: (id: string, patch: Record<string, unknown>) => void
  reorderLayer: (id: string, direction: 'up' | 'down') => void

  // グローバル
  setGlobal: (patch: Partial<GlobalSettings>) => void
}

export const useSigilStore = create<SigilState>((set) => ({
  // 初期レイヤー（魔法陣っぽいデフォルト）
  layers: [
    { ...LAYER_DEFAULTS.ring(), id: 'init-ring-outer', radius: 1.8, thickness: 3, speed: 0.5 },
    { ...LAYER_DEFAULTS.polygon(), id: 'init-hex', sides: 6, radius: 1.3, thickness: 2, speed: -0.3 },
    { ...LAYER_DEFAULTS.starPolygon(), id: 'init-star', points: 5, skip: 2, radius: 1.0, thickness: 2, speed: 0.4 },
    { ...LAYER_DEFAULTS.ring(), id: 'init-ring-inner', radius: 0.5, thickness: 2, speed: -0.6 },
  ] as LayerConfig[],
  global: {
    bloomStrength: 0.3,
    bgColor: '#050510',
    cameraDistance: 5.6,
    cameraAngle: 45,
    cameraAzimuth: 0,
  },

  addLayer: (type) =>
    set((state) => ({
      layers: [...state.layers, LAYER_DEFAULTS[type]()],
    })),

  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
    })),

  updateLayer: (id, patch) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? ({ ...l, ...patch } as LayerConfig) : l,
      ),
    })),

  reorderLayer: (id, direction) =>
    set((state) => {
      const layers = [...state.layers]
      const idx = layers.findIndex((l) => l.id === id)
      if (idx === -1) return state
      const swap = direction === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= layers.length) return state
      ;[layers[idx], layers[swap]] = [layers[swap], layers[idx]]
      return { layers }
    }),

  setGlobal: (patch) =>
    set((state) => ({
      global: { ...state.global, ...patch },
    })),
}))

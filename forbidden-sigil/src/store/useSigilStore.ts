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

/** 各エフェクトの有効/無効 + パラメータ */
export interface EffectSettings {
  vignette: { enabled: boolean; intensity: number }
  chromatic: { enabled: boolean; offset: number }
  scanLines: { enabled: boolean; density: number; opacity: number }
  noise: { enabled: boolean; intensity: number }
}

/** パーティクル共通 + 個別パラメータ */
export interface ParticleSettings {
  risingSparks:  { enabled: boolean; count: number; speed: number; spread: number; size: number; color: string }
  dust:          { enabled: boolean; count: number; speed: number; spread: number; size: number; color: string }
  orbital:       { enabled: boolean; count: number; speed: number; radius: number; size: number; color: string }
  fireflies:     { enabled: boolean; count: number; speed: number; spread: number; size: number; color: string }
  energyMist:    { enabled: boolean; count: number; speed: number; spread: number; size: number; color: string }
  fallingAsh:    { enabled: boolean; count: number; speed: number; spread: number; size: number; color: string }
}

export type ParticleKey = keyof ParticleSettings

export interface SigilState {
  layers: LayerConfig[]
  global: GlobalSettings
  effects: EffectSettings
  particles: ParticleSettings

  // レイヤー操作
  addLayer: (type: LayerType) => void
  removeLayer: (id: string) => void
  updateLayer: (id: string, patch: Record<string, unknown>) => void
  reorderLayer: (id: string, direction: 'up' | 'down') => void

  // グローバル
  setGlobal: (patch: Partial<GlobalSettings>) => void

  // エフェクト
  setEffect: <K extends keyof EffectSettings>(
    key: K,
    patch: Partial<EffectSettings[K]>,
  ) => void

  // パーティクル
  setParticle: <K extends keyof ParticleSettings>(
    key: K,
    patch: Partial<ParticleSettings[K]>,
  ) => void
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
  effects: {
    vignette: { enabled: false, intensity: 0.8 },
    chromatic: { enabled: false, offset: 0.003 },
    scanLines: { enabled: false, density: 1.5, opacity: 0.15 },
    noise: { enabled: false, intensity: 0.08 },
  },
  particles: {
    risingSparks:  { enabled: false, count: 120, speed: 1.0, spread: 2.5, size: 0.03, color: '#ffaa44' },
    dust:          { enabled: false, count: 200, speed: 0.2, spread: 3.0, size: 0.02, color: '#ffffff' },
    orbital:       { enabled: false, count: 80,  speed: 0.5, radius: 1.8, size: 0.025, color: '#8888ff' },
    fireflies:     { enabled: false, count: 40,  speed: 0.3, spread: 3.0, size: 0.04, color: '#66ff88' },
    energyMist:    { enabled: false, count: 300, speed: 0.1, spread: 2.0, size: 0.05, color: '#aa66ff' },
    fallingAsh:    { enabled: false, count: 100, speed: 0.4, spread: 3.0, size: 0.02, color: '#ff8844' },
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

  setEffect: (key, patch) =>
    set((state) => ({
      effects: {
        ...state.effects,
        [key]: { ...state.effects[key], ...patch },
      },
    })),

  setParticle: (key, patch) =>
    set((state) => ({
      particles: {
        ...state.particles,
        [key]: { ...state.particles[key], ...patch },
      },
    })),
}))

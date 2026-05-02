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
  duplicateLayer: (id: string) => void
  randomizeLayers: () => void

  // インポート/エクスポート
  exportState: () => string
  importState: (json: string) => boolean

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

  duplicateLayer: (id) =>
    set((state) => {
      const source = state.layers.find((l) => l.id === id)
      if (!source) return state
      const copy = { ...source, id: `${source.type}-dup-${Date.now()}` } as LayerConfig
      const idx = state.layers.indexOf(source)
      const layers = [...state.layers]
      layers.splice(idx + 1, 0, copy)
      return { layers }
    }),

  randomizeLayers: () =>
    set(() => {
      const types: LayerType[] = [
        'ring', 'polygon', 'starPolygon', 'spokes',
        'concentricRings', 'vertexMarks', 'crescent',
        'dotChain', 'wavePattern', 'spiralArm',
        'pulseRings', 'runeRing',
      ]
      const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
      const rand = (min: number, max: number) => min + Math.random() * (max - min)

      // 3〜7 レイヤーをランダム生成
      const count = 3 + Math.floor(Math.random() * 5)
      const layers: LayerConfig[] = []

      // 必ず外周リングを含める
      const outerRing = LAYER_DEFAULTS.ring()
      outerRing.radius = 1.6 + Math.random() * 0.6
      outerRing.thickness = 2 + Math.floor(Math.random() * 3)
      outerRing.speed = rand(-0.8, 0.8)
      outerRing.dashed = Math.random() > 0.6
      outerRing.double = Math.random() > 0.5
      layers.push(outerRing)

      for (let i = 1; i < count; i++) {
        const type = pick(types)
        const config = LAYER_DEFAULTS[type]() as LayerConfig
        const c = config as unknown as Record<string, unknown>

        // 共通パラメータをランダマイズ
        c.speed = rand(-1, 1)
        c.rotationOffset = Math.floor(rand(0, 360))
        c.scale = rand(0.6, 1.4)

        // 半径系をばらけさせる
        if ('radius' in c && typeof c.radius === 'number') {
          c.radius = rand(0.4, 2.0)
        }
        if ('outerRadius' in c && typeof c.outerRadius === 'number') {
          c.outerRadius = rand(1.0, 2.2)
        }

        // ランダム色（ゴールド〜ブルー〜パープル系）
        const hue = pick([40, 60, 200, 220, 260, 280, 300])
        const sat = 50 + Math.floor(Math.random() * 50)
        const lit = 50 + Math.floor(Math.random() * 30)
        c.color = `hsl(${hue}, ${sat}%, ${lit}%)`

        layers.push(config)
      }

      // ランダムな背景色
      const bgHue = Math.floor(Math.random() * 360)
      return {
        layers,
        global: {
          bloomStrength: rand(0.2, 1.2),
          bgColor: `hsl(${bgHue}, 30%, 3%)`,
          cameraDistance: rand(4, 7),
          cameraAngle: rand(30, 60),
          cameraAzimuth: rand(-30, 30),
        },
      }
    }),

  exportState: () => {
    const { layers, global, effects, particles } = useSigilStore.getState()
    return JSON.stringify({ layers, global, effects, particles }, null, 2)
  },

  importState: (json) => {
    try {
      const data = JSON.parse(json)
      if (!data.layers || !Array.isArray(data.layers)) return false
      set({
        layers: data.layers,
        ...(data.global && { global: data.global }),
        ...(data.effects && { effects: data.effects }),
        ...(data.particles && { particles: data.particles }),
      })
      return true
    } catch {
      return false
    }
  },

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

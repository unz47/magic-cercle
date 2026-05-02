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

/** Undo/Redo 対象のスナップショット */
export interface SigilSnapshot {
  layers: LayerConfig[]
  global: GlobalSettings
  effects: EffectSettings
  particles: ParticleSettings
}

export interface SigilState extends SigilSnapshot {
  // Undo/Redo
  _past: SigilSnapshot[]
  _future: SigilSnapshot[]
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean

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

const HISTORY_LIMIT = 50
const THROTTLE_MS = 400

/** 現在の状態からスナップショットを取得 */
function getSnapshot(state: SigilState): SigilSnapshot {
  return {
    layers: state.layers,
    global: state.global,
    effects: state.effects,
    particles: state.particles,
  }
}

/** 履歴に現在の状態を保存してから変更を適用するヘルパー */
function withHistory(state: SigilState, patch: Partial<SigilSnapshot>): Partial<SigilState> {
  const past = [...state._past, getSnapshot(state)]
  if (past.length > HISTORY_LIMIT) past.shift()
  return {
    ...patch,
    _past: past,
    _future: [],
    canUndo: true,
    canRedo: false,
  }
}

/**
 * スロットル付き履歴保存（スライダー操作時に毎フレーム履歴を記録しない）
 * 最後の保存から THROTTLE_MS 以内の場合は履歴を追加せず値だけ更新
 */
let _lastHistoryTime = 0
function withThrottledHistory(state: SigilState, patch: Partial<SigilSnapshot>): Partial<SigilState> {
  const now = Date.now()
  if (now - _lastHistoryTime < THROTTLE_MS) {
    // 履歴なしで値だけ更新（直前の操作をまとめる）
    return { ...patch }
  }
  _lastHistoryTime = now
  return withHistory(state, patch)
}

export const useSigilStore = create<SigilState>((set, get) => ({
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

  // Undo/Redo 状態
  _past: [],
  _future: [],
  canUndo: false,
  canRedo: false,

  undo: () =>
    set((state) => {
      if (state._past.length === 0) return state
      const past = [...state._past]
      const previous = past.pop()!
      return {
        ...previous,
        _past: past,
        _future: [getSnapshot(state), ...state._future],
        canUndo: past.length > 0,
        canRedo: true,
      }
    }),

  redo: () =>
    set((state) => {
      if (state._future.length === 0) return state
      const future = [...state._future]
      const next = future.shift()!
      return {
        ...next,
        _past: [...state._past, getSnapshot(state)],
        _future: future,
        canUndo: true,
        canRedo: future.length > 0,
      }
    }),

  addLayer: (type) =>
    set((state) => withHistory(state, {
      layers: [...state.layers, LAYER_DEFAULTS[type]()],
    })),

  removeLayer: (id) =>
    set((state) => withHistory(state, {
      layers: state.layers.filter((l) => l.id !== id),
    })),

  updateLayer: (id, patch) =>
    set((state) => withThrottledHistory(state, {
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
      return withHistory(state, { layers })
    }),

  duplicateLayer: (id) =>
    set((state) => {
      const source = state.layers.find((l) => l.id === id)
      if (!source) return state
      const copy = { ...source, id: `${source.type}-dup-${Date.now()}` } as LayerConfig
      const idx = state.layers.indexOf(source)
      const layers = [...state.layers]
      layers.splice(idx + 1, 0, copy)
      return withHistory(state, { layers })
    }),

  randomizeLayers: () =>
    set((state) => {
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
      const or = outerRing as unknown as Record<string, unknown>
      or.radius = 1.6 + Math.random() * 0.6
      or.thickness = 2 + Math.floor(Math.random() * 3)
      or.speed = rand(-0.8, 0.8)
      or.dashed = Math.random() > 0.6
      or.double = Math.random() > 0.5
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
      return withHistory(state, {
        layers,
        global: {
          bloomStrength: rand(0.2, 1.2),
          bgColor: `hsl(${bgHue}, 30%, 3%)`,
          cameraDistance: rand(4, 7),
          cameraAngle: rand(30, 60),
          cameraAzimuth: rand(-30, 30),
        },
      })
    }),

  exportState: () => {
    const { layers, global, effects, particles } = get()
    return JSON.stringify({ layers, global, effects, particles }, null, 2)
  },

  importState: (json) => {
    try {
      // サイズ制限 (5MB)
      if (json.length > 5 * 1024 * 1024) return false

      const data = JSON.parse(json)
      if (!data.layers || !Array.isArray(data.layers)) return false

      // レイヤー数上限
      if (data.layers.length > 50) return false

      // 許可されたレイヤータイプ
      const VALID_TYPES = new Set([
        'ring', 'polygon', 'starPolygon', 'spokes', 'concentricRings',
        'vertexMarks', 'crescent', 'dotChain', 'wavePattern', 'spiralArm',
        'pulseRings', 'floatingOrbs', 'runeRing', 'orbitalShape',
      ])

      // レイヤーの基本検証
      for (const layer of data.layers) {
        if (typeof layer !== 'object' || layer === null) return false
        if (typeof layer.id !== 'string' || layer.id.length > 100) return false
        if (!VALID_TYPES.has(layer.type)) return false
        if (typeof layer.color === 'string' && !/^#[0-9a-fA-F]{3,8}$/.test(layer.color)) return false
        // プロトタイプ汚染防止
        if ('__proto__' in layer || 'constructor' in layer || 'prototype' in layer) return false
      }

      // global設定の検証
      if (data.global) {
        if (typeof data.global !== 'object' || data.global === null) return false
        if (data.global.bgColor && !/^#[0-9a-fA-F]{3,8}$/.test(data.global.bgColor)) return false
      }

      const state = get()
      set(withHistory(state, {
        layers: data.layers,
        ...(data.global && { global: data.global }),
        ...(data.effects && { effects: data.effects }),
        ...(data.particles && { particles: data.particles }),
      }))
      return true
    } catch {
      return false
    }
  },

  setGlobal: (patch) =>
    set((state) => withThrottledHistory(state, {
      global: { ...state.global, ...patch },
    })),

  setEffect: (key, patch) =>
    set((state) => withThrottledHistory(state, {
      effects: {
        ...state.effects,
        [key]: { ...state.effects[key], ...patch },
      },
    })),

  setParticle: (key, patch) =>
    set((state) => withThrottledHistory(state, {
      particles: {
        ...state.particles,
        [key]: { ...state.particles[key], ...patch },
      },
    })),
}))

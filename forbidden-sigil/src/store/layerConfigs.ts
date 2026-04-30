/** ── レイヤー設定型 ── */

/** 全レイヤー共通フィールド */
interface LayerBase {
  id: string
  visible: boolean
  speed: number
  color: string
  opacity: number         // 0〜1
  rotationOffset: number  // 度（0〜360）
  yOffset: number         // Y軸オフセット（-2〜2）
  scale: number           // 拡大縮小（0.1〜3）
}

/** Ring — 単一の円環 */
export interface RingConfig extends LayerBase {
  type: 'ring'
  radius: number
  thickness: number
  dashed: boolean
  dashScale: number     // 破線の密度（1〜50）
  double: boolean       // 二重線
  doubleGap: number     // 二重線の間隔
}

/** Polygon — 正N角形 */
export interface PolygonConfig extends LayerBase {
  type: 'polygon'
  sides: number      // 3〜12
  radius: number
  thickness: number
}

/** StarPolygon — 星型多角形 {n/skip} */
export interface StarPolygonConfig extends LayerBase {
  type: 'starPolygon'
  points: number     // 5〜12
  skip: number       // 2〜floor(n/2)
  radius: number
  thickness: number
}

/** Spokes — 中心から放射する直線群 */
export interface SpokesConfig extends LayerBase {
  type: 'spokes'
  count: number      // 2〜36
  innerRadius: number
  outerRadius: number
  thickness: number
}

/** ConcentricRings — 等間隔の多重同心円 */
export interface ConcentricRingsConfig extends LayerBase {
  type: 'concentricRings'
  ringCount: number  // 2〜20
  innerRadius: number
  outerRadius: number
  thickness: number
}

/** VertexMarks — 多角形の頂点に装飾マーク */
export interface VertexMarksConfig extends LayerBase {
  type: 'vertexMarks'
  vertices: number    // 頂点数（3〜12）
  radius: number      // 配置半径
  markSize: number    // マークの大きさ
  markShape: 'dot' | 'diamond' | 'cross' | 'star'
}

/** Crescent — 三日月・弧月形 */
export interface CrescentConfig extends LayerBase {
  type: 'crescent'
  radius: number
  arc: number           // 弧の長さ（0〜1）
  count: number         // 弧の数（1〜8）
  thickness: number
}

/** DotChain — 数珠状ドットボーダー */
export interface DotChainConfig extends LayerBase {
  type: 'dotChain'
  dotCount: number      // 12〜60
  radius: number
  dotSize: number       // 0.01〜0.1
  alternating: boolean  // 大小交互
}

/** WavePattern — 波形ボーダー */
export interface WavePatternConfig extends LayerBase {
  type: 'wavePattern'
  radius: number
  frequency: number     // 波の数（4〜30）
  amplitude: number     // 波の高さ（0.01〜0.5）
  waveType: 'sine' | 'sawtooth' | 'triangle'
  thickness: number
}

/** SpiralArm — 螺旋の腕 */
export interface SpiralArmConfig extends LayerBase {
  type: 'spiralArm'
  armCount: number      // 1〜8
  turns: number         // 巻数（0.5〜5）
  innerRadius: number
  outerRadius: number
  logarithmic: boolean
  thickness: number
}

/** PulseRings — 衝撃波リング */
export interface PulseRingsConfig extends LayerBase {
  type: 'pulseRings'
  maxRadius: number
  pulseSpeed: number    // 0.1〜3
  maxRings: number      // 1〜8
  thickness: number
}

/** FloatingOrbs — 浮遊光球 */
export interface FloatingOrbsConfig extends LayerBase {
  type: 'floatingOrbs'
  count: number         // 3〜12
  radius: number
  height: number        // 浮遊高度
  orbSize: number       // 0.02〜0.2
  pulseSpeed: number
}

/** 全レイヤー設定の判別共用体 */
export type LayerConfig =
  | RingConfig
  | PolygonConfig
  | StarPolygonConfig
  | SpokesConfig
  | ConcentricRingsConfig
  | VertexMarksConfig
  | CrescentConfig
  | DotChainConfig
  | WavePatternConfig
  | SpiralArmConfig
  | PulseRingsConfig
  | FloatingOrbsConfig

/** レイヤー種別 */
export type LayerType = LayerConfig['type']

/** ── デフォルト共通値 ── */
const BASE_DEFAULTS: Omit<LayerBase, 'id'> = {
  visible: true,
  speed: 0,
  color: '#ffffff',
  opacity: 1,
  rotationOffset: 0,
  yOffset: 0,
  scale: 1,
}

/** ── デフォルト値ファクトリ ── */
let _nextId = 1
const uid = (prefix: string) => `${prefix}-${_nextId++}`

export const LAYER_DEFAULTS: Record<LayerType, () => LayerConfig> = {
  ring: () => ({
    ...BASE_DEFAULTS,
    id: uid('ring'),
    type: 'ring',
    speed: 0.5,
    radius: 1.5,
    thickness: 3,
    dashed: false,
    dashScale: 10,
    double: false,
    doubleGap: 0.15,
  }),
  polygon: () => ({
    ...BASE_DEFAULTS,
    id: uid('polygon'),
    type: 'polygon',
    speed: 0.3,
    sides: 6,
    radius: 1.5,
    thickness: 3,
  }),
  starPolygon: () => ({
    ...BASE_DEFAULTS,
    id: uid('star'),
    type: 'starPolygon',
    speed: -0.4,
    points: 5,
    skip: 2,
    radius: 1.5,
    thickness: 2,
  }),
  spokes: () => ({
    ...BASE_DEFAULTS,
    id: uid('spokes'),
    type: 'spokes',
    count: 8,
    innerRadius: 0.3,
    outerRadius: 1.8,
    thickness: 1,
  }),
  concentricRings: () => ({
    ...BASE_DEFAULTS,
    id: uid('concentric'),
    type: 'concentricRings',
    speed: 0.2,
    ringCount: 5,
    innerRadius: 0.5,
    outerRadius: 2.0,
    thickness: 1,
  }),
  vertexMarks: () => ({
    ...BASE_DEFAULTS,
    id: uid('vertex'),
    type: 'vertexMarks',
    vertices: 6,
    radius: 1.5,
    markSize: 0.08,
    markShape: 'dot' as const,
  }),
  crescent: () => ({
    ...BASE_DEFAULTS,
    id: uid('crescent'),
    type: 'crescent',
    speed: 0.3,
    radius: 1.5,
    arc: 0.25,
    count: 2,
    thickness: 3,
  }),
  dotChain: () => ({
    ...BASE_DEFAULTS,
    id: uid('dotchain'),
    type: 'dotChain',
    dotCount: 24,
    radius: 1.5,
    dotSize: 0.04,
    alternating: true,
  }),
  wavePattern: () => ({
    ...BASE_DEFAULTS,
    id: uid('wave'),
    type: 'wavePattern',
    radius: 1.5,
    frequency: 12,
    amplitude: 0.15,
    waveType: 'sine' as const,
    thickness: 2,
  }),
  spiralArm: () => ({
    ...BASE_DEFAULTS,
    id: uid('spiral'),
    type: 'spiralArm',
    speed: 0.2,
    armCount: 3,
    turns: 1.5,
    innerRadius: 0.3,
    outerRadius: 2.0,
    logarithmic: false,
    thickness: 2,
  }),
  pulseRings: () => ({
    ...BASE_DEFAULTS,
    id: uid('pulse'),
    type: 'pulseRings',
    speed: 1,
    maxRadius: 2.5,
    pulseSpeed: 0.8,
    maxRings: 4,
    thickness: 2,
  }),
  floatingOrbs: () => ({
    ...BASE_DEFAULTS,
    id: uid('orbs'),
    type: 'floatingOrbs',
    speed: 0.3,
    count: 6,
    radius: 1.5,
    height: 0.5,
    orbSize: 0.06,
    pulseSpeed: 1.0,
  }),
}

/** レイヤー種別の表示名 */
export const LAYER_LABELS: Record<LayerType, string> = {
  ring: 'Ring（円環）',
  polygon: 'Polygon（正多角形）',
  starPolygon: 'Star（星型）',
  spokes: 'Spokes（放射線）',
  concentricRings: 'Concentric（同心円）',
  vertexMarks: 'Vertex（頂点装飾）',
  crescent: 'Crescent（三日月）',
  dotChain: 'DotChain（数珠）',
  wavePattern: 'Wave（波形）',
  spiralArm: 'Spiral（螺旋）',
  pulseRings: 'Pulse（衝撃波）',
  floatingOrbs: 'Orbs（光球）',
}

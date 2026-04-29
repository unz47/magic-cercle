# データモデル（TypeScript 型定義）

## SigilConfig — トップレベル

```ts
export type SigilConfig = {
  version: '1.0'
  seed?: string
  arrangement: ArrangementId
  theme?: ThemeId
  global: GlobalParams
  layers: LayerConfig[]
}

export type GlobalParams = {
  primary: ColorHex
  secondary: ColorHex
  accent: ColorHex        // 第三色（エフェクト・ハイライト用）
  background: ColorHex    // 背景色
  glow: number            // 0-2
  chaos: number           // 0-1
  castSpeed: number       // 0.5-2
  cameraTilt: number      // 0 - π/2
  cameraDist: number      // 2-10
}

export type ArrangementId =
  | 'flat' | 'stack' | 'sphere' | 'cylinder' | 'tilted' | 'custom'

export type ThemeId =
  | 'hellfire' | 'frost' | 'void' | 'verdant'
  | 'holy' | 'blood' | 'twilight' | 'moonlight' | 'custom'

export type GlyphSetId =
  | 'elder-futhark' | 'younger-futhark' | 'anglo-saxon'
  | 'theban' | 'enochian' | 'alchemical'
  | 'planetary' | 'zodiac' | 'elemental'
  | 'occult' | 'kanji' | 'astro' | 'geometric' | 'custom'

type ColorHex = `#${string}`
```

## LayerConfig — 判別共用体

```ts
export type LayerConfig =
  // A. 幾何構造
  | RingLayer | PolygonLayer | StarPolygonLayer | SpokesLayer
  | CrescentLayer | VesicaPiscisLayer | SpiralArmLayer | ConcentricRingsLayer
  // B. 神聖幾何学
  | FlowerOfLifeLayer | MetatronsCubeLayer | SriYantraLayer | HexagramGridLayer
  // C. テキスト・文字
  | RuneBandLayer | TextBandLayer | SpiralTextLayer | PillarTextLayer | CipherWheelLayer
  // D. シンボル・アイコン
  | VertexMarksLayer | CoreSigilLayer | ZodiacRingLayer | PlanetarySymbolsLayer
  | ElementalTrianglesLayer | MoonPhasesLayer | CompassRoseLayer
  // E. 装飾・ボーダー
  | DotChainLayer | WavePatternLayer | ThornChainLayer | KnotworkBorderLayer
  // F. フィル・テクスチャ
  | FillPatternLayer | CrackLayer
  // G. エフェクト・パーティクル
  | AmbientParticlesLayer | EnergyBeamsLayer | PulseRingsLayer | LightningArcsLayer
  // H. 3D専用
  | FloatingOrbsLayer | GimbalRingsLayer
```

## LayerBase — 共通基底型

```ts
type LayerBase = {
  id: string
  type: string
  enabled: boolean
  label?: string              // ユーザーがつける任意の名前
  color: 'primary' | 'secondary' | 'accent' | ColorHex
  opacity: number             // 0-1
  blendMode: BlendMode
  revealOrder: number         // 0-1, 詠唱出現順
  revealEffect: RevealEffect
  transform: LayerTransform
}

export type BlendMode = 'normal' | 'add' | 'screen' | 'multiply'
export type RevealEffect = 'fade' | 'draw' | 'scale' | 'spiral'

export type LayerTransform = {
  radius: number        // 0-1（正規化）
  height: number        // 0-2
  tiltX: number         // rad
  tiltZ: number         // rad
  spinAxis: 'X' | 'Y' | 'Z' | [number, number, number]
  spinSpeed: number     // -2 〜 2
  spinPhase: number     // 0 〜 2π
  curvature: number     // -1 〜 1
}
```

---

## A. 幾何構造

```ts
export type RingLayer = LayerBase & {
  type: 'ring'
  thickness: number       // 0.5-5
  dashed: boolean
  dashGap: number         // 0-1
  double: boolean         // 二重線
}

export type PolygonLayer = LayerBase & {
  type: 'polygon'
  sides: number           // 3-12
  thickness: number
  rounded: boolean        // 角を丸める
}

export type StarPolygonLayer = LayerBase & {
  type: 'starPolygon'
  n: number               // 3-12
  skip: number            // 1〜n/2
  thickness: number
}

export type SpokesLayer = LayerBase & {
  type: 'spokes'
  count: number           // 2-36
  lengthInner: number     // 0-1
  lengthOuter: number     // 0-1
  thickness: number
}

export type CrescentLayer = LayerBase & {
  type: 'crescent'
  phase: number           // 0-1 (0=新月, 0.5=満月)
  arc: number
  thickness: number
  count: number
}

export type VesicaPiscisLayer = LayerBase & {
  type: 'vesicaPiscis'
  overlap: number         // 0-1
  count: number
  rotateStep: number
}

export type SpiralArmLayer = LayerBase & {
  type: 'spiralArm'
  armCount: number        // 1-8
  turns: number
  tightness: number
  direction: 'cw' | 'ccw'
  thickness: number
}

export type ConcentricRingsLayer = LayerBase & {
  type: 'concentricRings'
  ringCount: number       // 2-20
  spacing: number
  thicknessDecay: number
}
```

## B. 神聖幾何学

```ts
export type FlowerOfLifeLayer = LayerBase & {
  type: 'flowerOfLife'
  depth: number           // 1-6
  showSeed: boolean
  showFruit: boolean
}

export type MetatronsCubeLayer = LayerBase & {
  type: 'metatronsCube'
  showLines: boolean
  showCircles: boolean
  scale: number
}

export type SriYantraLayer = LayerBase & {
  type: 'sriYantra'
  precision: number
  showLotus: boolean
  showGates: boolean
}

export type HexagramGridLayer = LayerBase & {
  type: 'hexagramGrid'
  cellCount: number
  showOutline: boolean
  fillAlternate: boolean
}
```

## C. テキスト・文字

```ts
export type RuneBandLayer = LayerBase & {
  type: 'runeBand'
  count: number           // 6-40
  glyphSet: GlyphSetId
  glyphSize: number
  spacing: number
}

export type TextBandLayer = LayerBase & {
  type: 'textBand'
  text: string
  font: string
  fontSize: number
  letterSpacing: number
  reverse: boolean
}

export type SpiralTextLayer = LayerBase & {
  type: 'spiralText'
  text: string
  turns: number
  shrinkRate: number
  startRadius: number
  font: string
}

export type PillarTextLayer = LayerBase & {
  type: 'pillarText'
  texts: string[]
  positions: 4 | 8
  font: string
  fontSize: number
}

export type CipherWheelLayer = LayerBase & {
  type: 'cipherWheel'
  innerAlphabet: string
  outerAlphabet: string
  shift: number
  showArrow: boolean
}
```

## D. シンボル・アイコン

```ts
export type VertexMarksLayer = LayerBase & {
  type: 'vertexMarks'
  shape: 'dot' | 'diamond' | 'cross' | 'star' | 'custom'
  size: number
  hostLayer: string
  customGlyph?: GlyphSetId
}

export type CoreSigilLayer = LayerBase & {
  type: 'coreSigil'
  glyphSet: GlyphSetId
  glyphIndex: number
  size: number
  rotation: number
}

export type ZodiacRingLayer = LayerBase & {
  type: 'zodiacRing'
  showAll: boolean
  highlight: number[]
  size: number
  style: 'outline' | 'filled'
}

export type PlanetarySymbolsLayer = LayerBase & {
  type: 'planetarySymbols'
  planets: string[]
  layout: 'circle' | 'vertices' | 'cardinal'
  size: number
}

export type ElementalTrianglesLayer = LayerBase & {
  type: 'elementalTriangles'
  elements: ('fire' | 'water' | 'air' | 'earth')[]
  size: number
  style: 'filled' | 'outline'
  positions: 'cardinal' | 'vertices'
}

export type MoonPhasesLayer = LayerBase & {
  type: 'moonPhases'
  phaseCount: 4 | 8 | 12
  style: 'realistic' | 'symbolic'
  size: number
}

export type CompassRoseLayer = LayerBase & {
  type: 'compassRose'
  directions: 4 | 8 | 16
  style: 'simple' | 'ornate'
  size: number
}
```

## E. 装飾・ボーダー

```ts
export type DotChainLayer = LayerBase & {
  type: 'dotChain'
  dotCount: number
  sizePattern: 'uniform' | 'alternating' | 'decay'
  gap: number
}

export type WavePatternLayer = LayerBase & {
  type: 'wavePattern'
  waveType: 'sine' | 'sawtooth' | 'triangle'
  frequency: number
  amplitude: number
  thickness: number
}

export type ThornChainLayer = LayerBase & {
  type: 'thornChain'
  thornCount: number
  thornLength: number
  style: 'sharp' | 'curved'
  bilateral: boolean
}

export type KnotworkBorderLayer = LayerBase & {
  type: 'knotworkBorder'
  complexity: number      // 1-5
  bandWidth: number
  crossings: number
}
```

## F. フィル・テクスチャ

```ts
export type FillPatternLayer = LayerBase & {
  type: 'fillPattern'
  pattern: 'grid' | 'radial' | 'concentric' | 'honeycomb'
  density: number
  clip: 'circle' | 'polygon' | 'none'
}

export type CrackLayer = LayerBase & {
  type: 'crack'
  crackCount: number
  depth: number
  branchFactor: number
  spread: number
}
```

## G. エフェクト・パーティクル

```ts
export type AmbientParticlesLayer = LayerBase & {
  type: 'ambientParticles'
  count: number           // 10-500
  speed: number
  sizeRange: [number, number]
  drift: number
}

export type EnergyBeamsLayer = LayerBase & {
  type: 'energyBeams'
  beamCount: number
  length: number
  flickerSpeed: number
  taper: number
}

export type PulseRingsLayer = LayerBase & {
  type: 'pulseRings'
  pulseSpeed: number
  interval: number
  fadeDistance: number
  maxRings: number
}

export type LightningArcsLayer = LayerBase & {
  type: 'lightningArcs'
  arcCount: number
  jaggedness: number
  branchProb: number
  flickerRate: number
}
```

## H. 3D専用

```ts
export type FloatingOrbsLayer = LayerBase & {
  type: 'floatingOrbs'
  count: number
  height: number
  size: number
  pulseSpeed: number
  trailLength: number
}

export type GimbalRingsLayer = LayerBase & {
  type: 'gimbalRings'
  ringCount: number       // 2-4
  tiltAngles: number[]
  spinSpeeds: number[]
  thickness: number
}
```

import { Renderer } from './three/Renderer'
import { PostProcessing } from './three/PostProcessing'
import { RingLayer } from './layers/geometric/RingLayer'
import type { RingParams } from '../store/useSigilStore'

/**
 * SigilEngine — Three.js のライフサイクルを一元管理
 *
 * React 側は canvas 要素を渡すだけ。
 * init → animate loop → dispose の3フェーズ。
 */
export class SigilEngine {
  private renderer: Renderer
  private postProcessing: PostProcessing
  private animationId: number = 0
  private clock = { start: performance.now() }

  // レイヤー
  private rings: [RingLayer, RingLayer, RingLayer]

  // 現在の速度（ストアから同期）
  private speeds: [number, number, number] = [0.5, -0.8, 1.2]

  constructor(canvas: HTMLCanvasElement) {
    // 1) Renderer (Scene + Camera + WebGLRenderer)
    this.renderer = new Renderer(canvas)

    // 2) PostProcessing (Bloom)
    this.postProcessing = new PostProcessing(
      this.renderer.renderer,
      this.renderer.scene,
      this.renderer.camera,
    )

    // 3) レイヤーを作ってシーンに追加
    this.rings = [
      new RingLayer({ radius: 1.8, thickness: 3, color: '#ffffffff' }),
      new RingLayer({ radius: 1.3, thickness: 2, color: '#ffffffff' }),
      new RingLayer({ radius: 0.7, thickness: 4, color: '#ffffffff' }),
    ]

    for (const ring of this.rings) {
      this.renderer.scene.add(ring.group)
    }

    // 4) 初期リサイズ + アニメーション開始
    this.resize()
    this.animate()
  }

  /** ストアの状態を Three.js に反映 */
  updateConfig(
    ringParams: [RingParams, RingParams, RingParams],
    bloomStrength: number,
  ) {
    for (let i = 0; i < 3; i++) {
      const p = ringParams[i]
      this.rings[i].setRadius(p.radius)
      this.rings[i].setThickness(p.thickness)
      this.rings[i].setColor(p.color)
      this.speeds[i] = p.speed
    }
    this.postProcessing.setBloomStrength(bloomStrength)
  }

  /** canvas サイズに合わせてリサイズ */
  resize() {
    const canvas = this.renderer.renderer.domElement
    const parent = canvas.parentElement
    if (!parent) return

    const w = parent.clientWidth
    const h = parent.clientHeight

    this.renderer.resize(w, h)
    this.postProcessing.setSize(w, h)
    for (const ring of this.rings) {
      ring.setResolution(w, h)
    }
  }

  /** アニメーションループ */
  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate)

    const elapsed = (performance.now() - this.clock.start) / 1000

    // 各リングを異なる速度で回転
    this.rings[0].update(elapsed * this.speeds[0])
    this.rings[1].update(elapsed * this.speeds[1])
    this.rings[2].update(elapsed * this.speeds[2])

    // Bloom 付きでレンダリング
    this.postProcessing.render()
  }

  /** クリーンアップ */
  dispose() {
    cancelAnimationFrame(this.animationId)
    for (const ring of this.rings) {
      ring.dispose()
    }
    this.postProcessing.dispose()
    this.renderer.dispose()
  }
}

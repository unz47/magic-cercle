import { Renderer } from './three/Renderer'
import { PostProcessing } from './three/PostProcessing'
import { RingLayer } from './layers/geometric/RingLayer'

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
  private ring1: RingLayer
  private ring2: RingLayer
  private ring3: RingLayer

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
    this.ring1 = new RingLayer({
      radius: 1.8,
      thickness: 3,
      color: '#00ffcc',
    })
    this.ring2 = new RingLayer({
      radius: 1.3,
      thickness: 2,
      color: '#ff44aa',
    })
    this.ring3 = new RingLayer({
      radius: 0.7,
      thickness: 4,
      color: '#4488ff',
    })

    this.renderer.scene.add(this.ring1.group)
    this.renderer.scene.add(this.ring2.group)
    this.renderer.scene.add(this.ring3.group)

    // 4) 初期リサイズ + アニメーション開始
    this.resize()
    this.animate()
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
    this.ring1.setResolution(w, h)
    this.ring2.setResolution(w, h)
    this.ring3.setResolution(w, h)
  }

  /** アニメーションループ */
  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate)

    const elapsed = (performance.now() - this.clock.start) / 1000

    // 各リングを異なる速度で回転
    this.ring1.update(elapsed * 0.5)
    this.ring2.update(elapsed * -0.8)
    this.ring3.update(elapsed * 1.2)

    // Bloom 付きでレンダリング
    this.postProcessing.render()
  }

  /** クリーンアップ */
  dispose() {
    cancelAnimationFrame(this.animationId)
    this.ring1.dispose()
    this.ring2.dispose()
    this.ring3.dispose()
    this.postProcessing.dispose()
    this.renderer.dispose()
  }
}

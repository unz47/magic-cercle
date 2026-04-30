import * as THREE from 'three'
import { Renderer } from './three/Renderer'
import { PostProcessing } from './three/PostProcessing'
import type { ILayer } from './layers/ILayer'
import type { LayerConfig } from '../store/layerConfigs'
import type { GlobalSettings, EffectSettings, ParticleSettings, ParticleKey } from '../store/useSigilStore'
import { createLayer } from './layers/createLayer'
import { ParticleSystem } from './particles/ParticleSystem'

/**
 * SigilEngine — Three.js のライフサイクルを一元管理
 *
 * React 側は canvas 要素を渡すだけ。
 * init → animate loop → dispose の3フェーズ。
 * レイヤーは動的に追加・削除・更新できる。
 */
export class SigilEngine {
  private renderer: Renderer
  private postProcessing: PostProcessing
  private animationId: number = 0
  private clock = { start: performance.now() }

  /** id → { layer, type, speed } */
  private layerMap = new Map<string, { layer: ILayer; type: string; speed: number }>()

  /** パーティクルシステム */
  private particleMap = new Map<ParticleKey, ParticleSystem>()
  private particleSettings: ParticleSettings | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas)
    this.postProcessing = new PostProcessing(
      this.renderer.renderer,
      this.renderer.scene,
      this.renderer.camera,
    )

    this.resize()
    this.animate()
  }

  /** ストアのレイヤー配列を Three.js に同期する */
  syncLayers(configs: LayerConfig[]) {
    const currentIds = new Set(this.layerMap.keys())
    const newIds = new Set(configs.map((c) => c.id))

    // 削除: ストアから消えたレイヤーを除去
    for (const id of currentIds) {
      if (!newIds.has(id)) {
        const entry = this.layerMap.get(id)!
        this.renderer.scene.remove(entry.layer.group)
        entry.layer.dispose()
        this.layerMap.delete(id)
      }
    }

    // 追加 or 更新
    for (const config of configs) {
      const existing = this.layerMap.get(config.id)

      if (!existing || existing.type !== config.type) {
        // 新規作成 or タイプ変更 → 再作成
        if (existing) {
          this.renderer.scene.remove(existing.layer.group)
          existing.layer.dispose()
        }

        const layer = createLayer(config)
        // 現在の解像度を設定
        const canvas = this.renderer.renderer.domElement
        const parent = canvas.parentElement
        if (parent) {
          layer.setResolution(parent.clientWidth, parent.clientHeight)
        }
        layer.group.visible = config.visible
        this.renderer.scene.add(layer.group)
        this.layerMap.set(config.id, {
          layer,
          type: config.type,
          speed: config.speed,
        })
      } else {
        // 既存レイヤーのプロパティ更新
        existing.layer.applyConfig(config as unknown as Record<string, unknown>)
        existing.speed = config.speed
      }

      // 共通パラメータを group に適用
      const entry = this.layerMap.get(config.id)!
      const g = entry.layer.group
      g.visible = config.visible
      g.position.y = config.yOffset
      g.scale.setScalar(config.scale)
      // Z 傾き → Y スピン回転の順で適用（傾いた軸基準で回転させる）
      g.rotation.order = 'ZXY'
      g.rotation.z = (config.rotationOffset * Math.PI) / 180
    }
  }

  /** グローバル設定を反映 */
  syncGlobal(settings: GlobalSettings) {
    this.postProcessing.setBloomStrength(settings.bloomStrength)
    this.renderer.scene.background = new THREE.Color(settings.bgColor)

    // カメラ位置を更新（球面座標 → 直交座標）
    const phi = (settings.cameraAngle * Math.PI) / 180     // 仰角
    const theta = (settings.cameraAzimuth * Math.PI) / 180 // 水平角
    const dist = settings.cameraDistance
    const y = Math.sin(phi) * dist
    const xzDist = Math.cos(phi) * dist
    this.renderer.camera.position.set(
      Math.sin(theta) * xzDist,
      y,
      Math.cos(theta) * xzDist,
    )
    this.renderer.camera.lookAt(0, 0, 0)
  }

  /** エフェクト設定を反映 */
  syncEffects(effects: EffectSettings) {
    this.postProcessing.syncEffects(effects)
  }

  /** パーティクル設定を反映 */
  syncParticles(settings: ParticleSettings) {
    this.particleSettings = settings
    const keys: ParticleKey[] = ['risingSparks', 'dust', 'orbital', 'fireflies', 'energyMist', 'fallingAsh']

    for (const key of keys) {
      const cfg = settings[key]
      const existing = this.particleMap.get(key)

      if (cfg.enabled) {
        if (!existing) {
          // 新規作成
          const ps = new ParticleSystem(key, cfg.count, cfg.size, cfg.color)
          this.renderer.scene.add(ps.group)
          this.particleMap.set(key, ps)
        } else {
          // 設定更新
          existing.applyConfig(cfg)
        }
      } else if (existing) {
        // 無効化 → 削除
        this.renderer.scene.remove(existing.group)
        existing.dispose()
        this.particleMap.delete(key)
      }
    }
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
    for (const { layer } of this.layerMap.values()) {
      layer.setResolution(w, h)
    }
  }

  /** アニメーションループ */
  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate)
    const elapsed = (performance.now() - this.clock.start) / 1000

    for (const { layer, speed } of this.layerMap.values()) {
      layer.update(elapsed * speed)
    }

    // パーティクル更新
    if (this.particleSettings) {
      for (const [key, ps] of this.particleMap) {
        const cfg = this.particleSettings[key]
        const spread = 'spread' in cfg ? (cfg as { spread: number }).spread : 2
        const radius = 'radius' in cfg ? (cfg as { radius: number }).radius : undefined
        ps.update(elapsed, cfg.speed, spread, radius)
      }
    }

    this.postProcessing.render()
  }

  /** クリーンアップ */
  dispose() {
    cancelAnimationFrame(this.animationId)
    for (const { layer } of this.layerMap.values()) {
      layer.dispose()
    }
    this.layerMap.clear()
    for (const ps of this.particleMap.values()) {
      ps.dispose()
    }
    this.particleMap.clear()
    this.postProcessing.dispose()
    this.renderer.dispose()
  }
}

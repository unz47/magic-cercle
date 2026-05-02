import * as THREE from 'three'
import type { ILayer } from '../ILayer'

/**
 * RuneRingLayer — 円弧に沿って文字を配置するレイヤー
 *
 * 2D Canvas でテキストをレンダリング → CanvasTexture として
 * RingGeometry 上に貼り付ける。
 */
export class RuneRingLayer implements ILayer {
  readonly group = new THREE.Group()
  private mesh: THREE.Mesh | null = null
  private material: THREE.MeshBasicMaterial
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  private _text = 'ABCDEFGHIJKLMNOP'
  private _radius = 1.5
  private _fontSize = 28
  private _color = '#ffffff'
  private _font = 'serif'

  private _reverse = false      // 逆方向（時計回り）

  constructor(
    text = 'ABCDEFGHIJKLMNOP',
    radius = 1.5,
    fontSize = 28,
    color = '#ffffff',
    font = 'serif',
  ) {
    this._text = text
    this._radius = radius
    this._fontSize = fontSize
    this._color = color
    this._font = font

    // テクスチャ用 Canvas を作成
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!

    this.material = new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })

    this.rebuild()
  }

  /** Canvas にテキストを円弧状に描画し、テクスチャとして貼り付ける */
  private rebuild() {
    const size = 1024
    this.canvas.width = size
    this.canvas.height = size
    const ctx = this.ctx
    const cx = size / 2
    const cy = size / 2

    // クリア
    ctx.clearRect(0, 0, size, size)

    // フォント設定
    const fontPx = this._fontSize * (size / 256)
    ctx.font = `${fontPx}px ${this._font}`
    ctx.fillStyle = this._color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 円弧に沿って文字を配置
    const text = this._text
    const charCount = text.length
    if (charCount === 0) return

    // テクスチャ上の描画半径（canvas の中心からの距離）
    const drawRadius = (size / 2) * 0.72

    const angleStep = (Math.PI * 2) / charCount
    const direction = this._reverse ? -1 : 1

    for (let i = 0; i < charCount; i++) {
      const angle = i * angleStep * direction - Math.PI / 2
      const x = cx + Math.cos(angle) * drawRadius
      const y = cy + Math.sin(angle) * drawRadius

      ctx.save()
      ctx.translate(x, y)
      // 文字をその位置に合わせて回転（下が外側を向く）
      ctx.rotate(angle + Math.PI / 2)
      ctx.fillText(text[i], 0, 0)
      ctx.restore()
    }

    // テクスチャ更新
    const texture = new THREE.CanvasTexture(this.canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    this.material.map = texture
    this.material.needsUpdate = true

    // 既存メッシュを削除
    if (this.mesh) {
      this.group.remove(this.mesh)
      this.mesh.geometry.dispose()
    }

    // 平面にテクスチャを貼る（XZ 平面に水平配置）
    const planeSize = this._radius * 2.4
    const geo = new THREE.PlaneGeometry(planeSize, planeSize)
    this.mesh = new THREE.Mesh(geo, this.material)
    // XZ 平面に水平に配置（90度回転）
    this.mesh.rotation.x = -Math.PI / 2
    this.group.add(this.mesh)
  }

  applyConfig(c: Record<string, unknown>) {
    let needsRebuild = false

    if (c.text !== undefined && c.text !== this._text) {
      this._text = c.text as string
      needsRebuild = true
    }
    if (c.radius !== undefined && c.radius !== this._radius) {
      this._radius = c.radius as number
      needsRebuild = true
    }
    if (c.fontSize !== undefined && c.fontSize !== this._fontSize) {
      this._fontSize = c.fontSize as number
      needsRebuild = true
    }
    if (c.color !== undefined && c.color !== this._color) {
      this._color = c.color as string
      needsRebuild = true
    }
    if (c.font !== undefined && c.font !== this._font) {
      this._font = c.font as string
      needsRebuild = true
    }
    if (c.reverse !== undefined && c.reverse !== this._reverse) {
      this._reverse = c.reverse as boolean
      needsRebuild = true
    }

    if (needsRebuild) this.rebuild()
  }

  setResolution(_w: number, _h: number) {
    // Canvas テクスチャベースなので特に対応不要
  }

  update(time: number) {
    this.group.rotation.y = time * 0.3
  }

  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose()
    }
    if (this.material.map) {
      this.material.map.dispose()
    }
    this.material.dispose()
  }
}

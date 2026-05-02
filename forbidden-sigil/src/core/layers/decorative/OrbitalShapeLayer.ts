import * as THREE from 'three'
import type { ILayer } from '../ILayer'
import type { LayerConfig, LayerType } from '../../../store/layerConfigs'
import { LAYER_DEFAULTS } from '../../../store/layerConfigs'
import { createLayer } from '../createLayer'

/**
 * OrbitalShapeLayer — 軌道上にサブレイヤーを配置
 *
 * 既存のレイヤータイプ（Ring, Polygon, Star 等）のインスタンスを
 * 指定半径の円軌道上に等間隔で配置する。
 * arcStart / arcEnd で配置範囲を制限可能。
 */
export class OrbitalShapeLayer implements ILayer {
  readonly group = new THREE.Group()
  private subLayers: ILayer[] = []

  private _radius = 1.5
  private _count = 6
  private _shapeType: LayerType = 'ring'
  private _shapeSize = 0.3
  private _arcStart = 0
  private _arcEnd = 1
  private _alignToOrbit = true
  private _color = '#ffffff'
  private _resolution = new THREE.Vector2(1, 1)

  constructor(
    radius = 1.5,
    count = 6,
    shapeType: LayerType = 'ring',
    shapeSize = 0.3,
    _thickness = 2,
    color = '#ffffff',
  ) {
    this._radius = radius
    this._count = count
    this._shapeType = shapeType
    this._shapeSize = shapeSize
    this._color = color
    this.rebuild()
  }

  private rebuild() {
    // 既存サブレイヤーをクリア
    for (const sub of this.subLayers) {
      this.group.remove(sub.group)
      sub.dispose()
    }
    this.subLayers = []

    for (let i = 0; i < this._count; i++) {
      // 軌道上の角度
      const t = this._count === 1
        ? (this._arcStart + this._arcEnd) / 2
        : this._arcStart + (i / this._count) * (this._arcEnd - this._arcStart)
      const angle = t * Math.PI * 2

      // サブレイヤーを生成（デフォルト設定ベース）
      const defaultConfig = LAYER_DEFAULTS[this._shapeType]() as LayerConfig
      ;(defaultConfig as Record<string, unknown>).color = this._color
      // orbitalShape の再帰配置は避ける
      if (this._shapeType === 'orbitalShape') continue
      const sub = createLayer(defaultConfig)

      // 解像度設定
      sub.setResolution(this._resolution.x, this._resolution.y)

      // スケール調整
      sub.group.scale.setScalar(this._shapeSize)

      // 軌道上の位置に配置 (XZ 平面)
      sub.group.position.x = Math.cos(angle) * this._radius
      sub.group.position.z = Math.sin(angle) * this._radius

      // 軌道に沿って回転（Y 軸）
      if (this._alignToOrbit) {
        sub.group.rotation.y = -angle + Math.PI / 2
      }

      this.group.add(sub.group)
      this.subLayers.push(sub)
    }
  }

  applyConfig(c: Record<string, unknown>) {
    let needsRebuild = false

    if (c.radius !== undefined && c.radius !== this._radius) {
      this._radius = c.radius as number; needsRebuild = true
    }
    if (c.count !== undefined && c.count !== this._count) {
      this._count = c.count as number; needsRebuild = true
    }
    if (c.shapeType !== undefined && c.shapeType !== this._shapeType) {
      this._shapeType = c.shapeType as LayerType; needsRebuild = true
    }
    if (c.shapeSize !== undefined && c.shapeSize !== this._shapeSize) {
      this._shapeSize = c.shapeSize as number; needsRebuild = true
    }
    if (c.arcStart !== undefined && c.arcStart !== this._arcStart) {
      this._arcStart = c.arcStart as number; needsRebuild = true
    }
    if (c.arcEnd !== undefined && c.arcEnd !== this._arcEnd) {
      this._arcEnd = c.arcEnd as number; needsRebuild = true
    }
    if (c.alignToOrbit !== undefined && c.alignToOrbit !== this._alignToOrbit) {
      this._alignToOrbit = c.alignToOrbit as boolean; needsRebuild = true
    }
    if (c.color !== undefined && c.color !== this._color) {
      this._color = c.color as string; needsRebuild = true
    }

    if (needsRebuild) this.rebuild()
  }

  setResolution(w: number, h: number) {
    this._resolution.set(w, h)
    for (const sub of this.subLayers) {
      sub.setResolution(w, h)
    }
  }

  update(time: number) {
    this.group.rotation.y = time * 0.3
    // サブレイヤーにも time を渡す（独自アニメーション用）
    for (const sub of this.subLayers) {
      sub.update(time)
    }
  }

  dispose() {
    for (const sub of this.subLayers) {
      sub.dispose()
    }
    this.subLayers = []
  }
}

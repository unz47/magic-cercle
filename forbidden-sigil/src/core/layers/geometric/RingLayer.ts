import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import type { ILayer } from '../ILayer'

const SEGMENTS = 128

/**
 * RingLayer — 円環（破線・二重線対応）
 */
export class RingLayer implements ILayer {
  readonly group = new THREE.Group()
  private lines: Line2[] = []
  private materials: LineMaterial[] = []
  private _radius = 1.5
  private _thickness = 3
  private _color = '#ffffff'
  private _dashed = false
  private _dashScale = 10
  private _double = false
  private _doubleGap = 0.15
  private _resolution = new THREE.Vector2(1, 1)

  constructor(radius = 1.5, thickness = 3, color = '#ffffff') {
    this._radius = radius
    this._thickness = thickness
    this._color = color
    this.rebuild()
  }

  private buildCircle(radius: number): number[] {
    const positions: number[] = []
    for (let i = 0; i <= SEGMENTS; i++) {
      const theta = (i / SEGMENTS) * Math.PI * 2
      positions.push(Math.cos(theta) * radius, 0, Math.sin(theta) * radius)
    }
    return positions
  }

  private rebuild() {
    // 既存を除去
    for (const line of this.lines) {
      this.group.remove(line)
      line.geometry.dispose()
    }
    for (const mat of this.materials) mat.dispose()
    this.lines = []
    this.materials = []

    const radii = this._double
      ? [this._radius - this._doubleGap / 2, this._radius + this._doubleGap / 2]
      : [this._radius]

    for (const r of radii) {
      const mat = new LineMaterial({
        color: new THREE.Color(this._color).getHex(),
        linewidth: this._thickness,
        worldUnits: false,
        alphaToCoverage: true,
        dashed: this._dashed,
        dashScale: this._dashScale,
        dashSize: 1,
        gapSize: 0.5,
      })
      mat.resolution.copy(this._resolution)
      this.materials.push(mat)

      const geo = new LineGeometry()
      geo.setPositions(this.buildCircle(r))
      const line = new Line2(geo, mat)
      line.computeLineDistances()
      this.lines.push(line)
      this.group.add(line)
    }
  }

  applyConfig(c: Record<string, unknown>) {
    let needsRebuild = false

    if (c.radius !== undefined && c.radius !== this._radius) {
      this._radius = c.radius as number; needsRebuild = true
    }
    if (c.dashed !== undefined && c.dashed !== this._dashed) {
      this._dashed = c.dashed as boolean; needsRebuild = true
    }
    if (c.dashScale !== undefined && c.dashScale !== this._dashScale) {
      this._dashScale = c.dashScale as number; needsRebuild = true
    }
    if (c.double !== undefined && c.double !== this._double) {
      this._double = c.double as boolean; needsRebuild = true
    }
    if (c.doubleGap !== undefined && c.doubleGap !== this._doubleGap) {
      this._doubleGap = c.doubleGap as number; needsRebuild = true
    }

    if (needsRebuild) {
      if (c.thickness !== undefined) this._thickness = c.thickness as number
      if (c.color !== undefined) this._color = c.color as string
      this.rebuild()
    } else {
      if (c.thickness !== undefined) {
        this._thickness = c.thickness as number
        for (const mat of this.materials) mat.linewidth = this._thickness
      }
      if (c.color !== undefined) {
        this._color = c.color as string
        for (const mat of this.materials) mat.color.set(this._color)
      }
    }
    if (c.visible !== undefined) this.group.visible = c.visible as boolean
  }

  setResolution(w: number, h: number) {
    this._resolution.set(w, h)
    for (const mat of this.materials) mat.resolution.set(w, h)
  }

  update(time: number) {
    this.group.rotation.y = time * 0.3
  }

  dispose() {
    for (const line of this.lines) line.geometry.dispose()
    for (const mat of this.materials) mat.dispose()
  }
}

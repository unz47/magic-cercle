import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import type { ILayer } from '../ILayer'

const SEGMENTS = 96

/**
 * PulseRingsLayer — 中心から周期的に拡大する衝撃波リング
 */
export class PulseRingsLayer implements ILayer {
  readonly group = new THREE.Group()
  private rings: { line: Line2; material: LineMaterial }[] = []
  private _maxRadius = 2.5
  private _pulseSpeed = 1.0
  private _maxRings = 4
  private _thickness = 2
  private _color = '#ffffff'
  private _resolution = new THREE.Vector2(1, 1)

  constructor(maxRadius = 2.5, pulseSpeed = 1.0, maxRings = 4, thickness = 2, color = '#ffffff') {
    this._maxRadius = maxRadius
    this._pulseSpeed = pulseSpeed
    this._maxRings = maxRings
    this._thickness = thickness
    this._color = color
    this.buildRings()
  }

  private buildCircle(radius: number): number[] {
    const positions: number[] = []
    for (let i = 0; i <= SEGMENTS; i++) {
      const theta = (i / SEGMENTS) * Math.PI * 2
      positions.push(Math.cos(theta) * radius, 0, Math.sin(theta) * radius)
    }
    return positions
  }

  private buildRings() {
    for (const r of this.rings) {
      this.group.remove(r.line)
      r.line.geometry.dispose()
      r.material.dispose()
    }
    this.rings = []

    for (let i = 0; i < this._maxRings; i++) {
      const mat = new LineMaterial({
        color: new THREE.Color(this._color).getHex(),
        linewidth: this._thickness,
        worldUnits: false,
        alphaToCoverage: true,
        transparent: true,
        opacity: 1,
      })
      mat.resolution.copy(this._resolution)
      const geo = new LineGeometry()
      geo.setPositions(this.buildCircle(0.1))
      const line = new Line2(geo, mat)
      line.computeLineDistances()
      this.rings.push({ line, material: mat })
      this.group.add(line)
    }
  }

  applyConfig(c: Record<string, unknown>) {
    let rebuild = false
    if (c.maxRings !== undefined && c.maxRings !== this._maxRings) { this._maxRings = c.maxRings as number; rebuild = true }
    if (rebuild) this.buildRings()
    if (c.maxRadius !== undefined) this._maxRadius = c.maxRadius as number
    if (c.pulseSpeed !== undefined) this._pulseSpeed = c.pulseSpeed as number
    if (c.thickness !== undefined) {
      this._thickness = c.thickness as number
      for (const r of this.rings) r.material.linewidth = this._thickness
    }
    if (c.color !== undefined) {
      this._color = c.color as string
      for (const r of this.rings) r.material.color.set(this._color)
    }
    if (c.visible !== undefined) this.group.visible = c.visible as boolean
  }

  setResolution(w: number, h: number) {
    this._resolution.set(w, h)
    for (const r of this.rings) r.material.resolution.set(w, h)
  }

  update(time: number) {
    const interval = 1 / this._pulseSpeed
    for (let i = 0; i < this.rings.length; i++) {
      const phase = ((time * this._pulseSpeed + i * interval / this.rings.length) % interval) / interval
      const radius = phase * this._maxRadius
      const opacity = 1 - phase

      // ジオメトリ更新
      const r = this.rings[i]
      r.line.geometry.dispose()
      const geo = new LineGeometry()
      geo.setPositions(this.buildCircle(radius))
      r.line.geometry = geo
      r.line.computeLineDistances()
      r.material.opacity = opacity
    }
  }

  dispose() {
    for (const r of this.rings) {
      r.line.geometry.dispose()
      r.material.dispose()
    }
  }
}

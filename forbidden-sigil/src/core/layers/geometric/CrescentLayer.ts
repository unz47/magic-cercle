import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import type { ILayer } from '../ILayer'

const SEGMENTS = 64

/**
 * CrescentLayer — 三日月・弧月形
 *
 * 円弧を描き、count個を等間隔に配置する。
 */
export class CrescentLayer implements ILayer {
  readonly group = new THREE.Group()
  private lines: Line2[] = []
  private material: LineMaterial
  private _radius = 1.5
  private _arc = 0.3       // 弧の長さ（0〜1、1=全円）
  private _count = 2
  private _thickness = 3

  constructor(radius = 1.5, arc = 0.3, count = 2, thickness = 3, color = '#ffffff') {
    this._radius = radius
    this._arc = arc
    this._count = count
    this._thickness = thickness

    this.material = new LineMaterial({
      color: new THREE.Color(color).getHex(),
      linewidth: thickness,
      worldUnits: false,
      alphaToCoverage: true,
    })
    this.buildArcs()
  }

  private buildArcs() {
    for (const line of this.lines) {
      this.group.remove(line)
      line.geometry.dispose()
    }
    this.lines = []

    for (let c = 0; c < this._count; c++) {
      const baseAngle = (c / this._count) * Math.PI * 2
      const arcLength = this._arc * Math.PI * 2
      const startAngle = baseAngle - arcLength / 2
      const positions: number[] = []

      for (let i = 0; i <= SEGMENTS; i++) {
        const t = i / SEGMENTS
        const theta = startAngle + t * arcLength
        positions.push(
          Math.cos(theta) * this._radius,
          0,
          Math.sin(theta) * this._radius,
        )
      }

      const geo = new LineGeometry()
      geo.setPositions(positions)
      const line = new Line2(geo, this.material)
      line.computeLineDistances()
      this.lines.push(line)
      this.group.add(line)
    }
  }

  applyConfig(c: Record<string, unknown>) {
    let rebuild = false
    if (c.radius !== undefined && c.radius !== this._radius) { this._radius = c.radius as number; rebuild = true }
    if (c.arc !== undefined && c.arc !== this._arc) { this._arc = c.arc as number; rebuild = true }
    if (c.count !== undefined && c.count !== this._count) { this._count = c.count as number; rebuild = true }
    if (rebuild) this.buildArcs()
    if (c.thickness !== undefined) { this._thickness = c.thickness as number; this.material.linewidth = this._thickness }
    if (c.color !== undefined) this.material.color.set(c.color as string)
    if (c.visible !== undefined) this.group.visible = c.visible as boolean
  }

  setResolution(w: number, h: number) { this.material.resolution.set(w, h) }
  update(time: number) { this.group.rotation.y = time * 0.3 }

  dispose() {
    for (const line of this.lines) line.geometry.dispose()
    this.material.dispose()
  }
}

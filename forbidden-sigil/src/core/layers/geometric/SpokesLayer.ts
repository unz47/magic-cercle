import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import type { ILayer } from '../ILayer'

/**
 * SpokesLayer — 中心から放射する直線群
 *
 * 各スポークは innerRadius → outerRadius の線分。
 * count 本を等間隔に配置する。
 */
export class SpokesLayer implements ILayer {
  readonly group = new THREE.Group()
  private lines: Line2[] = []
  private material: LineMaterial
  private _count: number
  private _innerRadius: number
  private _outerRadius: number

  constructor(
    count = 8,
    innerRadius = 0.3,
    outerRadius = 1.8,
    thickness = 1,
    color = '#ffffff',
  ) {
    this._count = count
    this._innerRadius = innerRadius
    this._outerRadius = outerRadius

    this.material = new LineMaterial({
      color: new THREE.Color(color).getHex(),
      linewidth: thickness,
      worldUnits: false,
      alphaToCoverage: true,
    })

    this.buildLines()
  }

  private buildLines() {
    // 既存のラインを除去
    for (const line of this.lines) {
      this.group.remove(line)
      line.geometry.dispose()
    }
    this.lines = []

    for (let i = 0; i < this._count; i++) {
      const theta = (i / this._count) * Math.PI * 2
      const cos = Math.cos(theta)
      const sin = Math.sin(theta)

      const positions = [
        cos * this._innerRadius, 0, sin * this._innerRadius,
        cos * this._outerRadius, 0, sin * this._outerRadius,
      ]

      const geometry = new LineGeometry()
      geometry.setPositions(positions)
      const line = new Line2(geometry, this.material)
      line.computeLineDistances()
      this.lines.push(line)
      this.group.add(line)
    }
  }

  applyConfig(c: Record<string, unknown>) {
    let needsRebuild = false
    if (c.count !== undefined && c.count !== this._count) {
      this._count = c.count as number
      needsRebuild = true
    }
    if (c.innerRadius !== undefined && c.innerRadius !== this._innerRadius) {
      this._innerRadius = c.innerRadius as number
      needsRebuild = true
    }
    if (c.outerRadius !== undefined && c.outerRadius !== this._outerRadius) {
      this._outerRadius = c.outerRadius as number
      needsRebuild = true
    }
    if (needsRebuild) this.buildLines()
    if (c.thickness !== undefined) this.material.linewidth = c.thickness as number
    if (c.color !== undefined) this.material.color.set(c.color as string)
    if (c.visible !== undefined) this.group.visible = c.visible as boolean
  }

  setResolution(w: number, h: number) {
    this.material.resolution.set(w, h)
  }

  update(time: number) {
    this.group.rotation.y = time * 0.3
  }

  dispose() {
    for (const line of this.lines) {
      line.geometry.dispose()
    }
    this.material.dispose()
  }
}

import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import type { ILayer } from '../ILayer'

const SEGMENTS = 128

/**
 * ConcentricRingsLayer — 等間隔の多重同心円を一括生成
 *
 * innerRadius から outerRadius まで ringCount 本の円を描く。
 */
export class ConcentricRingsLayer implements ILayer {
  readonly group = new THREE.Group()
  private lines: Line2[] = []
  private material: LineMaterial
  private _ringCount: number
  private _innerRadius: number
  private _outerRadius: number

  constructor(
    ringCount = 5,
    innerRadius = 0.5,
    outerRadius = 2.0,
    thickness = 1,
    color = '#ffffff',
  ) {
    this._ringCount = ringCount
    this._innerRadius = innerRadius
    this._outerRadius = outerRadius

    this.material = new LineMaterial({
      color: new THREE.Color(color).getHex(),
      linewidth: thickness,
      worldUnits: false,
      alphaToCoverage: true,
    })

    this.buildRings()
  }

  private buildCircle(radius: number): number[] {
    const positions: number[] = []
    for (let i = 0; i <= SEGMENTS; i++) {
      const theta = (i / SEGMENTS) * Math.PI * 2
      positions.push(
        Math.cos(theta) * radius,
        0,
        Math.sin(theta) * radius,
      )
    }
    return positions
  }

  private buildRings() {
    // 既存を除去
    for (const line of this.lines) {
      this.group.remove(line)
      line.geometry.dispose()
    }
    this.lines = []

    for (let i = 0; i < this._ringCount; i++) {
      const t = this._ringCount === 1 ? 0.5 : i / (this._ringCount - 1)
      const radius = this._innerRadius + (this._outerRadius - this._innerRadius) * t

      const geometry = new LineGeometry()
      geometry.setPositions(this.buildCircle(radius))
      const line = new Line2(geometry, this.material)
      line.computeLineDistances()
      this.lines.push(line)
      this.group.add(line)
    }
  }

  applyConfig(c: Record<string, unknown>) {
    let needsRebuild = false
    if (c.ringCount !== undefined && c.ringCount !== this._ringCount) {
      this._ringCount = c.ringCount as number
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
    if (needsRebuild) this.buildRings()
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

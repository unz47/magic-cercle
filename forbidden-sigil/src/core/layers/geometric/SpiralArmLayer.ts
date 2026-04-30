import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import type { ILayer } from '../ILayer'

const SEGMENTS_PER_ARM = 128

/**
 * SpiralArmLayer — アルキメデス/対数螺旋の腕
 */
export class SpiralArmLayer implements ILayer {
  readonly group = new THREE.Group()
  private lines: Line2[] = []
  private material: LineMaterial
  private _armCount = 2
  private _turns = 1.5
  private _innerRadius = 0.3
  private _outerRadius = 2.0
  private _logarithmic = false

  constructor(armCount = 2, turns = 1.5, innerRadius = 0.3, outerRadius = 2.0, thickness = 2, color = '#ffffff') {
    this._armCount = armCount
    this._turns = turns
    this._innerRadius = innerRadius
    this._outerRadius = outerRadius

    this.material = new LineMaterial({
      color: new THREE.Color(color).getHex(),
      linewidth: thickness,
      worldUnits: false,
      alphaToCoverage: true,
    })
    this.rebuild()
  }

  private rebuild() {
    for (const line of this.lines) { this.group.remove(line); line.geometry.dispose() }
    this.lines = []

    for (let a = 0; a < this._armCount; a++) {
      const baseAngle = (a / this._armCount) * Math.PI * 2
      const positions: number[] = []

      for (let i = 0; i <= SEGMENTS_PER_ARM; i++) {
        const t = i / SEGMENTS_PER_ARM
        const angle = baseAngle + t * this._turns * Math.PI * 2

        let r: number
        if (this._logarithmic) {
          r = this._innerRadius * Math.pow(this._outerRadius / this._innerRadius, t)
        } else {
          r = this._innerRadius + (this._outerRadius - this._innerRadius) * t
        }

        positions.push(Math.cos(angle) * r, 0, Math.sin(angle) * r)
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
    if (c.armCount !== undefined && c.armCount !== this._armCount) { this._armCount = c.armCount as number; rebuild = true }
    if (c.turns !== undefined && c.turns !== this._turns) { this._turns = c.turns as number; rebuild = true }
    if (c.innerRadius !== undefined && c.innerRadius !== this._innerRadius) { this._innerRadius = c.innerRadius as number; rebuild = true }
    if (c.outerRadius !== undefined && c.outerRadius !== this._outerRadius) { this._outerRadius = c.outerRadius as number; rebuild = true }
    if (c.logarithmic !== undefined && c.logarithmic !== this._logarithmic) { this._logarithmic = c.logarithmic as boolean; rebuild = true }
    if (rebuild) this.rebuild()
    if (c.thickness !== undefined) this.material.linewidth = c.thickness as number
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

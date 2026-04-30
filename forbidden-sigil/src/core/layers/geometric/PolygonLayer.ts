import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import type { ILayer } from '../ILayer'

/**
 * PolygonLayer — 正N角形（三角〜十二角形）
 */
export class PolygonLayer implements ILayer {
  readonly group = new THREE.Group()
  private line: Line2
  private material: LineMaterial
  private _sides: number
  private _radius: number

  constructor(sides = 6, radius = 1.5, thickness = 3, color = '#ffffff') {
    this._sides = sides
    this._radius = radius

    const geometry = new LineGeometry()
    geometry.setPositions(this.buildPositions())

    this.material = new LineMaterial({
      color: new THREE.Color(color).getHex(),
      linewidth: thickness,
      worldUnits: false,
      alphaToCoverage: true,
    })

    this.line = new Line2(geometry, this.material)
    this.line.computeLineDistances()
    this.group.add(this.line)
  }

  private buildPositions(): number[] {
    const positions: number[] = []
    for (let i = 0; i <= this._sides; i++) {
      const theta = (i / this._sides) * Math.PI * 2 - Math.PI / 2
      positions.push(
        Math.cos(theta) * this._radius,
        0,
        Math.sin(theta) * this._radius,
      )
    }
    return positions
  }

  private rebuildGeometry() {
    this.line.geometry.dispose()
    const g = new LineGeometry()
    g.setPositions(this.buildPositions())
    this.line.geometry = g
    this.line.computeLineDistances()
  }

  applyConfig(c: Record<string, unknown>) {
    let needsRebuild = false
    if (c.sides !== undefined && c.sides !== this._sides) {
      this._sides = c.sides as number
      needsRebuild = true
    }
    if (c.radius !== undefined && c.radius !== this._radius) {
      this._radius = c.radius as number
      needsRebuild = true
    }
    if (needsRebuild) this.rebuildGeometry()
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
    this.line.geometry.dispose()
    this.material.dispose()
  }
}

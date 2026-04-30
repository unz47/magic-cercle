import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import type { ILayer } from '../ILayer'

/**
 * StarPolygonLayer — 星型多角形 {n/skip}
 *
 * n個の頂点を等間隔に配置し、skip個飛ばしで結ぶ。
 * 例: {5/2} = 五芒星、{6/2} = 六芒星（ダビデの星）
 */
export class StarPolygonLayer implements ILayer {
  readonly group = new THREE.Group()
  private line: Line2
  private material: LineMaterial
  private _points: number
  private _skip: number
  private _radius: number

  constructor(points = 5, skip = 2, radius = 1.5, thickness = 2, color = '#ffffff') {
    this._points = points
    this._skip = skip
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
    const n = this._points
    const skip = this._skip

    // skip飛ばしで頂点を巡回
    let current = 0
    for (let i = 0; i <= n; i++) {
      const idx = (current + i * skip) % n
      const theta = (idx / n) * Math.PI * 2 - Math.PI / 2
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
    if (c.points !== undefined && c.points !== this._points) {
      this._points = c.points as number
      needsRebuild = true
    }
    if (c.skip !== undefined && c.skip !== this._skip) {
      this._skip = c.skip as number
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

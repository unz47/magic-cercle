import * as THREE from 'three'
import type { ILayer } from '../ILayer'

/**
 * VertexMarksLayer — 正N角形の頂点に装飾マークを配置
 *
 * Mesh で小さな形状を各頂点に置く。
 */
export class VertexMarksLayer implements ILayer {
  readonly group = new THREE.Group()
  private meshes: THREE.Mesh[] = []
  private material: THREE.MeshBasicMaterial
  private _vertices: number
  private _radius: number
  private _markSize: number
  private _markShape: string

  constructor(
    vertices = 6,
    radius = 1.5,
    markSize = 0.08,
    markShape = 'dot',
    color = '#ffffff',
  ) {
    this._vertices = vertices
    this._radius = radius
    this._markSize = markSize
    this._markShape = markShape

    this.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) })
    this.buildMarks()
  }

  private createGeometry(): THREE.BufferGeometry {
    switch (this._markShape) {
      case 'diamond': {
        const shape = new THREE.Shape()
        const s = this._markSize
        shape.moveTo(0, s)
        shape.lineTo(s, 0)
        shape.lineTo(0, -s)
        shape.lineTo(-s, 0)
        shape.closePath()
        return new THREE.ShapeGeometry(shape)
      }
      case 'cross': {
        const s = this._markSize
        const t = s * 0.3
        const shape = new THREE.Shape()
        shape.moveTo(-t, s); shape.lineTo(t, s); shape.lineTo(t, t)
        shape.lineTo(s, t); shape.lineTo(s, -t); shape.lineTo(t, -t)
        shape.lineTo(t, -s); shape.lineTo(-t, -s); shape.lineTo(-t, -t)
        shape.lineTo(-s, -t); shape.lineTo(-s, t); shape.lineTo(-t, t)
        shape.closePath()
        return new THREE.ShapeGeometry(shape)
      }
      case 'star': {
        const shape = new THREE.Shape()
        const s = this._markSize
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? s : s * 0.4
          const angle = (i / 10) * Math.PI * 2 - Math.PI / 2
          const x = Math.cos(angle) * r
          const y = Math.sin(angle) * r
          if (i === 0) shape.moveTo(x, y)
          else shape.lineTo(x, y)
        }
        shape.closePath()
        return new THREE.ShapeGeometry(shape)
      }
      case 'dot':
      default:
        return new THREE.CircleGeometry(this._markSize, 16)
    }
  }

  private buildMarks() {
    // 既存を除去
    for (const mesh of this.meshes) {
      this.group.remove(mesh)
      mesh.geometry.dispose()
    }
    this.meshes = []

    const geom = this.createGeometry()

    for (let i = 0; i < this._vertices; i++) {
      const theta = (i / this._vertices) * Math.PI * 2 - Math.PI / 2
      const mesh = new THREE.Mesh(geom, this.material)
      // XZ平面に配置、Xが正面を向くように回転
      mesh.position.set(
        Math.cos(theta) * this._radius,
        0,
        Math.sin(theta) * this._radius,
      )
      mesh.rotation.x = -Math.PI / 2 // XZ平面に寝かせる
      this.meshes.push(mesh)
      this.group.add(mesh)
    }
  }

  applyConfig(c: Record<string, unknown>) {
    let needsRebuild = false
    if (c.vertices !== undefined && c.vertices !== this._vertices) {
      this._vertices = c.vertices as number; needsRebuild = true
    }
    if (c.radius !== undefined && c.radius !== this._radius) {
      this._radius = c.radius as number; needsRebuild = true
    }
    if (c.markSize !== undefined && c.markSize !== this._markSize) {
      this._markSize = c.markSize as number; needsRebuild = true
    }
    if (c.markShape !== undefined && c.markShape !== this._markShape) {
      this._markShape = c.markShape as string; needsRebuild = true
    }
    if (needsRebuild) this.buildMarks()
    if (c.color !== undefined) this.material.color.set(c.color as string)
    if (c.visible !== undefined) this.group.visible = c.visible as boolean
  }

  setResolution(_w: number, _h: number) {
    // Mesh ベースなので不要
  }

  update(time: number) {
    this.group.rotation.y = time * 0.3
  }

  dispose() {
    for (const mesh of this.meshes) mesh.geometry.dispose()
    this.material.dispose()
  }
}

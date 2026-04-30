import * as THREE from 'three'
import type { ILayer } from '../ILayer'

/**
 * DotChainLayer — 円周上に大小ドットを連ねる数珠ボーダー
 */
export class DotChainLayer implements ILayer {
  readonly group = new THREE.Group()
  private meshes: THREE.Mesh[] = []
  private material: THREE.MeshBasicMaterial
  private _dotCount = 24
  private _radius = 1.5
  private _dotSize = 0.04
  private _alternating = true // 大小交互

  constructor(dotCount = 24, radius = 1.5, dotSize = 0.04, alternating = true, color = '#ffffff') {
    this._dotCount = dotCount
    this._radius = radius
    this._dotSize = dotSize
    this._alternating = alternating
    this.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) })
    this.buildDots()
  }

  private buildDots() {
    for (const m of this.meshes) { this.group.remove(m); m.geometry.dispose() }
    this.meshes = []

    for (let i = 0; i < this._dotCount; i++) {
      const theta = (i / this._dotCount) * Math.PI * 2
      const size = this._alternating && i % 2 === 1 ? this._dotSize * 0.5 : this._dotSize
      const geo = new THREE.CircleGeometry(size, 12)
      const mesh = new THREE.Mesh(geo, this.material)
      mesh.position.set(Math.cos(theta) * this._radius, 0, Math.sin(theta) * this._radius)
      mesh.rotation.x = -Math.PI / 2
      this.meshes.push(mesh)
      this.group.add(mesh)
    }
  }

  applyConfig(c: Record<string, unknown>) {
    let rebuild = false
    if (c.dotCount !== undefined && c.dotCount !== this._dotCount) { this._dotCount = c.dotCount as number; rebuild = true }
    if (c.radius !== undefined && c.radius !== this._radius) { this._radius = c.radius as number; rebuild = true }
    if (c.dotSize !== undefined && c.dotSize !== this._dotSize) { this._dotSize = c.dotSize as number; rebuild = true }
    if (c.alternating !== undefined && c.alternating !== this._alternating) { this._alternating = c.alternating as boolean; rebuild = true }
    if (rebuild) this.buildDots()
    if (c.color !== undefined) this.material.color.set(c.color as string)
    if (c.visible !== undefined) this.group.visible = c.visible as boolean
  }

  setResolution() {}
  update(time: number) { this.group.rotation.y = time * 0.3 }

  dispose() {
    for (const m of this.meshes) m.geometry.dispose()
    this.material.dispose()
  }
}

import * as THREE from 'three'
import type { ILayer } from '../ILayer'

/**
 * FloatingOrbsLayer — 頂点上空に浮遊する光球
 *
 * SphereGeometry + Additive blending で光る球を配置。
 */
export class FloatingOrbsLayer implements ILayer {
  readonly group = new THREE.Group()
  private orbs: THREE.Mesh[] = []
  private material: THREE.MeshBasicMaterial
  private _count = 6
  private _radius = 1.5
  private _height = 0.5
  private _orbSize = 0.06
  private _pulseSpeed = 1.0

  constructor(count = 6, radius = 1.5, height = 0.5, orbSize = 0.06, color = '#ffffff') {
    this._count = count
    this._radius = radius
    this._height = height
    this._orbSize = orbSize

    this.material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.buildOrbs()
  }

  private buildOrbs() {
    for (const orb of this.orbs) { this.group.remove(orb); orb.geometry.dispose() }
    this.orbs = []

    const geo = new THREE.SphereGeometry(this._orbSize, 12, 12)
    for (let i = 0; i < this._count; i++) {
      const theta = (i / this._count) * Math.PI * 2
      const orb = new THREE.Mesh(geo, this.material)
      orb.position.set(
        Math.cos(theta) * this._radius,
        this._height,
        Math.sin(theta) * this._radius,
      )
      this.orbs.push(orb)
      this.group.add(orb)
    }
  }

  applyConfig(c: Record<string, unknown>) {
    let rebuild = false
    if (c.count !== undefined && c.count !== this._count) { this._count = c.count as number; rebuild = true }
    if (c.radius !== undefined && c.radius !== this._radius) { this._radius = c.radius as number; rebuild = true }
    if (c.height !== undefined && c.height !== this._height) { this._height = c.height as number; rebuild = true }
    if (c.orbSize !== undefined && c.orbSize !== this._orbSize) { this._orbSize = c.orbSize as number; rebuild = true }
    if (rebuild) this.buildOrbs()
    if (c.pulseSpeed !== undefined) this._pulseSpeed = c.pulseSpeed as number
    if (c.color !== undefined) this.material.color.set(c.color as string)
    if (c.visible !== undefined) this.group.visible = c.visible as boolean
  }

  setResolution() {}

  update(time: number) {
    this.group.rotation.y = time * 0.3
    // 各 orb を上下に脈動
    for (let i = 0; i < this.orbs.length; i++) {
      const phase = (i / this.orbs.length) * Math.PI * 2
      this.orbs[i].position.y = this._height + Math.sin(time * this._pulseSpeed + phase) * 0.15
      const scale = 1 + Math.sin(time * this._pulseSpeed * 2 + phase) * 0.3
      this.orbs[i].scale.setScalar(scale)
    }
  }

  dispose() {
    for (const orb of this.orbs) orb.geometry.dispose()
    this.material.dispose()
  }
}

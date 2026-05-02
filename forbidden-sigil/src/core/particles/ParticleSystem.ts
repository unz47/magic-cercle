import * as THREE from 'three'
import type { ParticleKey } from '../../store/useSigilStore'
import { particleVertexShader, particleFragmentShader } from './particleShader'

/** ParticleKey → シェーダー内 uType int マッピング */
const TYPE_INDEX: Record<ParticleKey, number> = {
  risingSparks: 0,
  dust: 1,
  orbital: 2,
  fireflies: 3,
  energyMist: 4,
  fallingAsh: 5,
}

/**
 * ParticleSystem — GPU 駆動のパーティクルシステム
 *
 * カスタム ShaderMaterial + per-particle attribute(aRandom) で
 * 全演算を GPU 側で行う。CPU は time uniform の更新のみ。
 */
export class ParticleSystem {
  readonly group = new THREE.Group()
  private points: THREE.Points | null = null
  private material: THREE.ShaderMaterial
  private _count = 0
  constructor(type: ParticleKey, count: number, size: number, color: string) {

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime:     { value: 0 },
        uSpeed:    { value: 1 },
        uSpread:   { value: 2.5 },
        uRadius:   { value: 1.8 },
        uBaseSize: { value: size },
        uColor:    { value: new THREE.Color(color) },
        uType:     { value: TYPE_INDEX[type] },
      },
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    this.build(count)
  }

  private build(count: number) {
    if (this.points) {
      this.group.remove(this.points)
      this.points.geometry.dispose()
    }
    this._count = count

    // 位置は (0,0,0) — シェーダーが計算する
    const positions = new Float32Array(count * 3)

    // per-particle ランダム属性: (seed, phaseOffset, colorVariation, sizeVariation)
    const randoms = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      const i4 = i * 4
      randoms[i4]     = Math.random()                          // seed 0..1
      randoms[i4 + 1] = Math.random()                          // phase 0..1
      randoms[i4 + 2] = (Math.random() - 0.5) * 2             // colorVar -1..1
      randoms[i4 + 3] = 0.5 + Math.random()                   // sizeVar 0.5..1.5
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 4))

    this.points = new THREE.Points(geo, this.material)
    this.points.frustumCulled = false  // パーティクルは常に描画
    this.group.add(this.points)
  }

  applyConfig(config: { count: number; size: number; color: string; speed?: number; spread?: number; radius?: number }) {
    if (config.count !== this._count) this.build(config.count)
    this.material.uniforms.uBaseSize.value = config.size
    this.material.uniforms.uColor.value.set(config.color)
    if (config.speed !== undefined) this.material.uniforms.uSpeed.value = config.speed
    if (config.spread !== undefined) this.material.uniforms.uSpread.value = config.spread
    if (config.radius !== undefined) this.material.uniforms.uRadius.value = config.radius
  }

  /** 毎フレーム呼ばれる — time だけ更新すればOK (GPU が全計算) */
  update(time: number, speed: number, spread: number, radius?: number) {
    this.material.uniforms.uTime.value = time
    this.material.uniforms.uSpeed.value = speed
    this.material.uniforms.uSpread.value = spread
    if (radius !== undefined) this.material.uniforms.uRadius.value = radius
  }

  dispose() {
    if (this.points) {
      this.points.geometry.dispose()
    }
    this.material.dispose()
  }
}

import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import type { ILayer } from '../ILayer'

const SEGMENTS = 256

type WaveType = 'sine' | 'sawtooth' | 'triangle'

/**
 * WavePatternLayer — 円周に沿った波形ボーダー
 */
export class WavePatternLayer implements ILayer {
  readonly group = new THREE.Group()
  private line!: Line2
  private material: LineMaterial
  private _radius = 1.5
  private _frequency = 12
  private _amplitude = 0.15
  private _waveType: WaveType = 'sine'

  constructor(radius = 1.5, frequency = 12, amplitude = 0.15, waveType: WaveType = 'sine', thickness = 2, color = '#ffffff') {
    this._radius = radius
    this._frequency = frequency
    this._amplitude = amplitude
    this._waveType = waveType

    this.material = new LineMaterial({
      color: new THREE.Color(color).getHex(),
      linewidth: thickness,
      worldUnits: false,
      alphaToCoverage: true,
    })
    this.rebuild()
  }

  private waveValue(t: number): number {
    const phase = t * this._frequency * Math.PI * 2
    switch (this._waveType) {
      case 'sine': return Math.sin(phase)
      case 'sawtooth': return 2 * ((phase / (Math.PI * 2)) % 1) - 1
      case 'triangle': return 2 * Math.abs(2 * ((phase / (Math.PI * 2)) % 1) - 1) - 1
    }
  }

  private rebuild() {
    if (this.line) { this.group.remove(this.line); this.line.geometry.dispose() }

    const positions: number[] = []
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS
      const theta = t * Math.PI * 2
      const wave = this.waveValue(t) * this._amplitude
      const r = this._radius + wave
      positions.push(Math.cos(theta) * r, 0, Math.sin(theta) * r)
    }

    const geo = new LineGeometry()
    geo.setPositions(positions)
    this.line = new Line2(geo, this.material)
    this.line.computeLineDistances()
    this.group.add(this.line)
  }

  applyConfig(c: Record<string, unknown>) {
    let rebuild = false
    if (c.radius !== undefined && c.radius !== this._radius) { this._radius = c.radius as number; rebuild = true }
    if (c.frequency !== undefined && c.frequency !== this._frequency) { this._frequency = c.frequency as number; rebuild = true }
    if (c.amplitude !== undefined && c.amplitude !== this._amplitude) { this._amplitude = c.amplitude as number; rebuild = true }
    if (c.waveType !== undefined && c.waveType !== this._waveType) { this._waveType = c.waveType as WaveType; rebuild = true }
    if (rebuild) this.rebuild()
    if (c.thickness !== undefined) this.material.linewidth = c.thickness as number
    if (c.color !== undefined) this.material.color.set(c.color as string)
    if (c.visible !== undefined) this.group.visible = c.visible as boolean
  }

  setResolution(w: number, h: number) { this.material.resolution.set(w, h) }
  update(time: number) { this.group.rotation.y = time * 0.3 }

  dispose() {
    this.line.geometry.dispose()
    this.material.dispose()
  }
}

import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'

export interface RingConfig {
  radius: number      // 0.5 〜 3
  thickness: number   // 1 〜 8 (px)
  color: string       // hex e.g. '#00ffcc'
  segments: number    // 円の分割数（64で十分滑らか）
}

const DEFAULT_RING: RingConfig = {
  radius: 1.5,
  thickness: 3,
  color: '#00ffcc',
  segments: 128,
}

/**
 * RingLayer — Line2 で太線の円を描画する
 *
 * Three.js 標準の LineBasicMaterial は太さ1px固定なので、
 * Line2 (LineMaterial) を使って太い線を描く。
 */
export class RingLayer {
  readonly group: THREE.Group
  private line: Line2
  private material: LineMaterial
  private config: RingConfig

  constructor(config: Partial<RingConfig> = {}) {
    this.config = { ...DEFAULT_RING, ...config }
    this.group = new THREE.Group()

    // 円の頂点を生成
    const positions = this.createCirclePositions()

    // LineGeometry
    const geometry = new LineGeometry()
    geometry.setPositions(positions)

    // LineMaterial — 太線 + emissive な見た目
    this.material = new LineMaterial({
      color: new THREE.Color(this.config.color).getHex(),
      linewidth: this.config.thickness,
      worldUnits: false, // スクリーンスペース（px単位）
      alphaToCoverage: true,
    })

    this.line = new Line2(geometry, this.material)
    this.line.computeLineDistances()
    this.group.add(this.line)
  }

  /** 円周上の点を flat array [x,y,z, x,y,z, ...] で返す */
  private createCirclePositions(): number[] {
    const { radius, segments } = this.config
    const positions: number[] = []

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2
      positions.push(
        Math.cos(theta) * radius,
        0,  // Y=0 平面上に描画
        Math.sin(theta) * radius,
      )
    }

    return positions
  }

  /** 解像度変更時に呼ぶ（LineMaterial が内部で解像度を使う） */
  setResolution(width: number, height: number) {
    this.material.resolution.set(width, height)
  }

  /** フレームごとに呼ばれる（回転アニメーション） */
  update(time: number) {
    this.group.rotation.y = time * 0.3
  }

  dispose() {
    this.line.geometry.dispose()
    this.material.dispose()
  }
}

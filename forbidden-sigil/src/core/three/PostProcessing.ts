import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

export class PostProcessing {
  readonly composer: EffectComposer
  private bloomPass: UnrealBloomPass

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
  ) {
    this.composer = new EffectComposer(renderer)

    // 1) 通常レンダリング
    const renderPass = new RenderPass(scene, camera)
    this.composer.addPass(renderPass)

    // 2) Bloom — 魔法陣の光を滲ませる
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.3,   // strength — グロー強度
      0.4,   // radius — グロー半径
      0.1,   // threshold — 光る閾値（低いほど全体が光る）
    )
    this.composer.addPass(this.bloomPass)

    // 3) 色空間変換（sRGB出力）
    const outputPass = new OutputPass()
    this.composer.addPass(outputPass)
  }

  setSize(width: number, height: number) {
    this.composer.setSize(width, height)
  }

  /** Bloom 強度を変更 (0〜2) */
  setBloomStrength(value: number) {
    this.bloomPass.strength = value
  }

  render() {
    this.composer.render()
  }

  dispose() {
    this.composer.dispose()
  }
}

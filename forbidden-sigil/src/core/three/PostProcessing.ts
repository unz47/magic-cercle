import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { VignetteShader } from './shaders/VignetteShader'
import { ChromaticShader } from './shaders/ChromaticShader'
import { ScanLinesShader } from './shaders/ScanLinesShader'
import { NoiseShader } from './shaders/NoiseShader'
import type { EffectSettings } from '../../store/useSigilStore'

export class PostProcessing {
  readonly composer: EffectComposer
  private bloomPass: UnrealBloomPass
  private vignettePass: ShaderPass
  private chromaticPass: ShaderPass
  private scanLinesPass: ShaderPass
  private noisePass: ShaderPass
  private outputPass: OutputPass

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
      0.3,   // strength
      0.4,   // radius
      0.1,   // threshold
    )
    this.composer.addPass(this.bloomPass)

    // 3) エフェクトパス（初期状態は無効）
    this.chromaticPass = new ShaderPass(ChromaticShader)
    this.chromaticPass.enabled = false
    this.composer.addPass(this.chromaticPass)

    this.scanLinesPass = new ShaderPass(ScanLinesShader)
    this.scanLinesPass.enabled = false
    this.composer.addPass(this.scanLinesPass)

    this.noisePass = new ShaderPass(NoiseShader)
    this.noisePass.enabled = false
    this.composer.addPass(this.noisePass)

    this.vignettePass = new ShaderPass(VignetteShader)
    this.vignettePass.enabled = false
    this.composer.addPass(this.vignettePass)

    // 4) 色空間変換（sRGB出力） — 常に最後
    this.outputPass = new OutputPass()
    this.composer.addPass(this.outputPass)
  }

  setSize(width: number, height: number) {
    this.composer.setSize(width, height)
    this.scanLinesPass.uniforms['resolution'].value = height
  }

  /** Bloom 強度を変更 */
  setBloomStrength(value: number) {
    this.bloomPass.strength = value
  }

  /** エフェクト設定を同期 */
  syncEffects(effects: EffectSettings) {
    // Vignette
    this.vignettePass.enabled = effects.vignette.enabled
    this.vignettePass.uniforms['intensity'].value = effects.vignette.intensity

    // Chromatic Aberration
    this.chromaticPass.enabled = effects.chromatic.enabled
    this.chromaticPass.uniforms['offset'].value = effects.chromatic.offset

    // Scan Lines
    this.scanLinesPass.enabled = effects.scanLines.enabled
    this.scanLinesPass.uniforms['density'].value = effects.scanLines.density
    this.scanLinesPass.uniforms['opacity'].value = effects.scanLines.opacity

    // Noise
    this.noisePass.enabled = effects.noise.enabled
    this.noisePass.uniforms['intensity'].value = effects.noise.intensity
  }

  render() {
    // Noise の time uniform を更新
    if (this.noisePass.enabled) {
      this.noisePass.uniforms['time'].value = performance.now() * 0.001
    }
    this.composer.render()
  }

  dispose() {
    this.composer.dispose()
  }
}

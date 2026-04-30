import type * as THREE from 'three'

/**
 * ILayer — 全レイヤー共通インターフェース
 *
 * SigilEngine はこのインターフェースだけ知っていればよい。
 * 各レイヤーは自分の描画ロジックを内部に持つ。
 */
export interface ILayer {
  readonly group: THREE.Group

  /** フレームごとの更新（回転アニメーション等） */
  update(time: number): void

  /** LineMaterial の解像度設定 */
  setResolution(width: number, height: number): void

  /** ストアの config から見た目を更新 */
  applyConfig(config: Record<string, unknown>): void

  /** リソース解放 */
  dispose(): void
}

import type { SigilEngine } from './SigilEngine'

/** グローバルなエンジン参照（エクスポート等で使用） */
let _engine: SigilEngine | null = null

export function setEngineRef(engine: SigilEngine | null) {
  _engine = engine
}

export function getEngineRef(): SigilEngine | null {
  return _engine
}

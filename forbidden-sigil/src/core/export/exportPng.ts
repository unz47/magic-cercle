import type { SigilEngine } from '../SigilEngine'

/**
 * 現在のフレームを PNG として書き出し＆ダウンロード
 */
export function exportPng(engine: SigilEngine, filename?: string) {
  const canvas = engine.captureFrame()
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename ?? `sigil-${Date.now()}.png`
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

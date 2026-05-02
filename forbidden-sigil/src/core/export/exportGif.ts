import { GIFEncoder, quantize, applyPalette } from 'gifenc'
import type { SigilEngine } from '../SigilEngine'

export interface GifExportOptions {
  /** GIF の幅 (px) デフォルト 512 */
  width?: number
  /** GIF の高さ (px) デフォルト 512 */
  height?: number
  /** アニメーション時間 (秒) デフォルト 3 */
  duration?: number
  /** フレームレート デフォルト 20 */
  fps?: number
  /** 進捗コールバック (0〜1) */
  onProgress?: (progress: number) => void
}

/**
 * SigilEngine のアニメーションを GIF として書き出し＆ダウンロード
 */
export async function exportGif(
  engine: SigilEngine,
  options: GifExportOptions = {},
  filename?: string,
): Promise<void> {
  const {
    width = 512,
    height = 512,
    duration = 3,
    fps = 20,
    onProgress,
  } = options

  const totalFrames = Math.floor(duration * fps)
  const delay = Math.floor(1000 / fps)

  // オフスクリーン canvas でリサイズ
  const offscreen = document.createElement('canvas')
  offscreen.width = width
  offscreen.height = height
  const ctx = offscreen.getContext('2d')!

  const gif = GIFEncoder()

  for (let i = 0; i < totalFrames; i++) {
    const time = (i / totalFrames) * duration

    // エンジンに指定時刻で描画させる
    engine.renderAtTime(time)
    const srcCanvas = engine.getCanvas()

    // リサイズして描画
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(srcCanvas, 0, 0, width, height)

    // ピクセルデータ取得
    const imageData = ctx.getImageData(0, 0, width, height)
    const { data } = imageData

    // 256色に量子化
    const palette = quantize(data, 256, { format: 'rgba4444' })
    const indexed = applyPalette(data, palette, 'rgba4444')

    // フレーム追加
    gif.writeFrame(indexed, width, height, {
      palette,
      delay,
      dispose: 0,
    })

    onProgress?.(i / totalFrames)

    // UIをブロックしないよう少し待機
    if (i % 5 === 0) {
      await new Promise((r) => setTimeout(r, 0))
    }
  }

  gif.finish()
  onProgress?.(1)

  // ダウンロード
  const bytes = gif.bytesView()
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'image/gif' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename ?? `majicle-${Date.now()}.gif`
  a.click()
  URL.revokeObjectURL(url)
}

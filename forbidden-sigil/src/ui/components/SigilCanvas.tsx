import { useEffect, useRef } from 'react'
import { SigilEngine } from '../../core/SigilEngine'

/**
 * SigilCanvas — Three.js 描画用の canvas を提供する React コンポーネント
 *
 * useRef で canvas を取得し、SigilEngine に渡す。
 * マウント時に init、アンマウント時に dispose。
 */
export function SigilCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<SigilEngine | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Engine 起動
    const engine = new SigilEngine(canvas)
    engineRef.current = engine

    // リサイズ対応
    const onResize = () => engine.resize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      engine.dispose()
      engineRef.current = null
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="sigil-canvas"
    />
  )
}

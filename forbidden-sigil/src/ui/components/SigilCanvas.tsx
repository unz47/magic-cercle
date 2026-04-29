import { useEffect, useRef } from 'react'
import { SigilEngine } from '../../core/SigilEngine'
import { useSigilStore } from '../../store/useSigilStore'

/**
 * SigilCanvas — Three.js 描画用の canvas を提供する React コンポーネント
 *
 * useRef で canvas を取得し、SigilEngine に渡す。
 * マウント時に init、アンマウント時に dispose。
 * ストアの変更を監視して engine に即座に反映する。
 */
export function SigilCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<SigilEngine | null>(null)

  // ストアから状態を取得
  const rings = useSigilStore((s) => s.rings)
  const bloomStrength = useSigilStore((s) => s.bloomStrength)

  // マウント/アンマウント
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new SigilEngine(canvas)
    engineRef.current = engine

    const onResize = () => engine.resize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      engine.dispose()
      engineRef.current = null
    }
  }, [])

  // ストア変更 → Engine に反映
  useEffect(() => {
    engineRef.current?.updateConfig(rings, bloomStrength)
  }, [rings, bloomStrength])

  return (
    <canvas
      ref={canvasRef}
      className="sigil-canvas"
    />
  )
}

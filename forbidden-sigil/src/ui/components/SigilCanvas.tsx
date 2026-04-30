import { useEffect, useRef, useCallback } from 'react'
import { SigilEngine } from '../../core/SigilEngine'
import { useSigilStore } from '../../store/useSigilStore'

export function SigilCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<SigilEngine | null>(null)
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; startAngle: number; startAzimuth: number }>({
    active: false, startX: 0, startY: 0, startAngle: 0, startAzimuth: 0,
  })

  const layers = useSigilStore((s) => s.layers)
  const global = useSigilStore((s) => s.global)
  const setGlobal = useSigilStore((s) => s.setGlobal)

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

  // ストア → Engine 同期
  useEffect(() => {
    engineRef.current?.syncLayers(layers)
  }, [layers])

  useEffect(() => {
    engineRef.current?.syncGlobal(global)
  }, [global])

  // ドラッグでカメラ操作（上下=仰角、左右=水平角）
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const g = useSigilStore.getState().global
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startAngle: g.cameraAngle,
      startAzimuth: g.cameraAzimuth,
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return
    const deltaX = e.clientX - dragRef.current.startX
    const deltaY = e.clientY - dragRef.current.startY
    const newAngle = Math.max(5, Math.min(90,
      dragRef.current.startAngle + deltaY * 0.3,
    ))
    const newAzimuth = dragRef.current.startAzimuth - deltaX * 0.3
    setGlobal({ cameraAngle: newAngle, cameraAzimuth: newAzimuth })
  }, [setGlobal])

  const onPointerUp = useCallback(() => {
    dragRef.current.active = false
  }, [])

  // スクロールでカメラ距離操作
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const current = useSigilStore.getState().global.cameraDistance
    const newDist = Math.max(2, Math.min(12, current + e.deltaY * 0.005))
    setGlobal({ cameraDistance: newDist })
  }, [setGlobal])

  return (
    <canvas
      ref={canvasRef}
      className="sigil-canvas"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
    />
  )
}

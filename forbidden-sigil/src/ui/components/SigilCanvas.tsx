import { useEffect, useRef, useCallback } from 'react'
import { SigilEngine } from '../../core/SigilEngine'
import { setEngineRef } from '../../core/engineRef'
import { useSigilStore } from '../../store/useSigilStore'

export function SigilCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<SigilEngine | null>(null)
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; startAngle: number; startAzimuth: number }>({
    active: false, startX: 0, startY: 0, startAngle: 0, startAzimuth: 0,
  })
  // ピンチズーム用
  const pinchRef = useRef<{ active: boolean; startDist: number; startZoom: number }>({
    active: false, startDist: 0, startZoom: 5,
  })

  const layers = useSigilStore((s) => s.layers)
  const global = useSigilStore((s) => s.global)
  const effects = useSigilStore((s) => s.effects)
  const particles = useSigilStore((s) => s.particles)
  const setGlobal = useSigilStore((s) => s.setGlobal)

  // マウント/アンマウント
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new SigilEngine(canvas)
    engineRef.current = engine
    setEngineRef(engine)

    const onResize = () => engine.resize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      engine.dispose()
      engineRef.current = null
      setEngineRef(null)
    }
  }, [])

  // ストア → Engine 同期
  useEffect(() => {
    engineRef.current?.syncLayers(layers)
  }, [layers])

  useEffect(() => {
    engineRef.current?.syncGlobal(global)
  }, [global])

  useEffect(() => {
    engineRef.current?.syncEffects(effects)
  }, [effects])

  useEffect(() => {
    engineRef.current?.syncParticles(particles)
  }, [particles])

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

  // ピンチズーム (モバイル)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getTouchDist = (t: TouchList) => {
      const dx = t[0].clientX - t[1].clientX
      const dy = t[0].clientY - t[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        pinchRef.current = {
          active: true,
          startDist: getTouchDist(e.touches),
          startZoom: useSigilStore.getState().global.cameraDistance,
        }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current.active) {
        e.preventDefault()
        const currentDist = getTouchDist(e.touches)
        const scale = pinchRef.current.startDist / currentDist
        const newZoom = Math.max(2, Math.min(12, pinchRef.current.startZoom * scale))
        setGlobal({ cameraDistance: newZoom })
      }
    }

    const onTouchEnd = () => {
      pinchRef.current.active = false
    }

    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
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

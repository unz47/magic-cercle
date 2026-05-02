import { useRef, useState, useEffect, useCallback } from 'react'
import { SigilCanvas } from './ui/components/SigilCanvas'
import { ControlPanel } from './ui/components/ControlPanel'
import { EffectPanel } from './ui/components/EffectPanel'
import { useSigilStore } from './store/useSigilStore'
import { useTemporalStore } from './store/useTemporalStore'
import { getEngineRef } from './core/engineRef'
import { exportPng } from './core/export/exportPng'
import { exportSvg } from './core/export/exportSvg'
import { exportGif } from './core/export/exportGif'

// モバイル判定 hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return isMobile
}

function App() {
  const isMobile = useIsMobile()
  // モバイルはデフォルトで閉じる
  const [panelOpen, setPanelOpen] = useState(!window.matchMedia('(max-width: 768px)').matches)
  const [exportOpen, setExportOpen] = useState(false)
  const [gifProgress, setGifProgress] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const exportState = useSigilStore((s) => s.exportState)
  const importState = useSigilStore((s) => s.importState)
  const { undo, redo } = useTemporalStore()
  // モバイル: 左右パネルを個別制御
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)

  const handleExportJson = () => {
    const json = exportState()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `majicle-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExportOpen(false)
  }

  const handleExportPng = () => {
    const engine = getEngineRef()
    if (!engine) return
    exportPng(engine)
    setExportOpen(false)
  }

  const handleExportSvg = () => {
    const { layers, global } = useSigilStore.getState()
    exportSvg(layers, global)
    setExportOpen(false)
  }

  const handleExportGif = async () => {
    const engine = getEngineRef()
    if (!engine) return
    setGifProgress(0)
    setExportOpen(false)
    await exportGif(engine, {
      width: 512,
      height: 512,
      duration: 3,
      fps: 20,
      onProgress: setGifProgress,
    })
    setGifProgress(null)
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // ファイルサイズ制限 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large (max 5MB)')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const json = reader.result as string
      const success = importState(json)
      if (!success) alert('Invalid sigil file')
    }
    reader.readAsText(file)
    // reset input so same file can be re-imported
    e.target.value = ''
  }

  // キーボードショートカット: Ctrl+Z / Cmd+Z = Undo, Ctrl+Shift+Z / Cmd+Shift+Z = Redo
  // モバイル: 初回ロード時にカメラを最大限引く
  useEffect(() => {
    if (isMobile) {
      useSigilStore.getState().setGlobal({ cameraDistance: 12 })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey
    if (mod && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      undo()
    } else if (mod && e.key === 'z' && e.shiftKey) {
      e.preventDefault()
      redo()
    } else if (mod && e.key === 'y') {
      e.preventDefault()
      redo()
    }
  }, [undo, redo])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // エクスポートメニュー外クリックで閉じる
  useEffect(() => {
    if (!exportOpen) return
    const close = () => setExportOpen(false)
    setTimeout(() => document.addEventListener('click', close), 0)
    return () => document.removeEventListener('click', close)
  }, [exportOpen])

  return (
    <div className="app">
      <SigilCanvas />

      {/* メニューバー */}
      <div className="menu-bar">
        <span className="menu-title">Majicle</span>
        <div className="menu-actions">
          <div className="export-menu-wrapper">
            <button
              className="menu-toggle"
              onClick={(e) => { e.stopPropagation(); setExportOpen(!exportOpen) }}
            >
              Export
            </button>
            {exportOpen && (
              <div className="export-dropdown" onClick={(e) => e.stopPropagation()}>
                <button onClick={handleExportPng}>PNG</button>
                <button onClick={handleExportSvg}>SVG</button>
                <button onClick={handleExportGif}>GIF</button>
                <button onClick={handleExportJson}>JSON</button>
              </div>
            )}
          </div>
          <button className="menu-toggle" onClick={handleImport}>Import</button>
          {isMobile ? (
            <>
              <button
                className={`menu-toggle${leftOpen ? ' menu-toggle--active' : ''}`}
                onClick={() => setLeftOpen(!leftOpen)}
              >
                Effects
              </button>
              <button
                className={`menu-toggle${rightOpen ? ' menu-toggle--active' : ''}`}
                onClick={() => setRightOpen(!rightOpen)}
              >
                Layers
              </button>
            </>
          ) : (
            <button
              className="menu-toggle"
              onClick={() => setPanelOpen(!panelOpen)}
            >
              {panelOpen ? 'Hide UI' : 'Show UI'}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* GIF 書き出し進捗 */}
      {gifProgress !== null && (
        <div className="gif-progress">
          <div className="gif-progress-bar" style={{ width: `${gifProgress * 100}%` }} />
          <span>GIF {Math.floor(gifProgress * 100)}%</span>
        </div>
      )}

      {(isMobile ? leftOpen : panelOpen) && <EffectPanel />}
      {(isMobile ? rightOpen : panelOpen) && <ControlPanel />}
    </div>
  )
}

export default App

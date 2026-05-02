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

function App() {
  const [panelOpen, setPanelOpen] = useState(true)
  const [exportOpen, setExportOpen] = useState(false)
  const [gifProgress, setGifProgress] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const exportState = useSigilStore((s) => s.exportState)
  const importState = useSigilStore((s) => s.importState)
  const { undo, redo, canUndo, canRedo } = useTemporalStore()

  const handleExportJson = () => {
    const json = exportState()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sigil-${Date.now()}.json`
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
        <span className="menu-title">Forbidden Sigil</span>
        <div className="menu-actions">
          <button
            className="menu-toggle"
            onClick={() => undo()}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            Undo
          </button>
          <button
            className="menu-toggle"
            onClick={() => redo()}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
          >
            Redo
          </button>
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
          <button
            className="menu-toggle"
            onClick={() => setPanelOpen(!panelOpen)}
          >
            {panelOpen ? 'Hide UI' : 'Show UI'}
          </button>
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

      {panelOpen && <EffectPanel />}
      {panelOpen && <ControlPanel />}
    </div>
  )
}

export default App

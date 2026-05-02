import { useRef, useState } from 'react'
import { SigilCanvas } from './ui/components/SigilCanvas'
import { ControlPanel } from './ui/components/ControlPanel'
import { EffectPanel } from './ui/components/EffectPanel'
import { useSigilStore } from './store/useSigilStore'

function App() {
  const [panelOpen, setPanelOpen] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const exportState = useSigilStore((s) => s.exportState)
  const importState = useSigilStore((s) => s.importState)

  const handleExport = () => {
    const json = exportState()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sigil-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
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

  return (
    <div className="app">
      <SigilCanvas />

      {/* メニューバー */}
      <div className="menu-bar">
        <span className="menu-title">Forbidden Sigil</span>
        <div className="menu-actions">
          <button className="menu-toggle" onClick={handleExport}>Export</button>
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

      {panelOpen && <EffectPanel />}
      {panelOpen && <ControlPanel />}
    </div>
  )
}

export default App

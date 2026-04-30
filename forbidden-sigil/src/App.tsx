import { useState } from 'react'
import { SigilCanvas } from './ui/components/SigilCanvas'
import { ControlPanel } from './ui/components/ControlPanel'

function App() {
  const [panelOpen, setPanelOpen] = useState(true)

  return (
    <div className="app">
      <SigilCanvas />

      {/* メニューバー */}
      <div className="menu-bar">
        <span className="menu-title">Forbidden Sigil</span>
        <button
          className="menu-toggle"
          onClick={() => setPanelOpen(!panelOpen)}
        >
          {panelOpen ? 'Hide Panel' : 'Show Panel'}
        </button>
      </div>

      {panelOpen && <ControlPanel />}
    </div>
  )
}

export default App

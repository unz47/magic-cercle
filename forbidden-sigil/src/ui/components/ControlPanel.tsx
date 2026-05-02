import { useSigilStore } from '../../store/useSigilStore'
import type { LayerConfig, LayerType } from '../../store/layerConfigs'
import { LAYER_LABELS } from '../../store/layerConfigs'
import { convertText, RUNE_MAP_LABELS } from '../runeMaps'
import type { RuneMapKey } from '../runeMaps'

/* ── 共通コンポーネント ── */

function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void
}) {
  return (
    <label>
      {label}: {Number.isInteger(step) ? value : value.toFixed(step < 0.1 ? 2 : 1)}
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)} />
    </label>
  )
}

function Toggle({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="toggle-label">
      {label}
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

/* ── 共通パラメータ ── */
function CommonFields({ config, onUpdate }: {
  config: LayerConfig; onUpdate: (p: Record<string, unknown>) => void
}) {
  return (
    <div className="common-fields">
      <Slider label="Speed" value={config.speed} min={-3} max={3} step={0.1}
        onChange={(v) => onUpdate({ speed: v })} />
      <Slider label="Opacity" value={config.opacity} min={0} max={1} step={0.05}
        onChange={(v) => onUpdate({ opacity: v })} />
      <Slider label="Rotation" value={config.rotationOffset} min={0} max={360} step={1}
        onChange={(v) => onUpdate({ rotationOffset: v })} />
      <Slider label="Y Offset" value={config.yOffset} min={-2} max={2} step={0.05}
        onChange={(v) => onUpdate({ yOffset: v })} />
      <Slider label="Scale" value={config.scale} min={0.1} max={3} step={0.05}
        onChange={(v) => onUpdate({ scale: v })} />
      <label>
        Color
        <input type="color" value={config.color}
          onChange={(e) => onUpdate({ color: e.target.value })} />
      </label>
    </div>
  )
}

/* ── レイヤー種別ごとのフィールド ── */
function LayerSpecificFields({ config, onUpdate }: {
  config: LayerConfig; onUpdate: (p: Record<string, unknown>) => void
}) {
  switch (config.type) {
    case 'ring':
      return (
        <>
          <Slider label="Radius" value={config.radius} min={0.2} max={3} step={0.1}
            onChange={(v) => onUpdate({ radius: v })} />
          <Slider label="Thickness" value={config.thickness} min={1} max={10} step={1}
            onChange={(v) => onUpdate({ thickness: v })} />
          <Toggle label="Dashed" value={config.dashed}
            onChange={(v) => onUpdate({ dashed: v })} />
          {config.dashed && (
            <Slider label="Dash Scale" value={config.dashScale} min={1} max={50} step={1}
              onChange={(v) => onUpdate({ dashScale: v })} />
          )}
          <Toggle label="Double" value={config.double}
            onChange={(v) => onUpdate({ double: v })} />
          {config.double && (
            <Slider label="Gap" value={config.doubleGap} min={0.05} max={0.5} step={0.01}
              onChange={(v) => onUpdate({ doubleGap: v })} />
          )}
        </>
      )
    case 'polygon':
      return (
        <>
          <Slider label="Sides" value={config.sides} min={3} max={12} step={1}
            onChange={(v) => onUpdate({ sides: v })} />
          <Slider label="Radius" value={config.radius} min={0.2} max={3} step={0.1}
            onChange={(v) => onUpdate({ radius: v })} />
          <Slider label="Thickness" value={config.thickness} min={1} max={10} step={1}
            onChange={(v) => onUpdate({ thickness: v })} />
        </>
      )
    case 'starPolygon':
      return (
        <>
          <Slider label="Points" value={config.points} min={5} max={12} step={1}
            onChange={(v) => onUpdate({ points: v })} />
          <Slider label="Skip" value={config.skip} min={2} max={Math.floor(config.points / 2)} step={1}
            onChange={(v) => onUpdate({ skip: v })} />
          <Slider label="Radius" value={config.radius} min={0.2} max={3} step={0.1}
            onChange={(v) => onUpdate({ radius: v })} />
          <Slider label="Thickness" value={config.thickness} min={1} max={10} step={1}
            onChange={(v) => onUpdate({ thickness: v })} />
        </>
      )
    case 'spokes':
      return (
        <>
          <Slider label="Count" value={config.count} min={2} max={36} step={1}
            onChange={(v) => onUpdate({ count: v })} />
          <Slider label="Inner R" value={config.innerRadius} min={0} max={2} step={0.1}
            onChange={(v) => onUpdate({ innerRadius: v })} />
          <Slider label="Outer R" value={config.outerRadius} min={0.5} max={3} step={0.1}
            onChange={(v) => onUpdate({ outerRadius: v })} />
          <Slider label="Thickness" value={config.thickness} min={1} max={10} step={1}
            onChange={(v) => onUpdate({ thickness: v })} />
        </>
      )
    case 'concentricRings':
      return (
        <>
          <Slider label="Rings" value={config.ringCount} min={2} max={20} step={1}
            onChange={(v) => onUpdate({ ringCount: v })} />
          <Slider label="Inner R" value={config.innerRadius} min={0.1} max={2} step={0.1}
            onChange={(v) => onUpdate({ innerRadius: v })} />
          <Slider label="Outer R" value={config.outerRadius} min={0.5} max={3} step={0.1}
            onChange={(v) => onUpdate({ outerRadius: v })} />
          <Slider label="Thickness" value={config.thickness} min={1} max={10} step={1}
            onChange={(v) => onUpdate({ thickness: v })} />
        </>
      )
    case 'vertexMarks':
      return (
        <>
          <Slider label="Vertices" value={config.vertices} min={3} max={12} step={1}
            onChange={(v) => onUpdate({ vertices: v })} />
          <Slider label="Radius" value={config.radius} min={0.2} max={3} step={0.1}
            onChange={(v) => onUpdate({ radius: v })} />
          <Slider label="Size" value={config.markSize} min={0.02} max={0.3} step={0.01}
            onChange={(v) => onUpdate({ markSize: v })} />
          <label>
            Shape
            <select value={config.markShape}
              onChange={(e) => onUpdate({ markShape: e.target.value })}>
              <option value="dot">Dot</option>
              <option value="diamond">Diamond</option>
              <option value="cross">Cross</option>
              <option value="star">Star</option>
            </select>
          </label>
        </>
      )
    case 'crescent':
      return (
        <>
          <Slider label="Radius" value={config.radius} min={0.2} max={3} step={0.1}
            onChange={(v) => onUpdate({ radius: v })} />
          <Slider label="Arc" value={config.arc} min={0.05} max={1} step={0.05}
            onChange={(v) => onUpdate({ arc: v })} />
          <Slider label="Count" value={config.count} min={1} max={8} step={1}
            onChange={(v) => onUpdate({ count: v })} />
          <Slider label="Thickness" value={config.thickness} min={1} max={10} step={1}
            onChange={(v) => onUpdate({ thickness: v })} />
        </>
      )
    case 'dotChain':
      return (
        <>
          <Slider label="Dots" value={config.dotCount} min={12} max={60} step={1}
            onChange={(v) => onUpdate({ dotCount: v })} />
          <Slider label="Radius" value={config.radius} min={0.2} max={3} step={0.1}
            onChange={(v) => onUpdate({ radius: v })} />
          <Slider label="Dot Size" value={config.dotSize} min={0.01} max={0.1} step={0.005}
            onChange={(v) => onUpdate({ dotSize: v })} />
          <Toggle label="Alternating" value={config.alternating}
            onChange={(v) => onUpdate({ alternating: v })} />
        </>
      )
    case 'wavePattern':
      return (
        <>
          <Slider label="Radius" value={config.radius} min={0.2} max={3} step={0.1}
            onChange={(v) => onUpdate({ radius: v })} />
          <Slider label="Frequency" value={config.frequency} min={4} max={30} step={1}
            onChange={(v) => onUpdate({ frequency: v })} />
          <Slider label="Amplitude" value={config.amplitude} min={0.01} max={0.5} step={0.01}
            onChange={(v) => onUpdate({ amplitude: v })} />
          <label>
            Wave Type
            <select value={config.waveType}
              onChange={(e) => onUpdate({ waveType: e.target.value })}>
              <option value="sine">Sine</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="triangle">Triangle</option>
            </select>
          </label>
          <Slider label="Thickness" value={config.thickness} min={1} max={10} step={1}
            onChange={(v) => onUpdate({ thickness: v })} />
        </>
      )
    case 'spiralArm':
      return (
        <>
          <Slider label="Arms" value={config.armCount} min={1} max={8} step={1}
            onChange={(v) => onUpdate({ armCount: v })} />
          <Slider label="Turns" value={config.turns} min={0.5} max={5} step={0.1}
            onChange={(v) => onUpdate({ turns: v })} />
          <Slider label="Inner R" value={config.innerRadius} min={0} max={2} step={0.1}
            onChange={(v) => onUpdate({ innerRadius: v })} />
          <Slider label="Outer R" value={config.outerRadius} min={0.5} max={3} step={0.1}
            onChange={(v) => onUpdate({ outerRadius: v })} />
          <Toggle label="Logarithmic" value={config.logarithmic}
            onChange={(v) => onUpdate({ logarithmic: v })} />
          <Slider label="Thickness" value={config.thickness} min={1} max={10} step={1}
            onChange={(v) => onUpdate({ thickness: v })} />
        </>
      )
    case 'pulseRings':
      return (
        <>
          <Slider label="Max Radius" value={config.maxRadius} min={0.5} max={4} step={0.1}
            onChange={(v) => onUpdate({ maxRadius: v })} />
          <Slider label="Pulse Speed" value={config.pulseSpeed} min={0.1} max={3} step={0.1}
            onChange={(v) => onUpdate({ pulseSpeed: v })} />
          <Slider label="Max Rings" value={config.maxRings} min={1} max={8} step={1}
            onChange={(v) => onUpdate({ maxRings: v })} />
          <Slider label="Thickness" value={config.thickness} min={1} max={10} step={1}
            onChange={(v) => onUpdate({ thickness: v })} />
        </>
      )
    case 'floatingOrbs':
      return (
        <>
          <Slider label="Count" value={config.count} min={3} max={12} step={1}
            onChange={(v) => onUpdate({ count: v })} />
          <Slider label="Radius" value={config.radius} min={0.2} max={3} step={0.1}
            onChange={(v) => onUpdate({ radius: v })} />
          <Slider label="Height" value={config.height} min={0} max={2} step={0.1}
            onChange={(v) => onUpdate({ height: v })} />
          <Slider label="Orb Size" value={config.orbSize} min={0.02} max={0.2} step={0.01}
            onChange={(v) => onUpdate({ orbSize: v })} />
          <Slider label="Pulse Speed" value={config.pulseSpeed} min={0.1} max={3} step={0.1}
            onChange={(v) => onUpdate({ pulseSpeed: v })} />
        </>
      )
    case 'orbitalShape':
      return (
        <>
          <Slider label="Radius" value={config.radius} min={0.2} max={3} step={0.1}
            onChange={(v) => onUpdate({ radius: v })} />
          <Slider label="Count" value={config.count} min={1} max={24} step={1}
            onChange={(v) => onUpdate({ count: v })} />
          <label>
            Shape Type
            <select value={config.shapeType}
              onChange={(e) => onUpdate({ shapeType: e.target.value })}>
              {LAYER_TYPES.filter(t => t !== 'orbitalShape').map((t) => (
                <option key={t} value={t}>{LAYER_LABELS[t]}</option>
              ))}
            </select>
          </label>
          <Slider label="Size" value={config.shapeSize} min={0.05} max={1} step={0.05}
            onChange={(v) => onUpdate({ shapeSize: v })} />
          <Slider label="Arc Start" value={config.arcStart} min={0} max={1} step={0.01}
            onChange={(v) => onUpdate({ arcStart: v })} />
          <Slider label="Arc End" value={config.arcEnd} min={0} max={1} step={0.01}
            onChange={(v) => onUpdate({ arcEnd: v })} />
          <Toggle label="Align to Orbit" value={config.alignToOrbit}
            onChange={(v) => onUpdate({ alignToOrbit: v })} />
        </>
      )
    case 'runeRing':
      return (
        <>
          <label>
            Mapping
            <select value={config.mapping}
              onChange={(e) => onUpdate({ mapping: e.target.value })}>
              {RUNE_MAP_LABELS.map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            Text
            <input type="text" value={config.text} style={{
              width: '100%', marginTop: 4, padding: '4px 6px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 4, color: '#ccc', fontSize: 12,
            }}
              onChange={(e) => {
                const val = e.target.value
                onUpdate({ text: convertText(val, config.mapping as RuneMapKey) })
              }} />
          </label>
          <Slider label="Radius" value={config.radius} min={0.2} max={3} step={0.1}
            onChange={(v) => onUpdate({ radius: v })} />
          <Slider label="Font Size" value={config.fontSize} min={12} max={60} step={1}
            onChange={(v) => onUpdate({ fontSize: v })} />
          <label>
            Font
            <select value={config.font}
              onChange={(e) => onUpdate({ font: e.target.value })}>
              <option value="serif">Serif</option>
              <option value="sans-serif">Sans-serif</option>
              <option value="monospace">Monospace</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Courier New', monospace">Courier New</option>
            </select>
          </label>
          <Toggle label="Reverse" value={config.reverse}
            onChange={(v) => onUpdate({ reverse: v })} />
        </>
      )
  }
}

const LAYER_TYPES: LayerType[] = [
  'ring', 'polygon', 'starPolygon', 'spokes',
  'concentricRings', 'vertexMarks', 'crescent',
  'dotChain', 'wavePattern', 'spiralArm',
  'pulseRings', 'floatingOrbs', 'runeRing',
  'orbitalShape',
]

export function ControlPanel() {
  const layers = useSigilStore((s) => s.layers)
  const global = useSigilStore((s) => s.global)
  const addLayer = useSigilStore((s) => s.addLayer)
  const removeLayer = useSigilStore((s) => s.removeLayer)
  const updateLayer = useSigilStore((s) => s.updateLayer)
  const reorderLayer = useSigilStore((s) => s.reorderLayer)
  const setGlobal = useSigilStore((s) => s.setGlobal)

  return (
    <div className="control-panel">
      <h2 className="panel-title">Sigil Controls</h2>

      {/* グローバル設定 */}
      <fieldset className="ring-group">
        <legend>Global</legend>
        <Slider label="Bloom" value={global.bloomStrength} min={0} max={3} step={0.1}
          onChange={(v) => setGlobal({ bloomStrength: v })} />
        <label>
          BG Color
          <input type="color" value={global.bgColor}
            onChange={(e) => setGlobal({ bgColor: e.target.value })} />
        </label>
      </fieldset>

      {/* レイヤー追加 */}
      <div className="add-layer">
        <select defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              addLayer(e.target.value as LayerType)
              e.target.value = ''
            }
          }}>
          <option value="" disabled>+ Add Layer...</option>
          {LAYER_TYPES.map((t) => (
            <option key={t} value={t}>{LAYER_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {/* レイヤー一覧 */}
      {layers.map((layer, idx) => (
        <fieldset key={layer.id} className="ring-group">
          <legend style={{ color: layer.color }}>
            {LAYER_LABELS[layer.type]} #{idx + 1}
          </legend>

          <div className="layer-actions">
            <button onClick={() => reorderLayer(layer.id, 'up')} disabled={idx === 0}>▲</button>
            <button onClick={() => reorderLayer(layer.id, 'down')} disabled={idx === layers.length - 1}>▼</button>
            <button className="layer-visible"
              onClick={() => updateLayer(layer.id, { visible: !layer.visible })}>
              {layer.visible ? '👁' : '—'}
            </button>
            <button className="layer-delete" onClick={() => removeLayer(layer.id)}>✕</button>
          </div>

          {layer.visible && (
            <>
              <LayerSpecificFields config={layer}
                onUpdate={(p) => updateLayer(layer.id, p)} />
              <details className="common-details">
                <summary>Common</summary>
                <CommonFields config={layer}
                  onUpdate={(p) => updateLayer(layer.id, p)} />
              </details>
            </>
          )}
        </fieldset>
      ))}
    </div>
  )
}

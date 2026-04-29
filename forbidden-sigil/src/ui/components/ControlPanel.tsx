import { useSigilStore } from '../../store/useSigilStore'

const RING_LABELS = ['Ring 1 (外)', 'Ring 2 (中)', 'Ring 3 (内)'] as const

export function ControlPanel() {
  const rings = useSigilStore((s) => s.rings)
  const bloomStrength = useSigilStore((s) => s.bloomStrength)
  const setRing = useSigilStore((s) => s.setRing)
  const setBloomStrength = useSigilStore((s) => s.setBloomStrength)

  return (
    <div className="control-panel">
      <h2 className="panel-title">Sigil Controls</h2>

      {rings.map((ring, i) => (
        <fieldset key={i} className="ring-group">
          <legend style={{ color: ring.color }}>{RING_LABELS[i]}</legend>

          <label>
            Radius: {ring.radius.toFixed(1)}
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={ring.radius}
              onChange={(e) =>
                setRing(i as 0 | 1 | 2, { radius: +e.target.value })
              }
            />
          </label>

          <label>
            Thickness: {ring.thickness.toFixed(0)}
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={ring.thickness}
              onChange={(e) =>
                setRing(i as 0 | 1 | 2, { thickness: +e.target.value })
              }
            />
          </label>

          <label>
            Speed: {ring.speed.toFixed(1)}
            <input
              type="range"
              min="-3.0"
              max="3.0"
              step="0.1"
              value={ring.speed}
              onChange={(e) =>
                setRing(i as 0 | 1 | 2, { speed: +e.target.value })
              }
            />
          </label>

          <label>
            Color
            <input
              type="color"
              value={ring.color}
              onChange={(e) =>
                setRing(i as 0 | 1 | 2, { color: e.target.value })
              }
            />
          </label>
        </fieldset>
      ))}

      <fieldset className="ring-group">
        <legend>Bloom</legend>
        <label>
          Strength: {bloomStrength.toFixed(1)}
          <input
            type="range"
            min="0"
            max="3.0"
            step="0.1"
            value={bloomStrength}
            onChange={(e) => setBloomStrength(+e.target.value)}
          />
        </label>
      </fieldset>
    </div>
  )
}

import { useSigilStore } from '../../store/useSigilStore'
import type { EffectSettings, ParticleSettings } from '../../store/useSigilStore'

/* ── 共通コンポーネント ── */

function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void
}) {
  return (
    <label>
      {label}: {value.toFixed(step < 0.01 ? 3 : 2)}
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)} />
    </label>
  )
}

/* ── Effects セクション ── */

const EFFECT_LIST: { key: keyof EffectSettings; name: string; label: string }[] = [
  { key: 'vignette',  name: 'Vignette',  label: '周辺減光' },
  { key: 'chromatic', name: 'Chromatic', label: '色収差' },
  { key: 'scanLines', name: 'Scan Lines', label: '走査線' },
  { key: 'noise',     name: 'Noise',     label: 'ノイズ' },
]

function EffectSection() {
  const effects = useSigilStore((s) => s.effects)
  const setEffect = useSigilStore((s) => s.setEffect)

  return (
    <section className="panel-section">
      <h3 className="section-title">Effects</h3>

      {EFFECT_LIST.map(({ key, name, label }) => (
        <fieldset key={key} className="effect-group">
          <label className="effect-toggle">
            <input type="checkbox" checked={effects[key].enabled}
              onChange={(e) => setEffect(key, { enabled: e.target.checked } as Partial<EffectSettings[typeof key]>)} />
            <span className="effect-name">{name}</span>
            <span className="effect-label">{label}</span>
          </label>

          {effects[key].enabled && key === 'vignette' && (
            <Slider label="Intensity" value={effects.vignette.intensity}
              min={0.1} max={2} step={0.05}
              onChange={(v) => setEffect('vignette', { intensity: v })} />
          )}
          {effects[key].enabled && key === 'chromatic' && (
            <Slider label="Offset" value={effects.chromatic.offset}
              min={0.001} max={0.02} step={0.001}
              onChange={(v) => setEffect('chromatic', { offset: v })} />
          )}
          {effects[key].enabled && key === 'scanLines' && (
            <>
              <Slider label="Density" value={effects.scanLines.density}
                min={0.5} max={5} step={0.1}
                onChange={(v) => setEffect('scanLines', { density: v })} />
              <Slider label="Opacity" value={effects.scanLines.opacity}
                min={0.05} max={0.5} step={0.01}
                onChange={(v) => setEffect('scanLines', { opacity: v })} />
            </>
          )}
          {effects[key].enabled && key === 'noise' && (
            <Slider label="Intensity" value={effects.noise.intensity}
              min={0.01} max={0.3} step={0.01}
              onChange={(v) => setEffect('noise', { intensity: v })} />
          )}
        </fieldset>
      ))}
    </section>
  )
}

/* ── Particles セクション ── */

const PARTICLE_LIST: { key: keyof ParticleSettings; name: string; label: string; hasRadius?: boolean }[] = [
  { key: 'risingSparks', name: 'Rising Sparks',  label: '上昇火花' },
  { key: 'dust',         name: 'Dust',            label: '浮遊塵' },
  { key: 'orbital',      name: 'Orbital',         label: '軌道粒子', hasRadius: true },
  { key: 'fireflies',    name: 'Fireflies',       label: '蛍' },
  { key: 'energyMist',   name: 'Energy Mist',     label: 'エネルギー霧' },
  { key: 'fallingAsh',   name: 'Falling Ash',     label: '降灰' },
]

function ParticleSection() {
  const particles = useSigilStore((s) => s.particles)
  const setParticle = useSigilStore((s) => s.setParticle)

  return (
    <section className="panel-section">
      <h3 className="section-title">Particles</h3>

      {PARTICLE_LIST.map(({ key, name, label, hasRadius }) => {
        const cfg = particles[key]
        return (
          <fieldset key={key} className="effect-group">
            <label className="effect-toggle">
              <input type="checkbox" checked={cfg.enabled}
                onChange={(e) => setParticle(key, { enabled: e.target.checked } as Partial<ParticleSettings[typeof key]>)} />
              <span className="effect-name">{name}</span>
              <span className="effect-label">{label}</span>
            </label>

            {cfg.enabled && (
              <>
                <Slider label="Count" value={cfg.count} min={1} max={1000} step={1}
                  onChange={(v) => setParticle(key, { count: v } as Partial<ParticleSettings[typeof key]>)} />
                <Slider label="Speed" value={cfg.speed} min={0.01} max={10} step={0.01}
                  onChange={(v) => setParticle(key, { speed: v } as Partial<ParticleSettings[typeof key]>)} />
                {hasRadius ? (
                  <Slider label="Radius" value={(cfg as { radius: number }).radius} min={0.1} max={20} step={0.1}
                    onChange={(v) => setParticle(key, { radius: v } as Partial<ParticleSettings[typeof key]>)} />
                ) : (
                  <Slider label="Spread" value={(cfg as { spread: number }).spread} min={0.1} max={20} step={0.1}
                    onChange={(v) => setParticle(key, { spread: v } as Partial<ParticleSettings[typeof key]>)} />
                )}
                <Slider label="Size" value={cfg.size} min={0.005} max={0.5} step={0.005}
                  onChange={(v) => setParticle(key, { size: v } as Partial<ParticleSettings[typeof key]>)} />
                <label>
                  Color
                  <input type="color" value={cfg.color}
                    onChange={(e) => setParticle(key, { color: e.target.value } as Partial<ParticleSettings[typeof key]>)} />
                </label>
              </>
            )}
          </fieldset>
        )
      })}
    </section>
  )
}

/* ── メインパネル ── */

export function EffectPanel() {
  return (
    <div className="effect-panel">
      <EffectSection />
      <ParticleSection />
    </div>
  )
}

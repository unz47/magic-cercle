import type { LayerConfig } from '../../store/layerConfigs'
import type { GlobalSettings } from '../../store/useSigilStore'

/** XML特殊文字をエスケープ (XSS防止) */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** 色値が安全な形式か検証 */
function sanitizeColor(value: string): string {
  const hex = /^#[0-9a-fA-F]{3,8}$/
  const rgb = /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/
  if (hex.test(value) || rgb.test(value)) return value
  return '#ffffff'
}

/** IDを安全な文字列に制限 */
function sanitizeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '')
}

/**
 * レイヤー設定から SVG を生成してダウンロード
 * Three.js の 3D → 2D 平面投影（XZ 平面を真上から見下ろす想定）
 */
export function exportSvg(
  layers: LayerConfig[],
  global: GlobalSettings,
  filename?: string,
) {
  const size = 800
  const cx = size / 2
  const cy = size / 2
  const scale = size / 5 // 半径1 = 160px

  let paths = ''

  for (const layer of layers) {
    const color = sanitizeColor((layer as unknown as Record<string, unknown>).color as string || '#ffffff')
    const thickness = Math.max(0, Math.min(20, ((layer as unknown as Record<string, unknown>).thickness as number) || 2))
    const layerRadius = Math.max(0, Math.min(10, ((layer as unknown as Record<string, unknown>).radius as number) || 1))

    switch (layer.type) {
      case 'ring': {
        const r = layerRadius * scale
        paths += `  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${thickness}" opacity="0.9"/>\n`
        if ((layer as unknown as Record<string, unknown>).double) {
          paths += `  <circle cx="${cx}" cy="${cy}" r="${r * 0.92}" fill="none" stroke="${color}" stroke-width="${thickness * 0.7}" opacity="0.6"/>\n`
        }
        break
      }

      case 'polygon': {
        const sides = (layer as unknown as Record<string, unknown>).sides as number || 6
        const r = layerRadius * scale
        const points = polygonPoints(cx, cy, r, sides)
        paths += `  <polygon points="${points}" fill="none" stroke="${color}" stroke-width="${thickness}" opacity="0.9"/>\n`
        break
      }

      case 'starPolygon': {
        const pts = (layer as unknown as Record<string, unknown>).points as number || 5
        const skip = (layer as unknown as Record<string, unknown>).skip as number || 2
        const r = layerRadius * scale
        const starPath = starPolygonPath(cx, cy, r, pts, skip)
        paths += `  <path d="${starPath}" fill="none" stroke="${color}" stroke-width="${thickness}" opacity="0.9"/>\n`
        break
      }

      case 'spokes': {
        const count = (layer as unknown as Record<string, unknown>).count as number || 12
        const outerR = ((layer as unknown as Record<string, unknown>).outerRadius as number || 1.8) * scale
        const innerR = ((layer as unknown as Record<string, unknown>).innerRadius as number || 0.2) * scale
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 - Math.PI / 2
          const x1 = cx + Math.cos(angle) * innerR
          const y1 = cy + Math.sin(angle) * innerR
          const x2 = cx + Math.cos(angle) * outerR
          const y2 = cy + Math.sin(angle) * outerR
          paths += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${thickness}" opacity="0.7"/>\n`
        }
        break
      }

      case 'concentricRings': {
        const count = (layer as unknown as Record<string, unknown>).count as number || 4
        const innerR = ((layer as unknown as Record<string, unknown>).innerRadius as number || 0.5) * scale
        const outerR = ((layer as unknown as Record<string, unknown>).outerRadius as number || 1.8) * scale
        for (let i = 0; i < count; i++) {
          const r = innerR + (outerR - innerR) * (i / (count - 1))
          paths += `  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${thickness * 0.7}" opacity="0.6"/>\n`
        }
        break
      }

      case 'dotChain': {
        const count = (layer as unknown as Record<string, unknown>).count as number || 24
        const r = layerRadius * scale
        const dotSize = ((layer as unknown as Record<string, unknown>).dotSize as number || 0.03) * scale
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 - Math.PI / 2
          const x = cx + Math.cos(angle) * r
          const y = cy + Math.sin(angle) * r
          paths += `  <circle cx="${x}" cy="${y}" r="${dotSize}" fill="${color}" opacity="0.8"/>\n`
        }
        break
      }

      case 'crescent': {
        const r = layerRadius * scale
        const offsetRatio = (layer as unknown as Record<string, unknown>).offsetRatio as number || 0.3
        const r2 = r * 0.9
        const offsetX = r * offsetRatio
        // 三日月をパスで近似
        paths += `  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="0.15"/>\n`
        paths += `  <circle cx="${cx + offsetX}" cy="${cy}" r="${r2}" fill="${global.bgColor}"/>\n`
        break
      }

      case 'runeRing': {
        const r = layerRadius * scale
        const rawText = (layer as unknown as Record<string, unknown>).text as string || 'ABCDEF'
        const safeText = escapeXml(rawText)
        const safeId = sanitizeId(layer.id)
        // テキストをパスに沿って配置
        paths += `  <defs>\n    <path id="rune-path-${safeId}" d="M ${cx - r},${cy} a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0"/>\n  </defs>\n`
        paths += `  <text fill="${color}" font-size="14" opacity="0.9">\n    <textPath href="#rune-path-${safeId}">${safeText}</textPath>\n  </text>\n`
        break
      }

      default: {
        // その他のレイヤーはリングとして近似
        const r = layerRadius * scale
        paths += `  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${thickness}" opacity="0.5" stroke-dasharray="4 4"/>\n`
        break
      }
    }
  }

  const safeBgColor = sanitizeColor(global.bgColor)
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${safeBgColor}"/>
${paths}</svg>
`

  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename ?? `sigil-${Date.now()}.svg`
  a.click()
  URL.revokeObjectURL(url)
}

/** 正多角形の頂点座標を文字列で生成 */
function polygonPoints(cx: number, cy: number, r: number, sides: number): string {
  const pts: string[] = []
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
    pts.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`)
  }
  return pts.join(' ')
}

/** スター多角形のパスデータを生成 */
function starPolygonPath(cx: number, cy: number, r: number, points: number, skip: number): string {
  const vertices: [number, number][] = []
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2
    vertices.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r])
  }

  const parts: string[] = []
  const visited = new Set<number>()

  for (let start = 0; start < points; start++) {
    if (visited.has(start)) continue
    let i = start
    parts.push(`M ${vertices[i][0]},${vertices[i][1]}`)
    visited.add(i)
    i = (i + skip) % points
    while (i !== start) {
      parts.push(`L ${vertices[i][0]},${vertices[i][1]}`)
      visited.add(i)
      i = (i + skip) % points
    }
    parts.push('Z')
  }

  return parts.join(' ')
}

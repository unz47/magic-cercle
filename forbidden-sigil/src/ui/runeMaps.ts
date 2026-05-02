/**
 * ラテン文字 → 各種スクリプトへの変換マッピング
 *
 * キーは小文字ラテン文字、値は対応する変換先文字。
 */

/** Elder Futhark（音韻対応） */
const elderFuthark: Record<string, string> = {
  f: '\u16A0', u: '\u16A2', t: '\u16A6', a: '\u16A8',
  r: '\u16B1', k: '\u16B2', g: '\u16B7', w: '\u16B9',
  h: '\u16BA', n: '\u16BE', i: '\u16C1', j: '\u16C3',
  e: '\u16C7', p: '\u16C8', z: '\u16C9', s: '\u16CA',
  b: '\u16D2', m: '\u16D7', l: '\u16DA', d: '\u16DE',
  o: '\u16DF', c: '\u16B2', v: '\u16B9', x: '\u16B2\u16CA',
  y: '\u16C1', q: '\u16B2',
}

/** Younger Futhark（簡略化） */
const youngerFuthark: Record<string, string> = {
  f: '\u16A0', u: '\u16A2', t: '\u16A6', a: '\u16AC',
  r: '\u16B1', k: '\u16B4', h: '\u16BC', n: '\u16BE',
  i: '\u16C1', s: '\u16CA', b: '\u16D2', m: '\u16D7',
  l: '\u16DA', e: '\u16C7', d: '\u16DE', o: '\u16DF',
  g: '\u16B4', p: '\u16D2', v: '\u16A0', w: '\u16A2',
  c: '\u16B4', j: '\u16C1', x: '\u16B4\u16CA',
  y: '\u16A2', z: '\u16CA', q: '\u16B4',
}

/** Planetary 惑星記号（アルファベット順に割当） */
const planetary: Record<string, string> = {
  a: '\u2609', // Sun
  b: '\u263D', // First Quarter Moon
  c: '\u263E', // Last Quarter Moon
  d: '\u263F', // Mercury
  e: '\u2640', // Venus
  f: '\u2641', // Earth
  g: '\u2642', // Mars
  h: '\u2643', // Jupiter
  i: '\u2644', // Saturn
  j: '\u2645', // Uranus
  k: '\u2646', // Neptune
  l: '\u2647', // Pluto
  m: '\u2609', n: '\u263D', o: '\u263E', p: '\u263F',
  q: '\u2640', r: '\u2641', s: '\u2642', t: '\u2643',
  u: '\u2644', v: '\u2645', w: '\u2646', x: '\u2647',
  y: '\u2609', z: '\u263D',
}

/** Zodiac 黄道十二宮 */
const zodiac: Record<string, string> = {
  a: '\u2648', b: '\u2649', c: '\u264A', d: '\u264B',
  e: '\u264C', f: '\u264D', g: '\u264E', h: '\u264F',
  i: '\u2650', j: '\u2651', k: '\u2652', l: '\u2653',
  m: '\u2648', n: '\u2649', o: '\u264A', p: '\u264B',
  q: '\u264C', r: '\u264D', s: '\u264E', t: '\u264F',
  u: '\u2650', v: '\u2651', w: '\u2652', x: '\u2653',
  y: '\u2648', z: '\u2649',
}

/** Inuktitut（カナダ先住民音節文字） */
const inuktitut: Record<string, string> = {
  a: '\u1401', b: '\u140A', c: '\u1410', d: '\u1420',
  e: '\u1429', f: '\u1431', g: '\u1438', h: '\u1444',
  i: '\u144C', j: '\u1455', k: '\u145B', l: '\u1466',
  m: '\u146B', n: '\u1472', o: '\u148B', p: '\u1490',
  q: '\u1493', r: '\u1495', s: '\u14A1', t: '\u14A5',
  u: '\u14AA', v: '\u14C0', w: '\u14C7', x: '\u14D0',
  y: '\u14EF', z: '\u1505',
}

/** Devanagari（デーヴァナーガリー） */
const devanagari: Record<string, string> = {
  a: '\u0905', b: '\u092C', c: '\u091A', d: '\u0926',
  e: '\u090F', f: '\u092B', g: '\u0917', h: '\u0939',
  i: '\u0907', j: '\u091C', k: '\u0915', l: '\u0932',
  m: '\u092E', n: '\u0928', o: '\u0913', p: '\u092A',
  q: '\u0958', r: '\u0930', s: '\u0938', t: '\u0924',
  u: '\u0909', v: '\u0935', w: '\u0935', x: '\u0915\u094D\u0937',
  y: '\u092F', z: '\u095B',
}

/** Cherokee（チェロキー文字） */
const cherokee: Record<string, string> = {
  a: '\u13A0', b: '\u13A1', c: '\u13A2', d: '\u13A3',
  e: '\u13A4', f: '\u13A5', g: '\u13A6', h: '\u13A7',
  i: '\u13A8', j: '\u13A9', k: '\u13AA', l: '\u13AB',
  m: '\u13AC', n: '\u13AD', o: '\u13AE', p: '\u13AF',
  q: '\u13B0', r: '\u13B1', s: '\u13B2', t: '\u13B3',
  u: '\u13B4', v: '\u13B5', w: '\u13B6', x: '\u13B7',
  y: '\u13B8', z: '\u13B9',
}

export type RuneMapKey =
  | 'elderFuthark'
  | 'youngerFuthark'
  | 'planetary'
  | 'zodiac'
  | 'inuktitut'
  | 'devanagari'
  | 'cherokee'
  | 'none'

export const RUNE_MAPS: Record<Exclude<RuneMapKey, 'none'>, Record<string, string>> = {
  elderFuthark,
  youngerFuthark,
  planetary,
  zodiac,
  inuktitut,
  devanagari,
  cherokee,
}

/** 入力文字列を指定のマッピングで変換する */
export function convertText(input: string, mapKey: RuneMapKey): string {
  if (mapKey === 'none') return input
  const map = RUNE_MAPS[mapKey]
  if (!map) return input

  let result = ''
  for (const ch of input) {
    const lower = ch.toLowerCase()
    if (map[lower]) {
      result += map[lower]
    } else if (ch === ' ') {
      result += ' '
    } else {
      // マッピングにない文字はそのまま
      result += ch
    }
  }
  return result
}

/** プリセット名と表示ラベルの対応 */
export const RUNE_MAP_LABELS: { key: RuneMapKey; label: string }[] = [
  { key: 'none', label: 'None (direct)' },
  { key: 'elderFuthark', label: 'Elder Futhark' },
  { key: 'youngerFuthark', label: 'Younger Futhark' },
  { key: 'planetary', label: 'Planetary' },
  { key: 'zodiac', label: 'Zodiac' },
  { key: 'inuktitut', label: 'Inuktitut' },
  { key: 'devanagari', label: 'Devanagari' },
  { key: 'cherokee', label: 'Cherokee' },
]

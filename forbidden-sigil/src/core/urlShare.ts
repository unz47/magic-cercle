/**
 * URL 共有ユーティリティ
 * JSON state を deflate 圧縮 → base64url エンコードして URL hash に埋め込む
 */

/** state JSON を圧縮して base64url 文字列にする */
export async function compressState(json: string): Promise<string> {
  const data = new TextEncoder().encode(json)
  const cs = new CompressionStream('deflate')
  const writer = cs.writable.getWriter()
  writer.write(data)
  writer.close()
  const buf = await new Response(cs.readable).arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** base64url 文字列を展開して JSON 文字列にする */
export async function decompressState(encoded: string): Promise<string> {
  let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) b64 += '='
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const ds = new DecompressionStream('deflate')
  const writer = ds.writable.getWriter()
  writer.write(bytes)
  writer.close()
  const buf = await new Response(ds.readable).arrayBuffer()
  return new TextDecoder().decode(buf)
}

/** 現在の state を含む共有 URL を生成 */
export async function buildShareUrl(json: string): Promise<string> {
  const compressed = await compressState(json)
  const base = `${window.location.origin}${window.location.pathname}`
  return `${base}#s=${compressed}`
}

/** URL hash から state JSON を読み取る (なければ null) */
export async function loadStateFromUrl(): Promise<string | null> {
  const hash = window.location.hash
  if (!hash.startsWith('#s=')) return null
  const encoded = hash.slice(3)
  if (!encoded) return null
  try {
    return await decompressState(encoded)
  } catch {
    console.warn('Failed to decompress state from URL')
    return null
  }
}

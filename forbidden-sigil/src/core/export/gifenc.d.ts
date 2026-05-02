declare module 'gifenc' {
  export function GIFEncoder(): {
    writeFrame(
      data: Uint8Array | Uint8ClampedArray,
      width: number,
      height: number,
      opts?: { palette?: number[][]; delay?: number; dispose?: number }
    ): void
    finish(): void
    bytesView(): Uint8Array
    bytes(): Uint8Array
  }

  export function quantize(
    data: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    opts?: { format?: string; oneBitAlpha?: boolean }
  ): number[][]

  export function applyPalette(
    data: Uint8Array | Uint8ClampedArray,
    palette: number[][],
    format?: string
  ): Uint8Array
}

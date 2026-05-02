import { useSigilStore } from './useSigilStore'

/**
 * Undo/Redo hook — useSigilStore から直接取得
 */
export function useTemporalStore() {
  const undo = useSigilStore((s) => s.undo)
  const redo = useSigilStore((s) => s.redo)
  const canUndo = useSigilStore((s) => s.canUndo)
  const canRedo = useSigilStore((s) => s.canRedo)

  return { undo, redo, canUndo, canRedo }
}

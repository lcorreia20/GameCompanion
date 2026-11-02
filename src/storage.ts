import type { Game } from './types'

export const STORAGE_KEY = 'gamecompanion:progress:v1'
const MAX_IMPORT_BYTES = 1024 * 1024

export type Progress = Record<string, string[]>

export interface Backup {
  format: 'gamecompanion-progress'
  version: 1
  exportedAt: string
  completed: Progress
}

export function normalizeProgress(value: unknown, games: Game[]): Progress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Formato de progresso inválido.')
  const raw = value as Record<string, unknown>
  if (Object.keys(raw).some(id => !games.some(game => game.id === id))) throw new Error('O arquivo contém jogos desconhecidos.')
  const result: Progress = {}
  for (const game of games) {
    const ids = Object.hasOwn(raw, game.id) ? raw[game.id] : []
    if (!Array.isArray(ids) || ids.length > 10000 || ids.some(id => typeof id !== 'string' || id.length < 1 || id.length > 160)) {
      throw new Error('O arquivo contém IDs de etapas inválidos.')
    }
    result[game.id] = [...new Set(ids as string[])]
  }
  return result
}

export function loadProgress(games: Game[]): Progress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? normalizeProgress(JSON.parse(saved) as unknown, games) : normalizeProgress({}, games)
  } catch {
    return normalizeProgress({}, games)
  }
}

export function parseBackup(text: string, games: Game[]): Progress {
  if (new Blob([text]).size > MAX_IMPORT_BYTES) throw new Error('O arquivo excede o limite de 1 MB.')
  let parsed: unknown
  try { parsed = JSON.parse(text) as unknown } catch { throw new Error('O arquivo não é um JSON válido.') }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Formato de backup inválido.')
  const data = parsed as Partial<Backup>
  if (data.format !== 'gamecompanion-progress' || data.version !== 1) throw new Error('Formato ou versão de backup incompatível.')
  return normalizeProgress(data.completed, games)
}

export function makeBackup(progress: Progress): Backup {
  return { format: 'gamecompanion-progress', version: 1, exportedAt: new Date().toISOString(), completed: progress }
}

export { MAX_IMPORT_BYTES }

import { pbz } from '../data/pbz'
import { demo } from '../data/demo'
import { pbzContent } from '../data/games/phantom-blade-zero'
import { makeBackup, MAX_IMPORT_BYTES, normalizeProgress, parseBackup, STORAGE_KEY } from '../storage'
import type { Progress } from '../storage'
import type { SpoilerLevel } from '../types'
import type { GameRepository, ProgressRepository, SettingsRepository } from './interfaces'

export const PROGRESS_V2_KEY = 'gamecompanion:progress:v2'
export const LEGACY_SNAPSHOT_KEY = 'gamecompanion:progress:v1:before-migration'
export const INVALID_V2_SNAPSHOT_KEY = 'gamecompanion:progress:v2:before-recovery'
export const SETTINGS_KEY = 'gamecompanion:spoiler:v1'
export const THEME_KEY = 'gamecompanion:theme:v1'
const allKnownGames = [pbz, demo] // demo ocultada da UI, mas mantida para preservar backups antigos.

export interface PersistedProgressV2 {
  format: 'gamecompanion-progress'
  schemaVersion: 2
  catalogVersion: string
  updatedAt: string
  completed: Progress
}

function decodeV2(value: unknown): Progress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Progresso v2 inválido.')
  const data = value as Partial<PersistedProgressV2>
  if (data.format !== 'gamecompanion-progress' || data.schemaVersion !== 2) throw new Error('Versão de progresso incompatível.')
  return normalizeProgress(data.completed, allKnownGames)
}

export const localGameRepository: GameRepository = {
  list: () => [pbz],
  get: id => id === pbz.id ? pbz : undefined,
}

export const localProgressRepository: ProgressRepository = {
  load() {
    const current = localStorage.getItem(PROGRESS_V2_KEY)
    if (current !== null) return decodeV2(JSON.parse(current) as unknown)
    const old = localStorage.getItem(STORAGE_KEY)
    return normalizeProgress(old === null ? {} : JSON.parse(old) as unknown, allKnownGames)
  },
  save(progress) {
    const completed = normalizeProgress(progress, allKnownGames)
    const existing = localStorage.getItem(PROGRESS_V2_KEY)
    // Nunca substitua dados que não conseguimos interpretar: podem ser recuperáveis.
    if (existing !== null) decodeV2(JSON.parse(existing) as unknown)
    const old = localStorage.getItem(STORAGE_KEY)
    // Preserva integralmente o valor original; IDs demonstrativos não são atribuídos a objetivos reais.
    if (old !== null && localStorage.getItem(LEGACY_SNAPSHOT_KEY) === null) {
      localStorage.setItem(LEGACY_SNAPSHOT_KEY, old)
    }
    const envelope: PersistedProgressV2 = {
      format: 'gamecompanion-progress', schemaVersion: 2,
      catalogVersion: pbzContent.metadata.contentVersion, updatedAt: new Date().toISOString(), completed,
    }
    localStorage.setItem(PROGRESS_V2_KEY, JSON.stringify(envelope))
  },
  recoverFromBackup(progress) {
    // Somente após confirmação explícita da UI. Nunca descartar o valor bruto irrecuperável.
    const existing = localStorage.getItem(PROGRESS_V2_KEY)
    if (existing !== null) {
      try { decodeV2(JSON.parse(existing) as unknown) }
      catch {
        // Preserve cada versão ilegível, inclusive quando já houve recuperação anterior.
        let key = INVALID_V2_SNAPSHOT_KEY
        if (localStorage.getItem(key) !== null) {
          let index = 2
          while (localStorage.getItem(`${INVALID_V2_SNAPSHOT_KEY}:${index}`) !== null) index++
          key = `${INVALID_V2_SNAPSHOT_KEY}:${index}`
        }
        localStorage.setItem(key, existing)
        const old = localStorage.getItem(STORAGE_KEY)
        if (old !== null && localStorage.getItem(LEGACY_SNAPSHOT_KEY) === null) localStorage.setItem(LEGACY_SNAPSHOT_KEY, old)
        const envelope: PersistedProgressV2 = {
          format: 'gamecompanion-progress', schemaVersion: 2,
          catalogVersion: pbzContent.metadata.contentVersion, updatedAt: new Date().toISOString(),
          completed: normalizeProgress(progress, allKnownGames),
        }
        localStorage.setItem(PROGRESS_V2_KEY, JSON.stringify(envelope))
        return
      }
    }
    this.save(progress)
  },
  importBackup(text) {
    if (new Blob([text]).size > MAX_IMPORT_BYTES) throw new Error('O arquivo excede o limite de 1 MB.')
    let parsed: unknown
    try { parsed = JSON.parse(text) as unknown } catch { throw new Error('O arquivo não é um JSON válido.') }
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'schemaVersion' in parsed) return decodeV2(parsed)
    return parseBackup(text, allKnownGames)
  },
  exportBackup(progress) {
    // Formato v1 de backup continua válido e conserva IDs antigos e novos por jogo.
    return JSON.stringify(makeBackup(normalizeProgress(progress, allKnownGames)), null, 2)
  },
  restoreLegacySnapshot() {
    const saved = localStorage.getItem(LEGACY_SNAPSHOT_KEY)
    return saved === null ? null : normalizeProgress(JSON.parse(saved) as unknown, allKnownGames)
  },
}

export const localSettingsRepository: SettingsRepository = {
  getSpoilerLevel() {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      return saved === '1' || saved === '2' ? Number(saved) as SpoilerLevel : 0
    } catch { return 0 }
  },
  setSpoilerLevel(level) { localStorage.setItem(SETTINGS_KEY, String(level)) },
  getTheme() {
    try { return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark' }
    catch { return 'dark' }
  },
  setTheme(theme) { localStorage.setItem(THEME_KEY, theme) },
}

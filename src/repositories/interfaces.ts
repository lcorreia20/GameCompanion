import type { Game, SpoilerLevel } from '../types'
import type { Progress } from '../storage'

export interface GameRepository {
  list(): Game[]
  get(id: string): Game | undefined
}

export interface ProgressRepository {
  load(): Progress
  save(progress: Progress): void
  recoverFromBackup(progress: Progress): void
  importBackup(text: string): Progress
  exportBackup(progress: Progress): string
  restoreLegacySnapshot(): Progress | null
}

export interface SettingsRepository {
  getSpoilerLevel(): SpoilerLevel
  setSpoilerLevel(level: SpoilerLevel): void
  getTheme(): 'dark' | 'light'
  setTheme(theme: 'dark' | 'light'): void
}

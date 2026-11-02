// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { demo } from '../src/data/demo'
import { pbz } from '../src/data/pbz'
import { makeBackup, STORAGE_KEY } from '../src/storage'
import { INVALID_V2_SNAPSHOT_KEY, LEGACY_SNAPSHOT_KEY, localGameRepository, localProgressRepository, localSettingsRepository, PROGRESS_V2_KEY, THEME_KEY } from '../src/repositories/local'

beforeEach(() => localStorage.clear())

describe('migração sem perda de dados', () => {
  it('lê v1 sem escrever, preserva snapshot bruto e IDs antigos ao salvar v2', () => {
    const old = JSON.stringify({ pbz: ['pbz-prep-goals', 'pbz-old-id'], demo: [demo.items[0].id] })
    localStorage.setItem(STORAGE_KEY, old)
    const imported = localProgressRepository.load()
    expect(imported.pbz).toEqual(['pbz-prep-goals', 'pbz-old-id'])
    expect(localStorage.getItem(PROGRESS_V2_KEY)).toBeNull()
    localProgressRepository.save({ ...imported, pbz: [...imported.pbz, 'trophy-new-id'] })
    expect(localStorage.getItem(STORAGE_KEY)).toBe(old)
    expect(localStorage.getItem(LEGACY_SNAPSHOT_KEY)).toBe(old)
    expect(localProgressRepository.load().pbz).toEqual(['pbz-prep-goals', 'pbz-old-id', 'trophy-new-id'])
    localProgressRepository.save({ ...imported, pbz: [] })
    expect(localStorage.getItem(LEGACY_SNAPSHOT_KEY)).toBe(old)
    expect(localProgressRepository.restoreLegacySnapshot()?.pbz).toEqual(['pbz-prep-goals', 'pbz-old-id'])
  })

  it('importa backups v1 sem confundir marcações demonstrativas com troféus', () => {
    const old = JSON.stringify(makeBackup({ pbz: [pbz.items[0].id], demo: [demo.items[0].id] }))
    const imported = localProgressRepository.importBackup(old)
    expect(imported.pbz).toContain(pbz.items[0].id)
    expect(localProgressRepository.importBackup(localProgressRepository.exportBackup(imported))).toEqual(imported)
  })

  it('importa v2 e rejeita backup maior que 1 MB sem gravar progresso', () => {
    const v2 = JSON.stringify({ format: 'gamecompanion-progress', schemaVersion: 2, catalogVersion: 'pbz-2026-11-01', updatedAt: new Date().toISOString(), completed: { pbz: ['pbz-old-id'], demo: [] } })
    expect(localProgressRepository.importBackup(v2).pbz).toEqual(['pbz-old-id'])
    expect(() => localProgressRepository.importBackup(' '.repeat(1024 * 1024 + 1))).toThrow(/1 MB/)
    expect(localStorage.getItem(PROGRESS_V2_KEY)).toBeNull()
  })

  it('não apaga v2 inválido silenciosamente', () => {
    localStorage.setItem(PROGRESS_V2_KEY, '{')
    expect(() => localProgressRepository.load()).toThrow()
    expect(() => localProgressRepository.save({ pbz: ['pbz-prep-goals'], demo: [] })).toThrow()
    expect(localStorage.getItem(PROGRESS_V2_KEY)).toBe('{')
    localProgressRepository.recoverFromBackup({ pbz: ['pbz-prep-goals'], demo: [] })
    expect(localStorage.getItem(INVALID_V2_SNAPSHOT_KEY)).toBe('{')
    expect(localProgressRepository.load().pbz).toEqual(['pbz-prep-goals'])
    localStorage.setItem(PROGRESS_V2_KEY, '{segundo progresso ilegível')
    localProgressRepository.recoverFromBackup({ pbz: ['novo-id'], demo: [] })
    expect(localStorage.getItem(INVALID_V2_SNAPSHOT_KEY)).toBe('{')
    expect(localStorage.getItem(`${INVALID_V2_SNAPSHOT_KEY}:2`)).toBe('{segundo progresso ilegível')
    expect(localProgressRepository.load().pbz).toEqual(['novo-id'])
  })

  it('mantém demo fora do catálogo e preserva as preferências antigas', () => {
    expect(localGameRepository.list().map(game => game.id)).toEqual(['pbz'])
    localStorage.setItem('gamecompanion:spoiler:v1', '2')
    expect(localSettingsRepository.getSpoilerLevel()).toBe(2)
    localSettingsRepository.setSpoilerLevel(1)
    expect(localSettingsRepository.getSpoilerLevel()).toBe(1)
    expect(localSettingsRepository.getTheme()).toBe('dark')
    localSettingsRepository.setTheme('light')
    expect(localStorage.getItem(THEME_KEY)).toBe('light')
    expect(localSettingsRepository.getTheme()).toBe('light')
  })
})

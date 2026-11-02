import { describe, expect, it } from 'vitest'
import { pbz } from '../src/data/pbz'
import { demo } from '../src/data/demo'
import { makeBackup, normalizeProgress, parseBackup } from '../src/storage'

const games = [pbz, demo]

describe('backups e progresso local', () => {
  it('exporta e importa marcações de jogos diferentes sem misturá-las', () => {
    const original = { [pbz.id]: [pbz.items[0].id], [demo.id]: [demo.items[0].id] }
    expect(parseBackup(JSON.stringify(makeBackup(original)), games)).toEqual(original)
  })

  it('não aceita backup com campo de progresso nulo', () => {
    expect(() => parseBackup(JSON.stringify({
      format: 'gamecompanion-progress', version: 1,
      completed: { [pbz.id]: null },
    }), games)).toThrow()
  })

  it('não aceita dados inválidos ou versões desconhecidas', () => {
    expect(() => parseBackup('{', games)).toThrow()
    expect(() => parseBackup(JSON.stringify({ format: 'gamecompanion-progress', version: 999, completed: {} }), games)).toThrow()
    expect(() => parseBackup(JSON.stringify({ format: 'gamecompanion-progress', version: 1, completed: [] }), games)).toThrow()
  })

  it('mantém IDs antigos para não perder dados em atualizações de guias', () => {
    const previous = { [pbz.id]: [pbz.items[0].id, 'pbz-legacy-stable-id'] }
    expect(normalizeProgress(previous, games)[pbz.id]).toEqual(previous[pbz.id])
  })
})

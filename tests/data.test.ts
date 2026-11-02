import { describe, expect, it } from 'vitest'
import { pbz } from '../src/data/pbz'
import { demo } from '../src/data/demo'
import { pbzGuide } from '../src/data/pbz-guide'

describe('dados de jogos', () => {
  it('mantém identificadores estáveis e únicos para cada tarefa', () => {
    for (const game of [pbz, demo]) {
      const ids = game.items.map(item => item.id)
      expect(ids.every(Boolean)).toBe(true)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('não expõe itens de nível superior na pesquisa essencial', () => {
    const level = 0
    const visible = pbz.items.filter(item => item.spoiler <= level)
    const protectedTitles = pbz.items.filter(item => item.spoiler > level).map(item => item.title)
    expect(protectedTitles.length).toBeGreaterThan(0)
    expect(visible.map(item => item.title)).not.toContain(protectedTitles[0])
  })

  it('não confunde checklists demonstrativos com troféus verificados', () => {
    expect(pbz.items.length).toBeGreaterThan(0)
    expect(Object.keys(pbzGuide).sort()).toEqual(['Coletáveis', 'Missões', 'Perdíveis', 'Troféus'].sort())
    const verifiedIds = Object.values(pbzGuide).flat().map(item => item.id)
    expect(pbz.items.every(item => !verifiedIds.includes(item.id))).toBe(true)
  })
})

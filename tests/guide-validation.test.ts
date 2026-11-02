import { describe, expect, it } from 'vitest'
import { pbzContent } from '../src/data/games/phantom-blade-zero'
import { validateGuide } from '../src/domain/services/validateGuide'

describe('catálogo verificável de Phantom Blade Zero', () => {
  it('cadastra 36 troféus, sete perdíveis e nove áreas do roteiro', () => {
    expect(pbzContent.trophies).toHaveLength(36)
    expect(pbzContent.trophies.filter(item => item.missable)).toHaveLength(7)
    expect(pbzContent.regions).toHaveLength(9)
    expect(pbzContent.trophies.filter(item => item.rarity === 'platinum')).toHaveLength(1)
    for (const rarity of ['platinum', 'gold', 'silver', 'bronze'] as const) {
      expect(pbzContent.trophies.filter(item => item.rarity === rarity)).toHaveLength(pbzContent.metadata.trophyCounts[rarity])
    }
    expect(pbzContent.objectives.filter(item => item.category === 'trophy')).toHaveLength(35)
  })

  it('não possui IDs duplicados, referências inválidas ou ciclos de objetivos', () => {
    expect(validateGuide(pbzContent)).toEqual([])
  })

  it('reutiliza o mesmo ID de etapas de missão entre regiões e mantém passo rastreável', () => {
    const multiRegion = pbzContent.quests.filter(quest => quest.regionIds.length > 1)
    expect(multiRegion.length).toBeGreaterThan(0)
    for (const quest of multiRegion) {
      for (const step of quest.steps) {
        const objectives = pbzContent.objectives.filter(item => item.relatedStepIds?.includes(step.id))
        expect(objectives).toHaveLength(1)
        expect(objectives[0].questId).toBe(quest.id)
      }
    }
  })

  it('detecta referência inválida e ciclo de dependências', () => {
    const [first, second] = pbzContent.objectives
    const altered = { ...pbzContent, objectives: [
      { ...first, dependsOnIds: [second.id], relatedTrophyIds: ['trofeu-inexistente'] },
      { ...second, dependsOnIds: [first.id] },
      ...pbzContent.objectives.slice(2),
    ] }
    expect(validateGuide(altered)).toEqual(expect.arrayContaining([
      expect.stringContaining('troféu inexistente'),
      expect.stringContaining('dependência circular'),
    ]))
  })

  it('respeita ações críticas antes dos pontos de perda e dos dez contos antes de Mirage', () => {
    const byId = new Map(pbzContent.objectives.map(item => [item.id, item]))
    const before = (first: string, second: string) => {
      const earlier = byId.get(first)!
      const later = byId.get(second)!
      expect(earlier, `${first} ausente`).toBeDefined()
      expect(later, `${second} ausente`).toBeDefined()
      expect(earlier.order, `${first} deve preceder ${second}`).toBeLessThan(later.order)
      expect(later.dependsOnIds, `${second} deve depender de ${first}`).toContain(first)
    }
    before('quest-mercy-return', 'boss-bai-chilian')
    before('quest-baishan-accept', 'boss-bai-chilian')
    before('quest-baishan-body', 'boss-yubi')
    before('quest-apprentice-return', 'boss-jing-ye')
    const gate = byId.get('ending-mirage-gate')!
    const requiredTales = pbzContent.trophies.find(t => t.id === 'with-heart-and-blood')!.questIds!
      .filter(id => id !== 'bloodline-awakening')
    expect(requiredTales).toHaveLength(10)
    for (const questId of requiredTales) {
      const taleSteps = pbzContent.objectives.filter(item => item.questId === questId)
      expect(taleSteps.length, questId).toBeGreaterThan(0)
      for (const step of taleSteps) expect(step.order, step.id).toBeLessThan(gate.order)
    }
  })
})

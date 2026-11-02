import { describe, expect, it } from 'vitest'
import { pbzContent } from '../src/data/games/phantom-blade-zero'
import { optionalExplorationProgress, platinumProgress, regionProgress, requiredObjectivesProgress } from '../src/domain/services/progress'

describe('contadores independentes da platina', () => {
  it('conta somente 35 troféus-base, sem somar subtarefas ou opcionais', () => {
    const trophy = pbzContent.objectives.find(item => item.category === 'trophy')!
    const task = pbzContent.objectives.find(item => item.requiredForPlatinum && item.category !== 'trophy')!
    const completed = new Set([trophy.id, task.id, 'id-legado-desconhecido'])
    expect(platinumProgress(pbzContent, completed)).toEqual({ done: 1, total: 35, percent: 3 })
    expect(requiredObjectivesProgress(pbzContent, completed).done).toBe(1)
    expect(platinumProgress(pbzContent, new Set()).percent).toBe(0)
  })

  it('usa a mesma marcação quando um objetivo pertence a duas regiões', () => {
    const shared = pbzContent.objectives.find(item => item.requiredForPlatinum && item.category !== 'trophy' && item.regionIds.length > 1)!
    expect(shared).toBeDefined()
    for (const regionId of shared.regionIds) {
      expect(regionProgress(pbzContent, regionId, new Set([shared.id])).done).toBe(1)
    }
    expect(requiredObjectivesProgress(pbzContent, new Set([shared.id])).done).toBe(1)
  })

  it('não deixa exploração opcional alterar o progresso da platina', () => {
    const optional = pbzContent.objectives.find(item => !item.requiredForPlatinum)!
    expect(optionalExplorationProgress(pbzContent, new Set([optional.id])).done).toBe(1)
    expect(platinumProgress(pbzContent, new Set([optional.id])).done).toBe(0)
  })
})

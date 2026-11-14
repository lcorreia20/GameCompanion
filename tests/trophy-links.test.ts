import { describe, expect, it } from 'vitest'
import { pbzContent as guide } from '../src/data/games/phantom-blade-zero'
import { platinumProgress } from '../src/domain/services/progress'
import { toggleLinkedObjective, trophyRequirements } from '../src/domain/services/trophyLinks'

const links = trophyRequirements(guide)
const toggle = (done: ReadonlySet<string>, id: string) => toggleLinkedObjective(guide, done, id)

describe('marcações vinculadas aos troféus', () => {
  it('conclui um troféu após seu chefe e mantém a platina contabilizada uma só vez', () => {
    const done = toggle(new Set(), 'boss-peng-meng')
    expect(done.has('trophy-axes-grudge')).toBe(true)
    expect(platinumProgress(guide, done).done).toBe(1)
    expect(done.has('trophy-scarlet-wraithblade')).toBe(false)
  })

  it('exige todos os chefes para troféus conjuntos, independentemente da ordem', () => {
    const bosses = links.get('trophy-four-freed')!
    expect(bosses.sort()).toEqual(['boss-yuzan', 'boss-yubi', 'boss-yuding', 'boss-yucong'].sort())
    let done = new Set<string>()
    for (const id of bosses.slice(0, -1)) done = toggle(done, id)
    expect(done.has('trophy-four-freed')).toBe(false)
    done = toggle(done, bosses.at(-1)!)
    expect(done.has('trophy-four-freed')).toBe(true)
    done = toggle(done, bosses[0])
    expect(done.has('trophy-four-freed')).toBe(false)
  })

  it('marca todas as etapas de todas as missões ao marcar seu troféu, sem marcar troféus vizinhos', () => {
    const id = 'trophy-healers-legacy'
    const requirements = links.get(id)!
    expect(requirements.length).toBeGreaterThan(8)
    expect(requirements).toContain('quest-lily-yuer')
    expect(requirements).toContain('quest-mercy-return')
    const done = toggle(new Set(['id-legado']), id)
    expect(requirements.every(requiredId => done.has(requiredId))).toBe(true)
    expect(done.has('id-legado')).toBe(true)
    expect(done.has('trophy-shattered-mirror')).toBe(false)
    expect(done.has('boss-hua-bride')).toBe(false) // encontro relacionado, já coberto por etapa da missão
    const unchecked = toggle(done, id)
    expect(unchecked.has(id)).toBe(false)
    expect(requirements.every(requiredId => unchecked.has(requiredId))).toBe(true)
  })

  it('não libera troféu de três missões antes de todas as etapas; revoga ao desfazer uma delas', () => {
    const requirements = links.get('trophy-healers-legacy')!
    let done = new Set<string>()
    for (const id of requirements.slice(0, -1)) done = toggle(done, id)
    expect(done.has('trophy-healers-legacy')).toBe(false)
    done = toggle(done, requirements.at(-1)!)
    expect(done.has('trophy-healers-legacy')).toBe(true)
    done = toggle(done, requirements[0])
    expect(done.has('trophy-healers-legacy')).toBe(false)
    expect(done.has(requirements[1])).toBe(true)
  })

  it('não presume que somente os contos concedem o final verdadeiro e não exige o portão para o troféu do lago', () => {
    const ending = links.get('trophy-with-heart-and-blood')!
    expect(ending).toContain('ending-mirage-gate')
    expect(ending).toContain('ending-last-chance')
    expect(ending).toContain('boss-meng-hua')
    expect(links.get('trophy-forbidden-arts')).not.toContain('ending-mirage-gate')
    let done = new Set<string>()
    for (const id of ending.filter(id => id !== 'ending-last-chance')) done = toggle(done, id)
    expect(done.has('trophy-with-heart-and-blood')).toBe(false)
    done = toggle(done, 'ending-last-chance')
    expect(done.has('trophy-with-heart-and-blood')).toBe(true)
  })

  it('mantém troféus sem subtarefas completas verificáveis como marcação manual', () => {
    expect(guide.trophies.filter(item => item.rarity !== 'platinum' && !links.has(`trophy-${item.id}`)).map(item => item.id).sort()).toEqual([
      'hearts-journey', 'tempered-ten', 'overwhelming-force', 'phantom-arsenal', 'skill-strength',
    ].sort())
    expect(links.has('trophy-tempered-ten')).toBe(false)
    expect(links.has('trophy-phantom-arsenal')).toBe(false)
    const done = toggle(new Set(), 'trophy-tempered-ten')
    expect([...done]).toEqual(['trophy-tempered-ten'])
  })
})

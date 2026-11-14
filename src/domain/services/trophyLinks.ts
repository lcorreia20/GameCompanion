import type { PhantomBladeZeroContent } from '../models/guide'

/** Apenas requisitos rastreáveis suficientes para conceder um troféu; referências de
 * "relacionado" e bloqueios de segurança não são necessariamente requisitos. */
export function trophyRequirements(guide: PhantomBladeZeroContent): Map<string, string[]> {
  const objectives = new Set(guide.objectives.map(item => item.id))
  const links = new Map<string, string[]>()
  for (const trophy of guide.trophies) {
    if (trophy.rarity === 'platinum') continue
    const requirements = new Set<string>()
    if (trophy.questIds?.length) {
      for (const questId of trophy.questIds) {
        for (const item of guide.objectives.filter(objective => objective.questId === questId)) requirements.add(item.id)
      }
    }
    // Chefes que apenas participam de uma missão não são requisitos adicionais de
    // seu troféu: as etapas da missão já representam a conclusão dela.
    if (!trophy.questIds?.length || trophy.id === 'with-heart-and-blood') {
      for (const boss of guide.bosses.filter(item => item.trophyIds.includes(trophy.id))) {
        if (objectives.has(`boss-${boss.id}`)) requirements.add(`boss-${boss.id}`)
      }
    }
    if (trophy.id === 'with-heart-and-blood') {
      requirements.add('ending-mirage-gate')
      requirements.add('ending-last-chance')
    }
    if (trophy.id === 'every-flower') requirements.add('collectible-memory-flowers-10')
    if (trophy.id === 'collectors-notes') requirements.add('collectible-accessories-30')
    if (requirements.size && [...requirements].every(id => objectives.has(id))) links.set(`trophy-${trophy.id}`, [...requirements])
  }
  return links
}

/** Marca o troféu quando todos os requisitos documentados forem concluídos.
 * Marcar o troféu conclui os requisitos; desmarcá-lo não apaga trabalho prévio.
 * Desmarcar um requisito revoga os troféus que dependem dele. */
export function toggleLinkedObjective(guide: PhantomBladeZeroContent, completed: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(completed)
  if (!guide.objectives.some(item => item.id === id)) return next
  const links = trophyRequirements(guide)
  if (next.has(id)) {
    next.delete(id)
    for (const [trophyId, requirements] of links) if (requirements.includes(id)) next.delete(trophyId)
  } else {
    next.add(id)
    const added = new Set([id])
    for (const requiredId of links.get(id) ?? []) { next.add(requiredId); added.add(requiredId) }
    for (const [trophyId, requirements] of links) {
      if (requirements.some(requiredId => added.has(requiredId)) && requirements.every(requiredId => next.has(requiredId))) next.add(trophyId)
    }
  }
  return next
}

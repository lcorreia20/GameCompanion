import type { PhantomBladeZeroContent } from '../models/guide'

export interface Count { done: number; total: number; percent: number }

function count(ids: Iterable<string>, completed: ReadonlySet<string>): Count {
  const unique = [...new Set(ids)]
  const done = unique.filter(id => completed.has(id)).length
  return { done, total: unique.length, percent: unique.length ? Math.round(done / unique.length * 100) : 0 }
}

/** A platina exige 35 troféus-base; etapas e coletáveis são acompanhados à parte. */
export function platinumProgress(guide: PhantomBladeZeroContent, completed: ReadonlySet<string>): Count {
  const trophies = new Set(guide.trophies.filter(trophy => trophy.rarity !== 'platinum').map(trophy => trophy.id))
  return count(guide.objectives.filter(objective => objective.category === 'trophy' && objective.relatedTrophyIds.some(id => trophies.has(id))).map(objective => objective.id), completed)
}

/** Objetivos únicos por ID, excluindo os objetivos-troféu para não inflar subtarefas. */
export function requiredObjectivesProgress(guide: PhantomBladeZeroContent, completed: ReadonlySet<string>): Count {
  return count(guide.objectives.filter(objective => objective.requiredForPlatinum && objective.category !== 'trophy').map(objective => objective.id), completed)
}

export function regionProgress(guide: PhantomBladeZeroContent, regionId: string, completed: ReadonlySet<string>): Count {
  return count(guide.objectives.filter(objective => objective.regionIds.includes(regionId) && objective.requiredForPlatinum && objective.category !== 'trophy').map(objective => objective.id), completed)
}

export function optionalExplorationProgress(guide: PhantomBladeZeroContent, completed: ReadonlySet<string>): Count {
  return count(guide.objectives.filter(objective => !objective.requiredForPlatinum).map(objective => objective.id), completed)
}

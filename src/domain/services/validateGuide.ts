import type { PhantomBladeZeroContent } from '../models/guide'

/** Erros estruturais são reportados antes de expor alterações do catálogo ao usuário. */
export function validateGuide(guide: PhantomBladeZeroContent): string[] {
  const errors: string[] = []
  const regionIds = new Set(guide.regions.map(region => region.id))
  const trophyIds = new Set(guide.trophies.map(trophy => trophy.id))
  const questIds = new Set(guide.quests.map(quest => quest.id))
  const stepIds = new Set(guide.quests.flatMap(quest => quest.steps.map(step => step.id)))
  const objectiveIds = new Set(guide.objectives.map(objective => objective.id))
  const sourceIds = new Set(guide.sources.map(source => source.id))
  const sourceUrls = new Set(guide.sources.map(source => source.url))

  for (const [name, entries] of [
    ['região', guide.regions], ['troféu', guide.trophies], ['missão', guide.quests],
    ['etapa', guide.quests.flatMap(quest => quest.steps)], ['coletável', guide.collectibles],
    ['chefe', guide.bosses], ['objetivo', guide.objectives], ['fonte', guide.sources],
  ] as const) {
    const seen = new Set<string>()
    for (const entry of entries) {
      if (!entry.id || seen.has(entry.id)) errors.push(`${name}: ID vazio ou duplicado ${entry.id}`)
      seen.add(entry.id)
    }
  }

  const checkSources = (name: string, urls: string[]) => {
    if (!urls?.length) errors.push(`${name}: fonte ausente`)
    for (const url of urls ?? []) if (!sourceUrls.has(url)) errors.push(`${name}: fonte não cadastrada ${url}`)
  }
  const checkRegions = (name: string, ids: string[]) => {
    for (const id of ids) if (!regionIds.has(id)) errors.push(`${name}: região inexistente ${id}`)
  }

  for (const source of guide.sources) if (!/^https:\/\//.test(source.url)) errors.push(`fonte: URL insegura ${source.id}`)
  for (const region of guide.regions) {
    if (!region.name || !Number.isFinite(region.order)) errors.push(`região ${region.id}: dados obrigatórios ausentes`)
    if (region.parentId && !regionIds.has(region.parentId)) errors.push(`região ${region.id}: parent inexistente`)
    checkSources(`região ${region.id}`, region.sourceUrls)
  }
  for (const trophy of guide.trophies) {
    if (!trophy.name || !trophy.requirement) errors.push(`troféu ${trophy.id}: identificação/requisito ausente`)
    checkRegions(`troféu ${trophy.id}`, trophy.regionIds)
    for (const id of trophy.questIds ?? []) if (!questIds.has(id)) errors.push(`troféu ${trophy.id}: missão inexistente ${id}`)
    checkSources(`troféu ${trophy.id}`, trophy.sourceUrls)
  }
  for (const quest of guide.quests) {
    if (!quest.name || !quest.steps.length) errors.push(`missão ${quest.id}: identificação/etapas ausentes`)
    checkRegions(`missão ${quest.id}`, quest.regionIds)
    checkSources(`missão ${quest.id}`, quest.sourceUrls)
    for (const step of quest.steps) {
      if (!step.description) errors.push(`etapa ${step.id}: descrição ausente`)
      if (step.regionId) checkRegions(`etapa ${step.id}`, [step.regionId])
      checkSources(`etapa ${step.id}`, step.sourceUrls)
    }
  }
  for (const collectible of guide.collectibles) {
    if (!collectible.name || !collectible.purpose) errors.push(`coletável ${collectible.id}: dados obrigatórios ausentes`)
    if (collectible.regionId) checkRegions(`coletável ${collectible.id}`, [collectible.regionId])
    checkSources(`coletável ${collectible.id}`, collectible.sourceUrls)
  }
  for (const boss of guide.bosses) {
    if (!boss.name) errors.push(`chefe ${boss.id}: nome ausente`)
    checkRegions(`chefe ${boss.id}`, [boss.regionId])
    for (const id of boss.trophyIds) if (!trophyIds.has(id)) errors.push(`chefe ${boss.id}: troféu inexistente ${id}`)
    checkSources(`chefe ${boss.id}`, boss.sourceUrls)
  }
  const edges = new Map<string, string[]>()
  for (const objective of guide.objectives) {
    if (!objective.title || !objective.description || !Array.isArray(objective.regionIds)) errors.push(`objetivo ${objective.id}: campos obrigatórios ausentes`)
    checkRegions(`objetivo ${objective.id}`, objective.regionIds)
    for (const id of objective.relatedTrophyIds) if (!trophyIds.has(id)) errors.push(`objetivo ${objective.id}: troféu inexistente ${id}`)
    for (const id of objective.sourceIds) if (!sourceIds.has(id)) errors.push(`objetivo ${objective.id}: fonte inexistente ${id}`)
    if (objective.questId && !questIds.has(objective.questId)) errors.push(`objetivo ${objective.id}: missão inexistente ${objective.questId}`)
    for (const id of objective.relatedStepIds ?? []) if (!stepIds.has(id)) errors.push(`objetivo ${objective.id}: etapa inexistente ${id}`)
    const deps = objective.dependsOnIds ?? []
    edges.set(objective.id, deps)
    for (const id of deps) if (!objectiveIds.has(id)) errors.push(`objetivo ${objective.id}: dependência inexistente ${id}`)
    checkSources(`objetivo ${objective.id}`, objective.sourceUrls)
  }
  const visiting = new Set<string>()
  const visited = new Set<string>()
  function walk(id: string): void {
    if (visiting.has(id)) { errors.push(`dependência circular: ${id}`); return }
    if (visited.has(id)) return
    visiting.add(id)
    for (const next of edges.get(id) ?? []) if (objectiveIds.has(next)) walk(next)
    visiting.delete(id)
    visited.add(id)
  }
  for (const id of objectiveIds) walk(id)
  return errors
}

import type { Objective } from './types'
import { regions } from './regions'
import { quests } from './quests'
import { bosses } from './bosses'
import { trophies } from './trophies'
import { collectibles } from './collectibles'
import { sources } from './sources'
import { sourceUrls as s } from './sources'

const sourceIdByUrl = new Map(sources.map(source => [source.url, source.id]))
const regionOrder = new Map(regions.map(region => [region.id, region.order]))
const refs = (sourceUrls: string[]) => ({ sourceUrls, sourceIds: [...new Set(sourceUrls.map(url => sourceIdByUrl.get(url)).filter((id): id is string => !!id))] })
const order = (regionIds: string[], ordinal = 0) => (regionIds.length ? Math.min(...regionIds.map(id => regionOrder.get(id) ?? 10)) : 9) * 1000 + ordinal
const questTrophies = (id: string) => trophies.filter(trophy => trophy.questIds?.includes(id)).map(trophy => trophy.id)
const trueEndingBeforeMirage = ['deep-valley', 'illusion-inanis', 'sha-chi-boat', 'allure-vanity', 'illusory-pipa', 'pillars-kunlun', 'whence-weeping', 'heralds-illusion', 'crimson-manor', 'secrets-lake'] as const
const mirageDependencies = trueEndingBeforeMirage.map(id => id === 'secrets-lake' ? 'quest-secrets-lake-complete' : `quest-${id}-before-mirage`)
const prerequisites: Record<string, string[]> = {
  'mindseal-stone-1': ['quest-mindseal-accept'], 'mindseal-stone-2': ['quest-mindseal-stone-1'], 'mindseal-stone-3': ['quest-mindseal-stone-2'],
  'apprentice-return': ['quest-apprentice-vine', 'quest-apprentice-leaf', 'quest-apprentice-goldweed'],
  'lily-pickup': ['quest-lily-start'], 'lily-yuer': ['quest-lily-pickup'], 'lily-pangzhen': ['quest-lily-yuer'],
  'mercy-return': ['quest-mercy-small-cave', 'quest-mercy-large-cave', 'quest-mercy-lodge', 'quest-mercy-dungeon'],
  'baishan-cellar': ['quest-baishan-accept'], 'baishan-body': ['quest-baishan-cellar'], 'baishan-yubi': ['quest-baishan-body'],
  'journey-return': ['quest-journey-accept'], 'journey-house': ['quest-journey-return'], 'journey-finish': ['quest-journey-house'],
  'lan-return': ['quest-lan-accept'], 'lan-key': ['quest-lan-return'], 'lan-rest': ['quest-lan-key'], 'lan-manor': ['quest-lan-rest'],
}
const knownLocations: Record<string, string> = {
  'mindseal-accept': 'Valley Sha-Chi Tower Summit', 'apprentice-start': 'Outpost',
  'mercy-accept': 'Thieves’ Camp', 'baishan-accept': 'Ponte perto de Thieves’ Camp',
  'journey-accept': 'Old Man Gen’s Hideout', 'lan-accept': 'Young Master Lan’s Hideout',
}

// Todos os passos rastreáveis têm ID estável derivado do ID publicado da missão.
const questObjectives: Objective[] = quests.flatMap((quest, questIndex) => quest.steps.map((item, stepIndex) => {
  const regionIds = item.regionId ? [item.regionId] : quest.regionIds
  const sourceUrls = [...new Set([...item.sourceUrls, ...quest.sourceUrls])]
  return {
    id: `quest-${item.id}`, title: quest.name, description: item.description,
    category: quest.id === 'bloodline-awakening' || quest.id === 'secrets-lake' || ['deep-valley', 'illusion-inanis', 'sha-chi-boat', 'allure-vanity', 'illusory-pipa', 'pillars-kunlun', 'whence-weeping', 'heralds-illusion', 'crimson-manor'].includes(quest.id) ? 'ending' : 'quest',
    regionIds, requiredForPlatinum: quest.requiredForPlatinum, optional: true,
    missable: quest.missable, spoiler: 1, relatedTrophyIds: questTrophies(quest.id),
    ...refs(sourceUrls), status: 'pending',
    // O guia de final não atribui região aos nove primeiros contos: colocar na revisão
    // pré-Mirage, sem criar local fictício nem empurrá-los para depois do bloqueio.
    order: trueEndingBeforeMirage.includes(quest.id as typeof trueEndingBeforeMirage[number]) && regionIds.length === 0
      ? 7900 + questIndex : order(regionIds, questIndex * 25 + stepIndex), questId: quest.id,
    relatedQuestIds: [quest.id], relatedStepIds: [item.id],
    verification: item.description.includes('não detalha') ? 'partial' : 'verified',
    ...(prerequisites[item.id] ? { dependsOnIds: prerequisites[item.id] } : {}),
    ...(knownLocations[item.id] ? { location: knownLocations[item.id] } : {}),
    ...(item.before ? { missableBefore: item.before } : {}),
    ...(item.before ? { before: item.before } : {}),
  }
}))

const bossObjectives: Objective[] = bosses.map((boss, index) => ({
  id: `boss-${boss.id}`, title: `Derrotar ${boss.name}`, description: boss.storyRequired ? 'Encontro obrigatório da história.' : 'Encontro opcional para avançar na história; confira os troféus relacionados.',
  category: 'boss', regionIds: [boss.regionId], requiredForPlatinum: boss.storyRequired || boss.trophyIds.length > 0,
  optional: !boss.storyRequired, missable: false, spoiler: 2, relatedTrophyIds: boss.trophyIds,
  ...refs(boss.sourceUrls), status: 'pending',
  // Os dois chefes encerram janelas documentadas de missões: nunca apresentá-los
  // antes dos passos que falhariam caso fossem derrotados.
  order: order([boss.regionId], ['bai-chilian', 'yubi'].includes(boss.id) ? 750 + index : 300 + index),
  ...(boss.id === 'jing-ye' ? { dependsOnIds: ['quest-apprentice-return'] } : {}),
  ...(boss.id === 'bai-chilian' ? { dependsOnIds: ['quest-mercy-return', 'quest-baishan-accept', 'quest-lily-yuer'] } : {}),
  ...(boss.id === 'yubi' ? { dependsOnIds: ['quest-baishan-body'] } : {}),
  verification: 'verified',
}))

const collectibleTrophies: Record<string, string[]> = {
  'twin-flesh-lilies': ['healers-legacy'], 'blood-stopper-vine': ['healers-legacy'], congealeaf: ['healers-legacy'], 'blemish-goldweed': ['healers-legacy'],
  'sha-chi-crank': ['spectral-blade'], 'primal-stone': ['spectral-blade'], 'cellar-crank': ['last-baishan'], 'chamber-crank': ['last-baishan'],
  'dungeon-key': ['healers-legacy'], 'gen-key': ['together-end'], 'lan-manor-key': ['wanderers-honor'], 'firefly-flower': ['forbidden-arts'],
  'quick-treasures': ['lost-found'], 'memory-flowers-10': ['every-flower'], 'accessories-30': ['collectors-notes'],
}
const collectibleObjectives: Objective[] = collectibles.map((item, index) => ({
  id: `collectible-${item.id}`, title: item.name, description: item.purpose,
  category: 'collectible', regionIds: item.regionId ? [item.regionId] : [], requiredForPlatinum: item.requiredForPlatinum,
  optional: true, missable: ['twin-flesh-lilies', 'blood-stopper-vine', 'congealeaf', 'blemish-goldweed', 'gen-key'].includes(item.id),
  spoiler: 1, relatedTrophyIds: collectibleTrophies[item.id] ?? [], ...refs(item.sourceUrls), status: 'pending',
  verification: item.id === 'quick-treasures' ? 'partial' : 'verified',
  ...(item.id === 'quick-treasures' ? { notes: 'Roteiro soma 17 entregas; guia 100% contabiliza 16 tesouros. Contagens não reconciliadas.' } : {}),
  order: order(item.regionId ? [item.regionId] : [], 650 + index),
}))

// Um objetivo final por troféu, além das etapas detalhadas onde o guia as documenta.
const trophyObjectives: Objective[] = trophies.filter(trophy => trophy.rarity !== 'platinum').map((trophy, index) => ({
  id: `trophy-${trophy.id}`, title: trophy.name, description: trophy.requirement,
  category: 'trophy', regionIds: trophy.regionIds,
  requiredForPlatinum: true, optional: !['hearts-journey', 'axes-grudge', 'the-hunt', 'thousand-cups', 'shattered-mirror', 'meet-again', 'lions-spirit', 'return-dust', 'saw-through', 'dreams-end', 'three-wardens'].includes(trophy.id),
  missable: trophy.missable, spoiler: trophy.regionIds.length ? 2 : 1,
  relatedTrophyIds: [trophy.id], relatedQuestIds: trophy.questIds ?? [], ...refs(trophy.sourceUrls), status: 'pending', order: order(trophy.regionIds, 800 + index), verification: 'verified',
}))

const catalog: Objective[] = [
  ...questObjectives, ...bossObjectives, ...collectibleObjectives,
  {
    id: 'ending-mirage-gate', title: 'Verificar os dez contos roxos antes de Mirage Estate',
    description: 'Após reunir os itens das casas White, Black e Red Serpent, confira os dez contos roxos antes de cruzar a Green Serpent House; o jogo avisa se faltarem requisitos.',
    category: 'ending', regionIds: ['pangzhen', 'mirage'], requiredForPlatinum: true, optional: true,
    missable: true, spoiler: 2, relatedTrophyIds: ['with-heart-and-blood', 'forbidden-arts'],
    relatedQuestIds: [...trueEndingBeforeMirage], dependsOnIds: mirageDependencies,
    ...refs([s.ending]), status: 'pending', order: 7950, before: 'Antes de entrar em Mirage Estate.', missableBefore: 'Entrada de Mirage Estate', verification: 'verified',
  },
  {
    id: 'ending-last-chance', title: 'Conferir final verdadeiro no sino The Last Chance',
    description: 'Concluir Bloodline Awakening e os demais requisitos antes da arena final; após Meng Hua, o chefe do final verdadeiro aparece se os requisitos estiverem completos.',
    category: 'ending', regionIds: ['soulrend'], requiredForPlatinum: true, optional: true,
    missable: true, spoiler: 2, relatedTrophyIds: ['with-heart-and-blood'],
    ...refs([s.ending]), status: 'pending', order: 9050, before: 'Antes da arena final em Mount Soulrend.', missableBefore: 'Sino The Last Chance em Mount Soulrend', verification: 'verified',
  },
  ...trophyObjectives,
]

export const objectives: Objective[] = catalog.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))

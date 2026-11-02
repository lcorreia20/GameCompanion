/** Contrato público do catálogo Phantom Blade Zero; progresso é mantido fora deste módulo. */
export type SourceRef = { id: string; url: string; title: string }
export type Reference = { sourceUrls: string[] }
export type Region = Reference & { id: string; name: string; order: number; parentId?: string; aliases?: string[] }
export type Trophy = Reference & { id: string; name: string; requirement: string; rarity: 'platinum' | 'gold' | 'silver' | 'bronze'; missable: boolean; regionIds: string[]; questIds?: string[] }
export type QuestStep = Reference & { id: string; description: string; regionId?: string; before?: string }
export type Quest = Reference & { id: string; name: string; regionIds: string[]; requiredForPlatinum: boolean; missable: boolean; steps: QuestStep[] }
export type Collectible = Reference & { id: string; name: string; regionId?: string; purpose: string; requiredForPlatinum: boolean; quantity?: number }
export type Boss = Reference & { id: string; name: string; regionId: string; storyRequired: boolean; trophyIds: string[] }
export type ObjectiveCategory = 'story' | 'trophy' | 'quest' | 'boss' | 'collectible' | 'ending' | 'upgrade'
export type Objective = Reference & {
  id: string
  title: string
  description: string
  category: ObjectiveCategory
  regionIds: string[]
  requiredForPlatinum: boolean
  optional: boolean // Opcional para a história; pode ser obrigatório para a platina.
  missable: boolean
  spoiler: 0 | 1 | 2
  relatedTrophyIds: string[]
  sourceIds: string[]
  status: 'pending'
  order: number
  questId?: string
  before?: string
  dependsOnIds?: string[]
  relatedQuestIds?: string[]
  relatedStepIds?: string[]
  location?: string
  notes?: string
  verification: 'verified' | 'partial' | 'unverified'
  missableBefore?: string
}
export type GuideMetadata = Reference & {
  id: string
  contentVersion: string
  name: string
  platform: string
  releaseDate: string
  verifiedAt: string
  trophyCounts: { platinum: number; gold: number; silver: number; bronze: number; total: number; missable: number }
  estimates: { platinumHours: string; difficultyEasy: string; difficultyNormal: string; minimumPlaythroughs: string }
  onlineTrophies: number
  difficultyTrophies: boolean
  trueEndingRequired: boolean
  caveats: string[]
}
export type PhantomBladeZeroContent = {
  metadata: GuideMetadata
  regions: Region[]
  trophies: Trophy[]
  quests: Quest[]
  collectibles: Collectible[]
  bosses: Boss[]
  objectives: Objective[]
  sources: SourceRef[]
}

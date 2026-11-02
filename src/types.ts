export type SpoilerLevel = 0 | 1 | 2
export type Stage = 'Preparação' | 'Exploração' | 'Revisão'

export interface ChecklistItem {
  id: string
  title: string
  description: string
  stage: Stage
  spoiler: SpoilerLevel
}

export interface Game {
  id: string
  title: string
  subtitle: string
  initials: string
  accent: 'lime' | 'violet'
  kind: 'unverified' | 'demo'
  verified?: {
    source: string
    checkedAt: string
    facts: string[]
  }
  items: ChecklistItem[]
}

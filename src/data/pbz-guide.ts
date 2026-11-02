// Listas oficiais ainda não verificadas. Ausência de registros NÃO significa
// que o jogo não possua troféus, perdíveis, coletáveis ou missões.
export interface GuideEntry {
  id: string
  name: string
  category: string
  region?: string
  description?: string
  spoiler: 0 | 1 | 2
}

export const pbzGuide: Record<'Troféus' | 'Perdíveis' | 'Coletáveis' | 'Missões', GuideEntry[]> = {
  Troféus: [],
  Perdíveis: [],
  Coletáveis: [],
  Missões: [],
}

// Nomes PSN PT-BR publicados no Exophase, na ordem dos IDs do catálogo.
// Fonte: https://www.exophase.com/game/phantom-blade-zero-psn/trophies/pt-BR/
// A lista é uma fonte secundária de dados PSN; sem captura do console não afirmamos conferência visual no aparelho.
export const trophyNamesPtBR: Record<string, string> = {
  'defy-destiny': 'Desafie o Destino',
  'hearts-journey': 'A Jornada do Coração',
  'with-heart-and-blood': 'Sangue e Coração',
  'axes-grudge': 'Rancor do Machado',
  'scarlet-wraithblade': 'Lâmina Espectral Escarlate',
  'the-hunt': 'O Carrasco',
  'thousand-cups': 'Mil Brindes até o Fim',
  'shattered-mirror': 'Espelho Estilhaçado',
  'meet-again': 'Será que nos Reencontraremos?',
  'lions-spirit': 'O Espírito do Leão Perdura',
  'seven-stars': 'Lâmina Contra as Sete Estrelas',
  'crossroads-blood': 'Encruzilhada de Sangue',
  'nothing-waste': 'Nada Será Desperdiçado',
  'return-dust': 'Tudo Retorna às Cinzas',
  'white-shadow': 'A Sombra Branca',
  'saw-through': 'Serrando até o Fim',
  'dreams-end': 'Todo Sonho Chega ao Fim',
  'misty-waters': 'Mestre das Águas Nebulosas',
  'four-freed': 'Quatro Libertas',
  'two-blade-masters': 'Dois Mestres da Lâmina',
  'three-wardens': 'Queda dos Três Guardiões',
  'forbidden-arts': 'Artes Proibidas Sob o Lago',
  'phantom-and-blade': 'Fantasma e Lâmina',
  'last-baishan': 'A Última de Baishan',
  'together-end': 'Para Sempre Juntos',
  'wanderers-honor': 'A Honra de um Andarilho',
  'spectral-blade': 'Lâmina Espectral',
  'healers-legacy': 'Legado da Curandeira',
  'lost-found': 'Achados e Perdidos',
  'trees-sorrow': 'Até as Árvores Conhecem a Tristeza',
  'tempered-ten': 'Dez Temperadas',
  'overwhelming-force': 'Poder Esmagador',
  'every-flower': 'Ouça Cada Flor',
  'collectors-notes': 'Notas do Colecionador',
  'phantom-arsenal': 'Arsenal Fantasma',
  'skill-strength': 'Habilidade Sobre a Força',
}

// Nomes de missões citados literalmente nas descrições PT-BR dos troféus PSN.
export const questNamesPtBR: Record<string, string> = {
  'secrets-lake': 'Segredos no Coração do Lago',
  'bloodline-awakening': 'Despertar da Linhagem',
  'secrets-baishan': 'Mistérios de Baishan',
  'journey-home': 'Regresso a Casa',
  'young-master-lan': 'Jovem Mestre Lan',
  'severed-mindseal': 'Selo Mental Partido',
  'flesh-lily': 'Lírio Carnal',
  'apprentice-healer': 'Curandeira Aprendiz',
  'healers-mercy': 'Misericórdia da Cura',
  'quick-hands-requests': 'Pedidos de Zhang Ligeiro',
  'heart-banyan': 'Coração Banyan',
}

// MetaBot apresenta estes nomes em PT-BR como dados do jogo; confirmação visual no console pendente.
// https://metabot.gg/pt_BR/phantom-blade-zero/regions
export const regionNamesPtBR: Record<string, string> = {
  weeping: 'Vale do Córrego dos Prantos',
  crimson: 'Floresta Carmesim',
  village: 'Vilarejo de Lu',
  pangzhen: 'Pangzhen',
  mandate: 'Acampamento da Irmandade',
  meigu: 'Lago Meigu',
  mountain: 'Montanha do Cárcere',
  mirage: 'Mansão Onírica',
  soulrend: 'Montanha da Alma Dilacerada',
}

export type Language = 'pt-BR' | 'en'

export function gameName(kind: 'trophy' | 'quest' | 'region', id: string, english: string, language: Language): string {
  if (language === 'en') return english
  return (kind === 'trophy' ? trophyNamesPtBR : kind === 'quest' ? questNamesPtBR : regionNamesPtBR)[id] ?? english
}

import { sourceUrls as s } from './sources'

export const metadata = {
  id: 'phantom-blade-zero',
  contentVersion: '2026.11.02.1',
  name: 'Phantom Blade Zero',
  platform: 'PS5',
  releaseDate: '2026-10-29',
  verifiedAt: '2026-11-01',
  trophyCounts: { platinum: 1, gold: 3, silver: 14, bronze: 18, total: 36, missable: 7 },
  estimates: { platinumHours: '30–40 horas (estimativa PowerPyx)', difficultyEasy: '4/10 (estimativa PowerPyx)', difficultyNormal: '6/10 (estimativa PowerPyx)', minimumPlaythroughs: '1 (guia PowerPyx)' },
  onlineTrophies: 0,
  difficultyTrophies: false,
  trueEndingRequired: true,
  caveats: [
    'O roteiro de troféus fala em 9 regiões; o texto do guia de coletáveis fala em 8, mas lista 9 etapas. Aqui são 9 etapas na ordem publicada; Mirage Estate é subárea de Pangzhen, não necessariamente uma região independente.',
    'O índice dos guias usa Weeping Valley Creek; o corpo e a URL usam Weeping Creek Valley. Ambos designam a mesma etapa; preservamos o nome do índice e o alias do corpo.',
    'O guia alterna grafias de alguns nomes (Hua the Bride/Deadly Betrothed, Lei Dang/Lei Dan, Zhu Yuan/Zhu Yan e Soulclaimer/Soulclaimber); requisitos seguem o título do troféu, sem inferir personagens distintos.',
    'O guia de 100% contabiliza 16 tesouros no total, mas os pedidos de Quick Hand Zhang no roteiro de troféus indicam 3 + 3 + 4 + 4 + 3 = 17 entregas por região; confirmar a distinção no jogo em vez de tratar as duas somas como equivalentes.',
    '30–40 horas e dificuldade são estimativas, não garantias; as 564 localizações de coletáveis correspondem ao guia 100%, não ao mínimo da platina.',
  ],
  sourceUrls: [s.official, s.trophies, s.ending, s.collectibles],
}

import type { Game } from '../types'

// Fatos estritamente informados como verificados na página oficial em 01/11/2026.
// Os passos abaixo são apenas exemplos genéricos; NÃO representam objetivos reais.
export const pbz: Game = {
  id: 'pbz',
  title: 'Phantom Blade Zero',
  subtitle: 'Action wuxia RPG · PS5',
  initials: 'PBZ',
  accent: 'lime',
  kind: 'unverified',
  verified: {
    source: 'https://www.playstation.com/pt-br/games/phantom-blade-zero/',
    checkedAt: '01/11/2026',
    facts: [
      'Plataforma: PS5',
      'Publicação: S-GAME Publishing',
      'Lançamento informado na página brasileira: 29/10/2026',
      'Gênero: action wuxia RPG; protagonista: Soul',
      'Mais de 30 armas principais e mais de 20 Phantom Edges anunciadas',
      'Memory Flowers são mencionadas na descrição oficial',
      'Interface em português brasileiro informada na página',
    ],
  },
  items: [
    { id: 'pbz-prep-goals', title: 'Definir um objetivo pessoal', description: 'Exemplo genérico: anote o que você gostaria de acompanhar nesta jornada.', stage: 'Preparação', spoiler: 0 },
    { id: 'pbz-prep-settings', title: 'Ajustar suas preferências', description: 'Exemplo genérico: escolha um ritmo e um nível de dicas confortável para você.', stage: 'Preparação', spoiler: 0 },
    { id: 'pbz-explore-notes', title: 'Registrar observações', description: 'Exemplo genérico: faça uma lista própria de dúvidas enquanto joga.', stage: 'Exploração', spoiler: 0 },
    { id: 'pbz-explore-return', title: 'Revisitar anotações', description: 'Dica demonstrativa, não relacionada a uma área ou evento específico de PBZ.', stage: 'Exploração', spoiler: 1 },
    { id: 'pbz-review-pending', title: 'Revisar pendências pessoais', description: 'Exemplo genérico: confira os objetivos que você mesmo definiu.', stage: 'Revisão', spoiler: 0 },
    { id: 'pbz-review-reflect', title: 'Fazer um balanço da jornada', description: 'Detalhe demonstrativo: compare suas anotações iniciais e finais. Não descreve o jogo.', stage: 'Revisão', spoiler: 2 },
  ],
}

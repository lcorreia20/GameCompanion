import type { Game } from '../types'

export const demo: Game = {
  id: 'demo',
  title: 'Jornada de exemplo',
  subtitle: 'Um espaço para experimentar o checklist',
  initials: '01',
  accent: 'violet',
  kind: 'demo',
  items: [
    { id: 'demo-plan', title: 'Planejar a sessão', description: 'Exemplo: escolha quanto tempo pretende dedicar a uma partida.', stage: 'Preparação', spoiler: 0 },
    { id: 'demo-notes', title: 'Criar suas anotações', description: 'Exemplo: registre ideias, dúvidas e descobertas por conta própria.', stage: 'Preparação', spoiler: 0 },
    { id: 'demo-pause', title: 'Fazer uma pausa', description: 'Exemplo: avance sem pressa e volte quando quiser.', stage: 'Exploração', spoiler: 0 },
    { id: 'demo-hint', title: 'Conferir pistas pessoais', description: 'Dica fictícia: releia aquilo que você mesmo anotou.', stage: 'Exploração', spoiler: 1 },
    { id: 'demo-check', title: 'Revisar o percurso', description: 'Exemplo: marque o que considera concluído.', stage: 'Revisão', spoiler: 0 },
    { id: 'demo-detail', title: 'Encerrar o exemplo', description: 'Detalhe fictício: este é o último passo deste modelo, sem conteúdo de qualquer jogo.', stage: 'Revisão', spoiler: 2 },
  ],
}

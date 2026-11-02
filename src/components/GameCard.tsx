import type { Game } from '../types'

interface GameCardProps {
  game: Game
  done: number
  total: number
  cover: string
  onOpen: () => void
}

export function GameCard({ game, done, total, cover, onOpen }: GameCardProps) {
  const percentage = total ? Math.round(done / total * 100) : 0
  return <button className={`catalog-card ${game.accent}`} onClick={onOpen}>
    <div className="catalog-art"><img src={cover} alt="Arte abstrata ilustrativa, não é capa oficial"/><span className="art-credit">ARTE ILUSTRATIVA · NÃO OFICIAL</span></div>
    <div className="catalog-info"><span className="card-kicker">GUIA DOCUMENTADO · DADOS PARCIAIS</span><h2>{game.title}</h2><p>{game.subtitle}</p><div className="catalog-footer"><span><strong>{total ? done ? `${percentage}% concluído` : 'Não iniciado' : 'Progresso indisponível'}</strong> · {total ? `${done}/${total} registros disponíveis` : 'Aguardando registros documentados'}<small>{done ? 'Continuar guia' : 'Abrir guia'}</small></span><span className="round-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span></div></div>
  </button>
}

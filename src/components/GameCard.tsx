import type { Game } from '../types'
import type { Language } from '../data/games/phantom-blade-zero/localization'
import { translate as tr } from '../i18n'

interface GameCardProps {
  game: Game
  done: number
  total: number
  cover: string
  onOpen: () => void
  language?: Language
}

export function GameCard({ game, done, total, cover, onOpen, language = 'pt-BR' }: GameCardProps) {
  const percentage = total ? Math.round(done / total * 100) : 0
  return <button className={`catalog-card ${game.accent}`} onClick={onOpen}>
    <div className="catalog-art"><img src={cover} alt={language === 'en' ? 'Official Phantom Blade Zero art from PlayStation' : 'Arte oficial de Phantom Blade Zero, divulgada na página PlayStation'}/><span className="art-credit">{tr('IMAGEM OFICIAL · PLAYSTATION / S-GAME', language)}</span></div>
    <div className="catalog-info"><span className="card-kicker">{tr('GUIA DOCUMENTADO · DADOS PARCIAIS', language)}</span><h2>{game.title}</h2><p>{language === 'en' ? 'Regional platinum guide for PS5' : game.subtitle}</p><div className="catalog-footer"><span><strong>{total ? done ? `${percentage}% ${tr('concluído', language)}` : tr('Não iniciado', language) : tr('Progresso indisponível', language)}</strong> · {total ? `${done}/${total} ${tr('registros disponíveis', language)}` : tr('Aguardando registros documentados', language)}<small>{tr(done ? 'Continuar guia' : 'Abrir guia', language)}</small></span><span className="round-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span></div></div>
  </button>
}

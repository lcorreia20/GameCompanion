import type { Language } from '../data/games/phantom-blade-zero/localization'
import { translate as tr } from '../i18n'
interface ProgressIndicatorProps {
  done: number
  total: number
  label: string
  language?: Language
}

export function ProgressIndicator({ done, total, label, language = 'pt-BR' }: ProgressIndicatorProps) {
  const percentage = total ? Math.round(done / total * 100) : 0
  return <section className="progress-panel" aria-label={label}>
    <div className="progress-heading"><div><div className="section-overline">{tr('SEU CAMINHO ATÉ AQUI', language)}</div><h2>{tr('Progresso da platina', language)}</h2></div><span className="progress-percent">{total ? <>{percentage}<small>%</small></> : '—'}</span></div>
    {total > 0 && <div className="progress-track" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total} aria-label="Troféus-base marcados como conquistados"><div style={{ width: `${percentage}%` }}/></div>}
    <div className="progress-meta"><span>{total ? <><strong>{done}</strong> {language === 'en' ? `of ${total} required trophies marked (platinum excluded)` : `de ${total} troféus necessários marcados (platina não incluída)`}</> : tr('Ainda não há troféus documentados para calcular progresso.', language)}</span><span>{tr('MARCAÇÃO MANUAL · NÃO SINCRONIZADO', language)}</span></div>
  </section>
}

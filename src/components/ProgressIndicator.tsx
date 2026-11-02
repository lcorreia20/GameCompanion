interface ProgressIndicatorProps {
  done: number
  total: number
  label: string
}

export function ProgressIndicator({ done, total, label }: ProgressIndicatorProps) {
  const percentage = total ? Math.round(done / total * 100) : 0
  return <section className="progress-panel" aria-label={label}>
    <div className="progress-heading"><div><div className="section-overline">SEU CAMINHO ATÉ AQUI</div><h2>Progresso da platina</h2></div><span className="progress-percent">{total ? <>{percentage}<small>%</small></> : '—'}</span></div>
    {total > 0 && <div className="progress-track" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total} aria-label="Troféus-base marcados como conquistados"><div style={{ width: `${percentage}%` }}/></div>}
    <div className="progress-meta"><span>{total ? <><strong>{done}</strong> de {total} troféus necessários marcados (platina não incluída)</> : 'Ainda não há troféus documentados para calcular progresso.'}</span><span>MARCAÇÃO MANUAL · NÃO SINCRONIZADO</span></div>
  </section>
}

import type { ReactNode } from 'react'
import type { GuideMetadata } from '../domain/models/guide'

type IconName = 'difficulty' | 'time' | 'trophy' | 'alert' | 'offline' | 'shield' | 'journey'

function MetricIcon({ name }: { name: IconName }) {
  const drawings: Record<IconName, ReactNode> = {
    difficulty: <><path d="M4 18a8 8 0 1 1 16 0"/><path d="m12 17 4-6"/><path d="M5 18h14"/></>,
    time: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    trophy: <><path d="M7 3h10v6a5 5 0 0 1-10 0V3ZM9 21h6M12 14v7M7 5H4v3a3 3 0 0 0 3 3m10-6h3v3a3 3 0 0 1-3 3"/></>,
    alert: <><path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5m0 3h.01"/></>,
    offline: <><path d="M3 9a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 15a5 5 0 0 1 6 0"/><path d="m3 3 18 18"/></>,
    shield: <><path d="M12 2 4 5v6c0 5 3 8.5 8 11 5-2.5 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></>,
    journey: <><path d="M4 7h12a4 4 0 0 1 0 8H9m0 0 3-3m-3 3 3 3"/><circle cx="5" cy="7" r="2"/></>,
  }
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{drawings[name]}</svg>
}

const compact = (value: string) => value.replace(/\s*\([^)]*\)/g, '').replace(' horas', 'h').trim()

export function PlatinumMetrics({ metadata }: { metadata: GuideMetadata }) {
  const metrics: { label: string; value: string; icon: IconName }[] = [
    { label: 'Dificuldade', value: `${compact(metadata.estimates.difficultyEasy)} fácil · ${compact(metadata.estimates.difficultyNormal)} normal`, icon: 'difficulty' },
    { label: 'Tempo', value: compact(metadata.estimates.platinumHours), icon: 'time' },
    { label: 'Troféus', value: String(metadata.trophyCounts.total), icon: 'trophy' },
    { label: 'Perdíveis', value: String(metadata.trophyCounts.missable), icon: 'alert' },
    { label: 'Online', value: String(metadata.onlineTrophies), icon: 'offline' },
    { label: 'Dificuldade obrigatória', value: metadata.difficultyTrophies ? 'Sim' : 'Não', icon: 'shield' },
    { label: 'Jogadas mínimas', value: compact(metadata.estimates.minimumPlaythroughs), icon: 'journey' },
  ]
  return <section className="guide-metrics" aria-label="Informações da platina">{metrics.map(metric => <div className="guide-metric" key={metric.label}><span className="metric-icon"><MetricIcon name={metric.icon}/></span><span className="metric-copy"><small>{metric.label}</small><strong>{metric.value}</strong></span></div>)}</section>
}

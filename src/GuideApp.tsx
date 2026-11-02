import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import cover from './assets/cover.svg'
import { GameCard } from './components/GameCard'
import { ProgressIndicator } from './components/ProgressIndicator'
import { pbzContent } from './data/games/phantom-blade-zero'
import type { Objective } from './domain/models/guide'
import { optionalExplorationProgress, platinumProgress, regionProgress, requiredObjectivesProgress } from './domain/services/progress'
import { localGameRepository, localProgressRepository, localSettingsRepository } from './repositories/local'
import type { Progress } from './storage'
import { MAX_IMPORT_BYTES } from './storage'
import type { SpoilerLevel } from './types'
import './components/GuideLayout.css'

const game = localGameRepository.get('pbz')!
const guide = pbzContent
type Filter = 'Todos' | 'Pendentes' | 'Perdíveis' | 'Troféus' | 'Missões' | 'Coletáveis' | 'Chefes'
const filters: Filter[] = ['Todos', 'Pendentes', 'Perdíveis', 'Troféus', 'Missões', 'Coletáveis', 'Chefes']
type Group = 'Perdíveis' | 'Missões' | 'Coletáveis' | 'Troféus' | 'Chefes' | 'História e finais'
const groups: Group[] = ['Perdíveis', 'Missões', 'Coletáveis', 'Troféus', 'Chefes', 'História e finais']
const groupFor = (item: Objective): Group => item.category === 'trophy' ? 'Troféus' : item.category === 'collectible' ? 'Coletáveis' : item.category === 'boss' ? 'Chefes' : item.category === 'quest' ? 'Missões' : item.missable ? 'Perdíveis' : 'História e finais'
const sourceTitle = (url: string) => guide.sources.find(item => item.url === url)?.title ?? 'Fonte do guia'
const labelFor = (item: Objective, spoiler: SpoilerLevel) => item.spoiler <= spoiler ? item.title : 'Objetivo protegido'

function GuideApp() {
  const [initial] = useState<{ progress: Progress; error: boolean }>(() => {
    try { return { progress: localProgressRepository.load(), error: false } }
    catch { return { progress: {}, error: true } }
  })
  const [progress, setProgress] = useState(initial.progress)
  const [blocked, setBlocked] = useState(initial.error)
  const [spoiler, setSpoiler] = useState<SpoilerLevel>(() => localSettingsRepository.getSpoilerLevel())
  const [region, setRegion] = useState(guide.regions[0].id)
  const [filter, setFilter] = useState<Filter>('Todos')
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'catalogo' | 'guia'>('catalogo')
  const [menu, setMenu] = useState(false)
  const [notice, setNotice] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const completed = new Set(progress[game.id] ?? [])
  const platinum = platinumProgress(guide, completed)
  const required = requiredObjectivesProgress(guide, completed)
  const optional = optionalExplorationProgress(guide, completed)
  const regionData = guide.regions.find(item => item.id === region)
  const regional = regionData ? regionProgress(guide, region, completed) : null
  const regionalItems = guide.objectives.filter(item => region === 'Todas' || item.regionIds.includes(region))
  const pendingMissables = regionalItems.filter(item => item.missable && item.requiredForPlatinum && !completed.has(item.id))
  const crossRegionBlockers = region === 'Todas' ? [] : regionalItems.flatMap(item => (item.dependsOnIds ?? [])
    .map(id => guide.objectives.find(objective => objective.id === id))
    .filter((dependency): dependency is Objective => !!dependency && !completed.has(dependency.id) && !dependency.regionIds.includes(region)))
  const unresolvedBlockers = [...new Map(crossRegionBlockers.map(item => [item.id, item])).values()]
  const nextRecommended = regionalItems.find(item => item.requiredForPlatinum && item.category !== 'trophy' && !completed.has(item.id) && !(item.dependsOnIds ?? []).some(id => !completed.has(id)))
  const normalizedQuery = query.toLocaleLowerCase('pt-BR').trim()
  // A busca nunca testa campos protegidos: nem mesmo a existência do resultado revela o título.
  const shown = regionalItems.filter(item => {
    if (filter === 'Pendentes' && completed.has(item.id)) return false
    if (filter === 'Perdíveis' && !item.missable) return false
    if (filter === 'Troféus' && item.category !== 'trophy') return false
    if (filter === 'Missões' && item.category !== 'quest' && item.category !== 'ending') return false
    if (filter === 'Coletáveis' && item.category !== 'collectible') return false
    if (filter === 'Chefes' && item.category !== 'boss') return false
    return !normalizedQuery || (item.spoiler <= spoiler && `${item.title} ${item.description}`.toLocaleLowerCase('pt-BR').includes(normalizedQuery))
  })
  let legacyAvailable = false
  try { legacyAvailable = localProgressRepository.restoreLegacySnapshot() !== null } catch { /* sem acesso ao armazenamento */ }

  function persist(next: Progress, recover = false) {
    if (blocked && !recover) { setNotice('Progresso local ilegível: marcações bloqueadas até importar um backup válido.'); return false }
    try {
      if (recover) localProgressRepository.recoverFromBackup(next)
      else localProgressRepository.save(next)
      setProgress(next)
      if (recover) setBlocked(false)
      return true
    } catch { setNotice('Não foi possível salvar o progresso. Nenhuma marcação foi alterada.'); return false }
  }
  function toggle(id: string) {
    persist({ ...progress, [game.id]: completed.has(id) ? [...completed].filter(item => item !== id) : [...completed, id] })
  }
  function exportBackup() {
    try {
      const blob = new Blob([localProgressRepository.exportBackup(progress)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'gamecompanion-progresso.json'; document.body.append(a); a.click(); a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice('Backup JSON gerado. Guarde-o em local seguro.')
    } catch { setNotice('Falha ao gerar o backup.') }
  }
  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error('O arquivo excede o limite de 1 MB.')
      const next = localProgressRepository.importBackup(await file.text())
      const current = Object.values(progress).reduce((n, ids) => n + ids.length, 0)
      const incoming = Object.values(next).reduce((n, ids) => n + ids.length, 0)
      if (!window.confirm(`Importar backup validado com ${incoming} marcações? Substituirá as ${current} marcações atuais${blocked ? ' e guardará cópia bruta do progresso ilegível' : ''}. Exporte o progresso antes se necessário.`)) return
      if (persist(next, true)) setNotice('Backup importado. Marcações anteriores substituídas.')
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Arquivo inválido.') }
  }
  function restoreLegacy() {
    try {
      const next = localProgressRepository.restoreLegacySnapshot()
      if (!next) return
      if (!window.confirm('Restaurar o progresso anterior? As marcações atuais serão substituídas. Exporte um backup primeiro.')) return
      if (persist(next, true)) setNotice('Progresso anterior restaurado; marcações demonstrativas não contam para platina.')
    } catch { setNotice('Não foi possível restaurar o progresso anterior.') }
  }
  function setSpoilerLevel(value: SpoilerLevel) {
    setSpoiler(value)
    try { localSettingsRepository.setSpoilerLevel(value) }
    catch { setNotice('Não foi possível salvar a preferência de spoilers.') }
  }
  function renderObjective(item: Objective, number: number) {
    const protectedContent = item.spoiler > spoiler
    const trophy = item.category === 'trophy' ? guide.trophies.find(t => t.id === item.relatedTrophyIds[0]) : undefined
    const quest = item.questId ? guide.quests.find(q => q.id === item.questId) : undefined
    const step = quest?.steps.find(s => item.relatedStepIds?.includes(s.id))
    return <article className={`guide-objective ${completed.has(item.id) ? 'is-done' : ''}`} key={item.id}>
      <label className="guide-objective-head">
        <input type="checkbox" disabled={blocked} checked={completed.has(item.id)} onChange={() => toggle(item.id)} aria-label={protectedContent ? `Concluir objetivo protegido ${number + 1}` : `Concluir: ${item.title}`}/>
        <span><strong>{protectedContent ? `Objetivo protegido ${number + 1}` : item.title}</strong><small>{protectedContent ? 'Detalhes ocultos · marque quando concluir sem revelar a história' : `${item.requiredForPlatinum ? 'Necessário para platina' : 'Exploração opcional'} · ${item.verification === 'verified' ? 'Documentado' : 'Verificação parcial'}`}</small></span>
      </label>
      {!protectedContent && <div className="guide-objective-details">
        <p>{item.description}</p>
        {item.location && <p><b>Onde:</b> {item.location}</p>}
        {item.before && <p className="guide-warning"><b>Quando:</b> {item.before}</p>}
        {item.missableBefore && <p className="guide-warning"><b>Bloqueio:</b> {item.missableBefore}</p>}
        {step && <p>Etapa da missão · {quest?.name}{step.regionId && ` · ${guide.regions.find(r => r.id === step.regionId)?.name ?? step.regionId}`}</p>}
        {trophy && <p><b>{trophy.rarity.toUpperCase()}</b> · {trophy.requirement}</p>}
        {item.relatedTrophyIds.length > 0 && !trophy && <p>Troféus relacionados: {item.relatedTrophyIds.map(id => guide.trophies.find(t => t.id === id)?.name ?? id).join(', ')}</p>}
        {item.dependsOnIds?.length ? <p>Pré-requisitos: {item.dependsOnIds.map(id => guide.objectives.find(o => o.id === id)?.title ?? id).join(' · ')}</p> : null}
        {item.notes && <p className="guide-warning">Ressalva: {item.notes}</p>}
        <div className="guide-sources">{item.sourceUrls.map(url => <a key={url} href={url} target="_blank" rel="noopener noreferrer">{sourceTitle(url)} ↗</a>)}</div>
      </div>}
    </article>
  }

  return <div className="app-shell">
    <aside className="sidebar" aria-label="Navegação principal">
      <div className="brand"><div className="brand-mark"><span>G</span><i/></div><div><strong>GAME<span>COMPANION</span></strong><small>YOUR JOURNEY, YOUR RULES</small></div></div>
      <div className="side-label">ESPAÇO DE JOGO</div>
      <nav className="side-nav" aria-label="Seções"><button className={view === 'guia' ? 'nav-item active' : 'nav-item'} onClick={() => setView('guia')}>◈ Minha jornada</button><button className={view === 'catalogo' ? 'nav-item active' : 'nav-item'} onClick={() => setView('catalogo')}>◇ Catálogo</button></nav>
      <div className="side-label side-label-games">SEUS JOGOS <span>01</span></div>
      <div className="side-games"><button className={`side-game ${view === 'guia' ? 'selected' : ''}`} onClick={() => setView('guia')}><span className="game-tile lime">{game.initials}</span><span className="side-game-text"><strong>{game.title}</strong><small>GUIA REGIONAL · PS5</small></span></button></div>
      <div className="sidebar-bottom"><div className="pulse-dot"/><span>SEU PROGRESSO FICA NESTE DISPOSITIVO</span></div>
    </aside>
    <main className="main-content"><header className="topbar"><div className="breadcrumb">GAME COMPANION <span>/</span> {view === 'catalogo' ? 'CATÁLOGO' : 'MINHA JORNADA'}</div><div className="topbar-right"><span className="local-tag"><span className="pulse-dot"/> SALVO LOCALMENTE</span><span className="avatar" aria-label="Perfil local">GC</span></div></header>
      <div className="page-content">{view === 'catalogo' ? <section className="catalog-page"><div className="eyebrow"><span className="tiny-square"/> SEU PRÓXIMO CAPÍTULO</div><h1>Catálogo<span className="heading-dot">.</span></h1><p className="page-subtitle">Um jogo disponível. Guia local com fontes e progresso preservado.</p><div className="catalog-grid"><GameCard game={game} done={platinum.done} total={blocked ? 0 : platinum.total} cover={cover} onOpen={() => setView('guia')}/></div></section> : <>
        <div className="eyebrow"><span className="tiny-square"/> ACOMPANHE CADA PASSO</div><h1>Minha jornada<span className="heading-dot">.</span></h1><p className="page-subtitle">Phantom Blade Zero · roteiro regional para acompanhar durante o jogo.</p>
        {blocked && <p className="guide-alert" role="alert">Progresso armazenado ilegível. Nenhuma marcação pode ser gravada. Preserve os dados atuais e use Opções → Importar para recuperar um backup válido.</p>}
        <section className="hero lime" aria-labelledby="hero-title"><img className="hero-art" src={cover} alt="Arte abstrata ilustrativa, não é a capa oficial"/><div className="hero-noise"/><div className="hero-rings"/><div className="hero-symbol" aria-hidden="true">{game.initials}</div><div className="hero-content"><div className="hero-kicker"><span className="kicker-line"/> GUIA DE PLATINA · PS5 <span className="kicker-line"/></div><h2 id="hero-title">{guide.metadata.name}</h2><p>{game.subtitle}</p><div className="hero-badges"><span>36 TROFÉUS · 7 PERDÍVEIS</span><span>FONTES CONSULTADAS EM {guide.metadata.verifiedAt}</span></div></div><div className="hero-corner">ARTE ILUSTRATIVA · NÃO OFICIAL</div></section>
        <section className="guide-metrics" aria-label="Informações da platina">{[
          ['Dificuldade', `${guide.metadata.estimates.difficultyEasy} · normal ${guide.metadata.estimates.difficultyNormal}`],
          ['Tempo', guide.metadata.estimates.platinumHours], ['Troféus', `${guide.metadata.trophyCounts.total} · ${guide.metadata.trophyCounts.platinum} platina, ${guide.metadata.trophyCounts.gold} ouro, ${guide.metadata.trophyCounts.silver} prata, ${guide.metadata.trophyCounts.bronze} bronze`],
          ['Perdíveis', `${guide.metadata.trophyCounts.missable}`], ['Online', `${guide.metadata.onlineTrophies}`], ['Dificuldade obrigatória', guide.metadata.difficultyTrophies ? 'Sim' : 'Não'], ['Jogadas mínimas', guide.metadata.estimates.minimumPlaythroughs],
        ].map(([title, value]) => <div key={title}><small>{title}</small><strong>{value}</strong></div>)}</section>
        <ProgressIndicator done={platinum.done} total={blocked ? 0 : platinum.total} label="Progresso da Platina"/>
        <section className="guide-section guide-main" aria-labelledby="guide-title"><div className="section-overline">ROTEIRO DOCUMENTADO · NOVE ETAPAS</div><h2 id="guide-title">Checklist por região<span className="heading-dot">.</span></h2>
          <div className="region-navigation" role="group" aria-label="Selecionar região"><button aria-pressed={region === 'Todas'} className={region === 'Todas' ? 'active' : ''} onClick={() => setRegion('Todas')}>Visão global</button>{guide.regions.map(r => { const score = regionProgress(guide, r.id, completed); const hasMissable = guide.objectives.some(o => o.regionIds.includes(r.id) && o.missable && o.requiredForPlatinum && !completed.has(o.id)); return <button key={r.id} aria-pressed={region === r.id} className={region === r.id ? 'active' : ''} onClick={() => setRegion(r.id)}><small>{String(r.order).padStart(2, '0')} · {blocked ? '—' : `${score.percent}%`}</small>{spoiler === 0 ? `Etapa ${r.order}` : r.name}{hasMissable && <span aria-label="Perdível pendente">⚠ Pendência crítica</span>}</button> })}</div>
          <div className="guide-toolbar"><div className="guide-toolbar-options"><label>Pesquisar <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar objetivo visível..."/></label><label>Dicas: <select aria-label="Nível de dicas" value={spoiler} onChange={event => setSpoilerLevel(Number(event.target.value) as SpoilerLevel)}><option value={0}>Sem spoilers</option><option value={1}>Com dicas</option><option value={2}>Mostrar tudo</option></select></label><div className="options-menu"><button type="button" aria-expanded={menu} onClick={() => setMenu(!menu)}>⋯ Opções</button>{menu && <div className="options-actions"><button disabled={blocked} onClick={exportBackup}>Exportar progresso</button><button onClick={() => input.current?.click()}>Importar progresso</button>{legacyAvailable && <button onClick={restoreLegacy}>Restaurar backup anterior</button>}<small>Configurações de dicas estão ao lado da busca. Marcações antigas preservadas nos backups, sem contar para platina.</small></div>}</div><input ref={input} className="sr-only" type="file" accept=".json,application/json" aria-label="Selecionar arquivo JSON de progresso" onChange={importBackup}/></div>
            <div className="guide-filter-buttons" role="group" aria-label="Filtrar objetivos">{filters.map(option => <button key={option} type="button" aria-pressed={filter === option} className={filter === option ? 'active' : ''} onClick={() => setFilter(option)}>{option}</button>)}</div></div>
          {regionData && <div className="region-summary"><strong>{spoiler === 0 ? `Etapa ${regionData.order}` : regionData.name}</strong><span>{blocked ? 'Progresso indisponível' : `${regional?.done}/${regional?.total} objetivos necessários concluídos · ${regional?.percent}%`}</span><span>{pendingMissables.length || unresolvedBlockers.length ? `⚠ ${pendingMissables.length} perdíveis e ${unresolvedBlockers.length} pré-requisitos de outras etapas pendentes` : 'Nenhuma pendência crítica cadastrada nesta seleção'}</span>{!blocked && regional?.total && regional.done === regional.total && !pendingMissables.length && !unresolvedBlockers.length ? <span>✓ Objetivos cadastrados desta etapa concluídos</span> : null}</div>}
          {region !== 'Todas' && <section className={pendingMissables.length || unresolvedBlockers.length ? 'before-leaving urgent' : 'before-leaving'} aria-label="Antes de sair desta região"><h3>Antes de sair desta região</h3><p>{pendingMissables.length || unresolvedBlockers.length ? `Há ${pendingMissables.length} verificações perdíveis e ${unresolvedBlockers.length} pré-requisitos de outras etapas pendentes. Não é seguro afirmar que você pode avançar; confira as fontes e os gatilhos de bloqueio antes de prosseguir.` : 'Não há perdíveis nem pré-requisitos anteriores cadastrados pendentes nesta área. Isso não garante que toda a exploração esteja completa; confira o roteiro e as fontes.'}</p>{spoiler > 0 && (pendingMissables.length > 0 || unresolvedBlockers.length > 0) && <ul>{pendingMissables.slice(0, 5).map(item => <li key={item.id}>{labelFor(item, spoiler)}{item.spoiler <= spoiler && item.missableBefore ? ` · ${item.missableBefore}` : ''}</li>)}{unresolvedBlockers.slice(0, 5).map(item => <li key={item.id}>Pré-requisito anterior: {labelFor(item, spoiler)}</li>)}</ul>}</section>}
          <div className="guide-groups">{groups.map(group => { const items = shown.filter(item => groupFor(item) === group); if (!items.length) return null; return <details key={group} open={group === 'Perdíveis' && filter === 'Perdíveis' ? true : undefined}><summary>{group} <span>{items.filter(item => completed.has(item.id)).length}/{items.length}</span></summary><div>{items.map(renderObjective)}</div></details> })}{!shown.length && <p className="guide-empty">Nenhum objetivo visível para esta seleção. Ajuste a busca, o filtro ou a região. A busca não pesquisa conteúdo protegido.</p>}</div>
          {region === 'Todas' && <p className="guide-note">A visão global inclui objetivos sem região confirmada; não presumimos a localização desses itens.</p>}
        </section>
        <section className="support-panel guide-support" aria-labelledby="support-title"><div className="section-overline">RESUMO PARA A SESSÃO</div><h2 id="support-title">Painel de apoio</h2><div className="support-grid"><div><strong>Região atual</strong><span>{regionData ? spoiler === 0 ? `Etapa ${regionData.order}` : regionData.name : 'Visão global'}</span></div><div><strong>Objetivos obrigatórios</strong><span>{blocked ? 'Indisponível' : `${required.done}/${required.total} etapas acompanhadas`}</span></div><div><strong>Exploração opcional</strong><span>{blocked ? 'Indisponível' : `${optional.done}/${optional.total} registros`}</span></div><div><strong>Pendências críticas</strong><span>{spoiler === 0 ? `${pendingMissables.length + unresolvedBlockers.length} verificações` : `${pendingMissables.length + unresolvedBlockers.length} nesta seleção`}</span></div></div><p>{blocked ? 'Próxima recomendação indisponível enquanto o progresso não puder ser lido.' : nextRecommended ? `Próxima ação elegível nesta seleção: ${labelFor(nextRecommended, spoiler)}. Verifique as condições no checklist; isto não substitui uma conferência dos perdíveis.` : 'Sem próximas etapas obrigatórias cadastradas nesta seleção.'}</p><p>Os 17 registros seletivos de coletáveis não são todas as 564 localizações do guia de 100%. Tempo e dificuldade são estimativas do PowerPyx.</p><details><summary>Fontes, divergências e informações sobre o jogo</summary>{spoiler > 0 && <ul>{guide.metadata.caveats.map(text => <li key={text}>{text}</li>)}</ul>}<div className="guide-sources">{(spoiler === 0 ? guide.metadata.sourceUrls.filter(url => url === guide.sources.find(s => s.id === 'playstation-official')?.url || url === guide.sources.find(s => s.id === 'powerpyx-trophies')?.url) : guide.metadata.sourceUrls).map(url => <a key={url} href={url} target="_blank" rel="noopener noreferrer">{spoiler === 0 ? 'Fonte externa' : sourceTitle(url)} ↗</a>)}</div>{game.verified && <p>Sobre o jogo · fonte oficial: <a href={game.verified.source} target="_blank" rel="noopener noreferrer">PlayStation Brasil ↗</a>. {game.verified.facts.join(' · ')}</p>}</details></section>
      </>}</div><footer className="footer"><span>© GAME COMPANION · FEITO PARA JOGAR NO SEU RITMO</span><span>DADOS LOCAIS · SEM CONTA · SEM ENVIO</span></footer>
    </main>{notice && <div role="status" className="toast"><span>{notice}</span><button aria-label="Fechar aviso" onClick={() => setNotice('')}>×</button></div>}
  </div>
}

export default GuideApp

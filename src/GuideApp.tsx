import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import cover from './assets/phantom-blade-zero-official.jpg'
import { GameCard } from './components/GameCard'
import { PlatinumMetrics } from './components/PlatinumMetrics'
import { ProgressIndicator } from './components/ProgressIndicator'
import { pbzContent } from './data/games/phantom-blade-zero'
import { regionMapUrl } from './data/games/phantom-blade-zero/mapLinks'
import { gameName } from './data/games/phantom-blade-zero/localization'
import type { Language } from './data/games/phantom-blade-zero/localization'
import { translate } from './i18n'
import type { Objective } from './domain/models/guide'
import { optionalExplorationProgress, platinumProgress, regionProgress, requiredObjectivesProgress } from './domain/services/progress'
import { toggleLinkedObjective, trophyRequirements } from './domain/services/trophyLinks'
import { localGameRepository, localProgressRepository, localSettingsRepository } from './repositories/local'
import type { Progress } from './storage'
import { MAX_IMPORT_BYTES } from './storage'
import './components/GuideLayout.css'

const game = localGameRepository.get('pbz')!
const guide = pbzContent
const linkedTrophies = trophyRequirements(guide)
type Filter = 'Todos' | 'Pendentes' | 'Perdíveis' | 'Troféus' | 'Missões' | 'Coletáveis' | 'Chefes'
const filters: Filter[] = ['Todos', 'Pendentes', 'Perdíveis', 'Troféus', 'Missões', 'Coletáveis', 'Chefes']
type Group = 'Perdíveis' | 'Missões' | 'Coletáveis' | 'Troféus' | 'Chefes' | 'História e finais'
const groups: Group[] = ['Perdíveis', 'Missões', 'Coletáveis', 'Troféus', 'Chefes', 'História e finais']
const groupFor = (item: Objective): Group => item.category === 'trophy' ? 'Troféus' : item.category === 'collectible' ? 'Coletáveis' : item.category === 'boss' ? 'Chefes' : item.category === 'quest' ? 'Missões' : item.missable ? 'Perdíveis' : 'História e finais'
const sourceTitle = (url: string) => guide.sources.find(item => item.url === url)?.title ?? 'Fonte do guia'

function GuideApp() {
  const [initial] = useState<{ progress: Progress; error: boolean }>(() => {
    try { return { progress: localProgressRepository.load(), error: false } }
    catch { return { progress: {}, error: true } }
  })
  const [progress, setProgress] = useState(initial.progress)
  const [blocked, setBlocked] = useState(initial.error)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => localSettingsRepository.getTheme())
  const [interfaceLanguage, setInterfaceLanguage] = useState<Language>(() => localSettingsRepository.getInterfaceLanguage())
  const [gameLanguage, setGameLanguage] = useState<Language>(() => localSettingsRepository.getGameLanguage())
  const ui = (text: string) => translate(text, interfaceLanguage)
  const questName = (id: string, name: string) => gameName('quest', id, name, gameLanguage)
  const trophyName = (id: string, name: string) => gameName('trophy', id, name, gameLanguage)
  const regionName = (id: string, name: string) => gameName('region', id, name, gameLanguage)
  const objectiveName = (item: Objective) => {
    if (item.category === 'trophy') return trophyName(item.relatedTrophyIds[0], item.title)
    if (item.questId) return questName(item.questId, item.title)
    if (item.category === 'boss' && interfaceLanguage === 'en') return item.title.replace(/^Derrotar /, 'Defeat ')
    return item.title
  }
  const changeLanguage = (kind: 'interface' | 'game', value: Language) => {
    if (kind === 'interface') { setInterfaceLanguage(value); document.documentElement.lang = value }
    else setGameLanguage(value)
    try {
      if (kind === 'interface') localSettingsRepository.setInterfaceLanguage(value)
      else localSettingsRepository.setGameLanguage(value)
    } catch { setNotice(value === 'en' ? 'Language changed, but the preference could not be saved.' : 'Idioma alterado, mas não foi possível salvar a preferência.') }
  }
  useEffect(() => { document.documentElement.lang = interfaceLanguage }, [interfaceLanguage])
  // Revelações são temporárias: ao reabrir a página, descrições voltam a ficar ocultas.
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set())
  const [region, setRegion] = useState(guide.regions[0].id)
  const [filter, setFilter] = useState<Filter>('Todos')
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'catalogo' | 'guia'>('catalogo')
  const [menu, setMenu] = useState(false)
  const [notice, setNotice] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  const completed = new Set(progress[game.id] ?? [])
  const platinum = platinumProgress(guide, completed)
  const required = requiredObjectivesProgress(guide, completed)
  const optional = optionalExplorationProgress(guide, completed)
  const regionData = guide.regions.find(item => item.id === region)
  const mapUrl = regionData ? regionMapUrl(regionData.id, interfaceLanguage) : null
  const regional = regionData ? regionProgress(guide, region, completed) : null
  const regionalItems = guide.objectives.filter(item => region === 'Todas' || item.regionIds.includes(region))
  const pendingMissables = regionalItems.filter(item => item.missable && item.requiredForPlatinum && !completed.has(item.id))
  const crossRegionBlockers = region === 'Todas' ? [] : regionalItems.flatMap(item => (item.dependsOnIds ?? [])
    .map(id => guide.objectives.find(objective => objective.id === id))
    .filter((dependency): dependency is Objective => !!dependency && !completed.has(dependency.id) && !dependency.regionIds.includes(region)))
  const unresolvedBlockers = [...new Map(crossRegionBlockers.map(item => [item.id, item])).values()]
  const nextRecommended = regionalItems.find(item => item.requiredForPlatinum && item.category !== 'trophy' && !completed.has(item.id) && !(item.dependsOnIds ?? []).some(id => !completed.has(id)))
  const normalizedQuery = query.toLocaleLowerCase('pt-BR').trim()
  // Pesquisar apenas nomes impede que a descrição oculta revele resultados inesperados.
  const shown = regionalItems.filter(item => {
    if (filter === 'Pendentes' && completed.has(item.id)) return false
    if (filter === 'Perdíveis' && !item.missable) return false
    if (filter === 'Troféus' && item.category !== 'trophy') return false
    if (filter === 'Missões' && item.category !== 'quest' && item.category !== 'ending') return false
    if (filter === 'Coletáveis' && item.category !== 'collectible') return false
    if (filter === 'Chefes' && item.category !== 'boss') return false
    return !normalizedQuery || objectiveName(item).toLocaleLowerCase(interfaceLanguage).includes(normalizedQuery)
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
    persist({ ...progress, [game.id]: [...toggleLinkedObjective(guide, completed, id)] })
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
  function toggleDetails(id: string) {
    setRevealedIds(current => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try { localSettingsRepository.setTheme(next) }
    catch { setNotice('O tema mudou, mas não foi possível salvar a preferência neste navegador.') }
  }
  function renderObjective(item: Objective) {
    const revealed = revealedIds.has(item.id)
    const title = objectiveName(item)
    const requirements = linkedTrophies.get(item.id)
    const trophy = item.category === 'trophy' ? guide.trophies.find(t => t.id === item.relatedTrophyIds[0]) : undefined
    const quest = item.questId ? guide.quests.find(q => q.id === item.questId) : undefined
    const step = quest?.steps.find(s => item.relatedStepIds?.includes(s.id))
    return <article className={`guide-objective ${completed.has(item.id) ? 'is-done' : ''}`} key={item.id}>
      <div className="guide-objective-row"><label className="guide-objective-head">
        <input type="checkbox" disabled={blocked} checked={completed.has(item.id)} onChange={() => toggle(item.id)} aria-label={`${ui("Concluir:")} ${title}`}/>
        <span><strong>{title}</strong><small>{item.missable ? `⚠ ${ui('Perdível')} · ` : ''}{ui(item.requiredForPlatinum ? 'Necessário para platina' : 'Exploração opcional')} · {ui(item.verification === 'verified' ? 'Documentado' : 'Verificação parcial')}{requirements && ` · ${interfaceLanguage === 'en' ? 'Linked' : 'Vinculados'}: ${requirements.filter(id => completed.has(id)).length}/${requirements.length}`}</small></span>
      </label><button type="button" className="guide-reveal" aria-expanded={revealed} aria-label={`${ui(revealed ? 'Ocultar' : 'Ver')} ${ui('descrição de')} ${title}`} title={ui(revealed ? 'Ocultar' : 'Ver')} onClick={() => toggleDetails(item.id)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>{revealed && <path d="M3 21 21 3"/>}</svg></button></div>
      {revealed && <div className="guide-objective-details">
        <p>{item.description}</p>
        {item.location && <p><b>{ui("Onde:")}</b> {item.location}</p>}
        {item.before && <p className="guide-warning"><b>{ui("Quando:")}</b> {item.before}</p>}
        {item.missableBefore && <p className="guide-warning"><b>{ui("Bloqueio:")}</b> {item.missableBefore}</p>}
        {step && <p>{ui("Etapa da missão")} · {quest && questName(quest.id, quest.name)}{step.regionId && ` · ${regionName(step.regionId, guide.regions.find(r => r.id === step.regionId)?.name ?? step.regionId)}`}</p>}
        {trophy && <p><b>{trophy.rarity.toUpperCase()}</b> · {trophy.requirement}</p>}
        {item.relatedTrophyIds.length > 0 && !trophy && <p>{ui("Troféus relacionados:")} {item.relatedTrophyIds.map(id => trophyName(id, guide.trophies.find(t => t.id === id)?.name ?? id)).join(', ')}</p>}
        {item.dependsOnIds?.length ? <p>{ui("Pré-requisitos:")} {item.dependsOnIds.map(id => (guide.objectives.find(o => o.id === id) ? objectiveName(guide.objectives.find(o => o.id === id)!) : id)).join(' · ')}</p> : null}
        {item.notes && <p className="guide-warning">{ui("Ressalva:")} {item.notes}</p>}
        <div className="guide-sources">{item.sourceUrls.map(url => <a key={url} href={url} target="_blank" rel="noopener noreferrer">{sourceTitle(url)} ↗</a>)}</div>
      </div>}
    </article>
  }

  return <div className="app-shell">
    <header className="site-header"><div className="brand"><div className="brand-mark"><span>G</span><i/></div><div><strong>GAME<span>COMPANION</span></strong><small>YOUR JOURNEY, YOUR RULES</small></div></div><div className="site-controls"><label className="language-switch interface-language"><span>{ui('Linguagem')}</span><span className="language-choice"><span className="language-flag" aria-hidden="true">{interfaceLanguage === 'pt-BR' ? '🇧🇷' : '🇺🇸'}</span><select aria-label={ui('Idioma da interface')} value={interfaceLanguage} onChange={event => changeLanguage('interface', event.target.value as Language)}><option value="pt-BR">PT-BR</option><option value="en">EN</option></select></span></label><button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={interfaceLanguage === 'en' ? (theme === 'dark' ? 'Enable light theme' : 'Enable dark theme') : (theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro')} title={interfaceLanguage === 'en' ? (theme === 'dark' ? 'Use light theme' : 'Use dark theme') : (theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro')}>{theme === 'dark' ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20.3 15.8A9 9 0 0 1 8.2 3.7 9 9 0 1 0 20.3 15.8Z"/></svg>}</button></div></header>
    <aside className="sidebar" aria-label={ui("Navegação principal")}>
      <div className="side-label">{ui('ESPAÇO DE JOGO')}</div>
      <nav className="side-nav" aria-label={ui("Seções")}><button className={view === 'guia' ? 'nav-item active' : 'nav-item'} onClick={() => setView('guia')}>◈ {ui('Minha jornada')}</button><button className={view === 'catalogo' ? 'nav-item active' : 'nav-item'} onClick={() => setView('catalogo')}>◇ {ui('Catálogo')}</button></nav>
      <div className="side-label side-label-games">{ui("SEUS JOGOS")} <span>01</span></div>
      <div className="side-games"><button className={`side-game ${view === 'guia' ? 'selected' : ''}`} onClick={() => setView('guia')}><span className="game-tile lime">{game.initials}</span><span className="side-game-text"><strong>{game.title}</strong><small>{ui('GUIA REGIONAL · PS5')}</small></span></button></div>
      <div className="sidebar-bottom"><div className="pulse-dot"/><span>{ui('SEU PROGRESSO FICA NESTE DISPOSITIVO')}</span></div>
    </aside>
    <main className="main-content"><header className="topbar"><div className="breadcrumb">GAME COMPANION <span>/</span> {ui(view === 'catalogo' ? 'CATÁLOGO' : 'MINHA JORNADA')}</div><div className="topbar-right"><span className="local-tag"><span className="pulse-dot"/> {ui("SALVO LOCALMENTE")}</span><span className="avatar" aria-label={interfaceLanguage === "en" ? "Local profile" : "Perfil local"}>GC</span></div></header>
      <div className="page-content">{view === 'catalogo' ? <section className="catalog-page"><div className="eyebrow"><span className="tiny-square"/> {ui("SEU PRÓXIMO CAPÍTULO")}</div><h1>{ui('Catálogo')}<span className="heading-dot">.</span></h1><p className="page-subtitle">{ui('Um jogo disponível. Guia local com fontes e progresso preservado.')}</p><div className="catalog-grid"><GameCard game={game} done={platinum.done} total={blocked ? 0 : platinum.total} cover={cover} language={interfaceLanguage} onOpen={() => setView('guia')}/></div></section> : <>
        <div className="eyebrow"><span className="tiny-square"/> {ui("ACOMPANHE CADA PASSO")}</div><h1>{ui('Minha jornada')}<span className="heading-dot">.</span></h1><p className="page-subtitle">{ui('Phantom Blade Zero · roteiro regional para acompanhar durante o jogo.')}</p>
        {blocked && <p className="guide-alert" role="alert">{interfaceLanguage === 'en' ? 'Stored progress cannot be read. Marking is disabled. Preserve current data and use Options → Import to recover a valid backup.' : 'Progresso armazenado ilegível. Nenhuma marcação pode ser gravada. Preserve os dados atuais e use Opções → Importar para recuperar um backup válido.'}</p>}
        <section className="hero lime" aria-labelledby="hero-title"><img className="hero-art" src={cover} alt={interfaceLanguage === 'en' ? 'Official Phantom Blade Zero art from PlayStation' : 'Arte oficial de Phantom Blade Zero, divulgada na página PlayStation'}/><div className="hero-noise"/><div className="hero-rings"/><div className="hero-symbol" aria-hidden="true">{game.initials}</div><div className="hero-content"><div className="hero-kicker"><span className="kicker-line"/> {ui("GUIA DE PLATINA · PS5")} <span className="kicker-line"/></div><h2 id="hero-title">{guide.metadata.name}</h2><p>{interfaceLanguage === 'en' ? 'A regional platinum roadmap, backed by sources.' : game.subtitle}</p><div className="hero-badges"><span>{guide.metadata.trophyCounts.total} {ui("TROFÉUS")} · {guide.metadata.trophyCounts.missable} {ui("PERDÍVEIS")}</span></div></div><div className="hero-corner">{ui('IMAGEM OFICIAL · PLAYSTATION / S-GAME')}</div></section>
        <PlatinumMetrics metadata={guide.metadata} language={interfaceLanguage}/>
        <ProgressIndicator done={platinum.done} total={blocked ? 0 : platinum.total} label={ui("Progresso da Platina")} language={interfaceLanguage}/>
        <section className="guide-section guide-main" aria-labelledby="guide-title"><div className="checklist-heading"><div><div className="section-overline">{ui('ROTEIRO DOCUMENTADO · NOVE ETAPAS')}</div><h2 id="guide-title">{ui('Checklist por região')}<span className="heading-dot">.</span></h2></div><label className="language-switch game-language"><span>{ui('Idioma dos itens')}</span><span className="language-choice"><span className="language-flag" aria-hidden="true">{gameLanguage === 'pt-BR' ? '🇧🇷' : '🇺🇸'}</span><select aria-label={ui('Idioma dos itens')} value={gameLanguage} onChange={event => changeLanguage('game', event.target.value as Language)}><option value="en">EN</option><option value="pt-BR">PT-BR</option></select></span></label></div>
          <div className="region-navigation" role="group" aria-label={ui("Selecionar região")}><button aria-pressed={region === 'Todas'} className={region === 'Todas' ? 'active' : ''} onClick={() => setRegion('Todas')}>{ui('Visão global')}</button>{guide.regions.map(r => { const score = regionProgress(guide, r.id, completed); const hasMissable = guide.objectives.some(o => o.regionIds.includes(r.id) && o.missable && o.requiredForPlatinum && !completed.has(o.id)); return <button key={r.id} aria-pressed={region === r.id} className={region === r.id ? 'active' : ''} onClick={() => setRegion(r.id)}><small>{String(r.order).padStart(2, '0')} · {blocked ? '—' : `${score.percent}%`}</small>{regionName(r.id, r.name)}{hasMissable && <span aria-label={interfaceLanguage === "en" ? "Pending missable" : "Perdível pendente"}>⚠ {ui("Pendência crítica")}</span>}</button> })}</div>
          <div className="region-map-action">{mapUrl ? <a className="region-map-button" href={mapUrl} target="_blank" rel="noopener noreferrer">{interfaceLanguage === 'en' ? 'Open region map ↗' : 'Abrir mapa da região ↗'}</a> : <span title={interfaceLanguage === 'en' ? 'Select a region to open its map.' : 'Selecione uma região para abrir o mapa.'}><button type="button" className="region-map-button" disabled title={interfaceLanguage === 'en' ? 'Select a region to open its map.' : 'Selecione uma região para abrir o mapa.'}>{interfaceLanguage === 'en' ? 'Open region map ↗' : 'Abrir mapa da região ↗'}</button></span>}<small>MetaBot.GG · {interfaceLanguage === 'en' ? 'opens in a new tab; progress is separate' : 'abre em outra aba; progresso separado'}</small></div>
          <div className="guide-toolbar"><div className="guide-toolbar-options"><label>{ui("Pesquisar")} <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={ui("Buscar pelo nome...")}/></label><span className="guide-disclosure-hint">{ui('Use o olho em cada objetivo para ver os detalhes.')}</span><span className="guide-disclosure-hint">{interfaceLanguage === 'en' ? 'Linked trophies and their documented requirements update together. Unchecking a trophy keeps completed tasks.' : 'Troféus vinculados e seus requisitos documentados atualizam juntos. Desmarcar um troféu preserva as etapas concluídas.'}</span><div className="options-menu"><button type="button" aria-expanded={menu} onClick={() => setMenu(!menu)}>⋯ {ui('Opções')}</button>{menu && <div className="options-actions"><button disabled={blocked} onClick={exportBackup}>{ui('Exportar progresso')}</button><button onClick={() => input.current?.click()}>{ui('Importar progresso')}</button>{legacyAvailable && <button onClick={restoreLegacy}>{ui('Restaurar backup anterior')}</button>}<small>{ui('Marcações antigas preservadas nos backups, sem contar para platina.')}</small></div>}</div><input ref={input} className="sr-only" type="file" accept=".json,application/json" aria-label={ui("Selecionar arquivo JSON de progresso")} onChange={importBackup}/></div>
            <div className="guide-filter-buttons" role="group" aria-label={ui("Filtrar objetivos")}>{filters.map(option => <button key={option} type="button" aria-pressed={filter === option} className={filter === option ? 'active' : ''} onClick={() => setFilter(option)}>{ui(option)}</button>)}</div></div>
          {regionData && <div className="region-summary"><strong>{regionName(regionData.id, regionData.name)}</strong><span>{blocked ? ui('Progresso indisponível') : interfaceLanguage === 'en' ? `${regional?.done}/${regional?.total} required objectives complete · ${regional?.percent}%` : `${regional?.done}/${regional?.total} objetivos necessários concluídos · ${regional?.percent}%`}</span><span>{pendingMissables.length || unresolvedBlockers.length ? interfaceLanguage === 'en' ? `⚠ ${pendingMissables.length} missables and ${unresolvedBlockers.length} prerequisites from other stages pending` : `⚠ ${pendingMissables.length} perdíveis e ${unresolvedBlockers.length} pré-requisitos de outras etapas pendentes` : interfaceLanguage === 'en' ? 'No critical pending items recorded in this selection' : 'Nenhuma pendência crítica cadastrada nesta seleção'}</span>{!blocked && regional?.total && regional.done === regional.total && !pendingMissables.length && !unresolvedBlockers.length ? <span>✓ {interfaceLanguage === 'en' ? 'All recorded objectives in this stage complete' : 'Objetivos cadastrados desta etapa concluídos'}</span> : null}</div>}
          {region !== 'Todas' && <section className={pendingMissables.length || unresolvedBlockers.length ? 'before-leaving urgent' : 'before-leaving'} aria-label={ui("Antes de sair desta região")}><h3>{ui('Antes de sair desta região')}</h3><p>{pendingMissables.length || unresolvedBlockers.length ? interfaceLanguage === 'en' ? `There are ${pendingMissables.length} missable checks and ${unresolvedBlockers.length} prerequisites from other stages pending. Check objectives and lockouts before moving on.` : `Há ${pendingMissables.length} verificações perdíveis e ${unresolvedBlockers.length} pré-requisitos de outras etapas pendentes. Não é seguro afirmar que você pode avançar; confira os objetivos e os gatilhos de bloqueio antes de prosseguir.` : interfaceLanguage === 'en' ? 'No pending missables or prerequisites are recorded here. This does not guarantee complete exploration; consult the roadmap and sources.' : 'Não há perdíveis nem pré-requisitos anteriores cadastrados pendentes nesta área. Isso não garante que toda a exploração esteja completa; confira o roteiro e as fontes.'}</p>{(pendingMissables.length > 0 || unresolvedBlockers.length > 0) && <ul>{pendingMissables.slice(0, 5).map(item => <li key={item.id}>{objectiveName(item)}</li>)}{unresolvedBlockers.slice(0, 5).map(item => <li key={item.id}>{interfaceLanguage === 'en' ? 'Earlier prerequisite:' : 'Pré-requisito anterior:'} {objectiveName(item)}</li>)}</ul>}</section>}
          {interfaceLanguage === 'en' && <p className="guide-note">Guide explanations and source notes remain in Portuguese; only navigation and labels are translated into English.</p>}{gameLanguage === 'pt-BR' && <p className="guide-note" role="note">{interfaceLanguage === 'en' ? 'PT-BR names: 36 trophies and 11 quests from PSN trophy data on Exophase; nine region names from MetaBot game data. Other item names remain in English until verified; console display has not been checked.' : 'Nomes PT-BR: 36 troféus e 11 missões na lista PSN do Exophase; nove áreas em dados de jogo publicados pelo MetaBot. Os demais nomes permanecem em inglês até confirmação; a exibição no console ainda não foi conferida.'} <a href="https://www.exophase.com/game/phantom-blade-zero-psn/trophies/pt-BR/" target="_blank" rel="noopener noreferrer">Exophase ↗</a> · <a href="https://metabot.gg/pt_BR/phantom-blade-zero/regions" target="_blank" rel="noopener noreferrer">MetaBot ↗</a></p>}<div className="guide-groups">{groups.map(group => { const items = shown.filter(item => groupFor(item) === group); if (!items.length) return null; return <details key={group} open={group === 'Perdíveis' && filter === 'Perdíveis' ? true : undefined}><summary>{ui(group)} <span>{items.filter(item => completed.has(item.id)).length}/{items.length}</span></summary><div>{items.map(renderObjective)}</div></details> })}{!shown.length && <p className="guide-empty">{ui('Nenhum objetivo para esta seleção. Ajuste a busca pelo nome, o filtro ou a região.')}</p>}</div>
          {region === 'Todas' && <p className="guide-note">{ui('A visão global inclui objetivos sem região confirmada; não presumimos a localização desses itens.')}</p>}
        </section>
        <section className="support-panel guide-support" aria-labelledby="support-title"><div className="section-overline">{ui('RESUMO PARA A SESSÃO')}</div><h2 id="support-title">{ui('Painel de apoio')}</h2><div className="support-grid"><div><strong>{ui('Região atual')}</strong><span>{regionData ? regionName(regionData.id, regionData.name) : ui('Visão global')}</span></div><div><strong>{ui('Objetivos obrigatórios')}</strong><span>{blocked ? ui('Indisponível') : interfaceLanguage === 'en' ? `${required.done}/${required.total} tracked steps` : `${required.done}/${required.total} etapas acompanhadas`}</span></div><div><strong>{ui('Exploração opcional')}</strong><span>{blocked ? ui('Indisponível') : interfaceLanguage === 'en' ? `${optional.done}/${optional.total} entries` : `${optional.done}/${optional.total} registros`}</span></div><div><strong>{ui('Pendências críticas')}</strong><span>{pendingMissables.length + unresolvedBlockers.length} {interfaceLanguage === 'en' ? 'in this selection' : 'nesta seleção'}</span></div></div><p>{blocked ? interfaceLanguage === 'en' ? 'Next recommendation unavailable until progress can be read.' : 'Próxima recomendação indisponível enquanto o progresso não puder ser lido.' : nextRecommended ? interfaceLanguage === 'en' ? `Next eligible action: ${objectiveName(nextRecommended)}. Check the details using the eye icon; verify missables before proceeding.` : `Próxima ação elegível nesta seleção: ${objectiveName(nextRecommended)}. Verifique as condições pelo ícone de olho no checklist; isto não substitui uma conferência dos perdíveis.` : interfaceLanguage === 'en' ? 'No further required steps recorded in this selection.' : 'Sem próximas etapas obrigatórias cadastradas nesta seleção.'}</p><p>{interfaceLanguage === 'en' ? 'The 17 selected collectible entries do not cover all 564 locations in the 100% guide. Time and difficulty are PowerPyx estimates.' : 'Os 17 registros seletivos de coletáveis não são todas as 564 localizações do guia de 100%. Tempo e dificuldade são estimativas do PowerPyx.'}</p><details><summary>{ui('Fontes, divergências e informações sobre o jogo')}</summary><ul>{guide.metadata.caveats.map(text => <li key={text}>{text}</li>)}</ul><div className="guide-sources">{guide.metadata.sourceUrls.map(url => <a key={url} href={url} target="_blank" rel="noopener noreferrer">{sourceTitle(url)} ↗</a>)}</div>{game.verified && <p>Sobre o jogo · fonte oficial: <a href={game.verified.source} target="_blank" rel="noopener noreferrer">PlayStation Brasil ↗</a>. {game.verified.facts.join(' · ')}</p>}</details></section>
      </>}</div><footer className="footer"><span>{ui('© GAME COMPANION · FEITO PARA JOGAR NO SEU RITMO')}</span><span>{ui('DADOS LOCAIS · SEM CONTA · SEM ENVIO')}</span></footer>
    </main>{notice && <div role="status" className="toast"><span>{notice}</span><button aria-label={interfaceLanguage === "en" ? "Close notice" : "Fechar aviso"} onClick={() => setNotice('')}>×</button></div>}
  </div>
}

export default GuideApp

// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import App from '../src/App'
import { pbzContent } from '../src/data/games/phantom-blade-zero'
import { regionMapUrl } from '../src/data/games/phantom-blade-zero/mapLinks'
import { makeBackup, STORAGE_KEY } from '../src/storage'
import { GAME_LANGUAGE_KEY, INTERFACE_LANGUAGE_KEY, INVALID_V2_SNAPSHOT_KEY, PROGRESS_V2_KEY, SETTINGS_KEY, THEME_KEY } from '../src/repositories/local'

beforeEach(() => { localStorage.clear(); delete document.documentElement.dataset.theme })
afterEach(() => { cleanup(); delete document.documentElement.dataset.theme; vi.restoreAllMocks() })
function openGame() { fireEvent.click(screen.getByRole('heading', { name: 'Phantom Blade Zero' }).closest('button')!) }

describe('guia real no navegador', () => {
  it('abre o mapa da região selecionada em outra aba e desabilita na visão global', () => {
    render(<App />); openGame()
    const map = screen.getByRole('link', { name: 'Abrir mapa da região ↗' })
    expect(map.getAttribute('href')).toBe('https://metabot.gg/pt_BR/phantom-blade-zero/map?region=weeping-creek-valley')
    expect(map.getAttribute('target')).toBe('_blank')
    expect(map.getAttribute('rel')).toBe('noopener noreferrer')
    fireEvent.click(screen.getByRole('button', { name: /Mirage Estate/ }))
    expect(screen.getByRole('link', { name: 'Abrir mapa da região ↗' }).getAttribute('href')).toContain('region=mirage-estate')
    fireEvent.click(screen.getByRole('button', { name: 'Visão global' }))
    expect(screen.queryByRole('link', { name: 'Abrir mapa da região ↗' })).toBeNull()
    const disabled = screen.getByRole('button', { name: 'Abrir mapa da região ↗' }) as HTMLButtonElement
    expect(disabled.disabled).toBe(true)
    expect(disabled.parentElement?.getAttribute('title')).toBe('Selecione uma região para abrir o mapa.')
    fireEvent.change(screen.getByRole('combobox', { name: 'Idioma da interface' }), { target: { value: 'en' } })
    expect(screen.getByRole('button', { name: 'Open region map ↗' }).parentElement?.getAttribute('title')).toBe('Select a region to open its map.')
    fireEvent.click(within(screen.getByRole('group', { name: 'Select region' })).getByRole('button', { name: /Crimson Forest/ }))
    expect(screen.getByRole('link', { name: 'Open region map ↗' }).getAttribute('href')).toBe('https://metabot.gg/en/phantom-blade-zero/map?region=crimson-forest')
    expect(localStorage.getItem(PROGRESS_V2_KEY)).toBeNull()
  })

  it('cobre todas as regiões com links individuais, sem link para visão global', () => {
    for (const region of pbzContent.regions) {
      const url = regionMapUrl(region.id, 'pt-BR')
      expect(url).toMatch(/^https:\/\/metabot\.gg\/pt_BR\/phantom-blade-zero\/map\?region=[a-z-]+$/)
      expect(regionMapUrl(region.id, 'en')).toContain('/en/phantom-blade-zero/map?region=')
    }
    expect(regionMapUrl('Todas', 'pt-BR')).toBeNull()
  })
  it('sincroniza chefe e troféu na interface sem apagar a etapa ao desmarcar o troféu', () => {
    render(<App />); openGame()
    fireEvent.click(screen.getByText('Chefes', { selector: 'summary' }))
    fireEvent.click(screen.getByText('Troféus', { selector: 'summary' }))
    const boss = screen.getByRole('checkbox', { name: 'Concluir: Derrotar Axemaster Peng Meng' }) as HTMLInputElement
    const trophy = screen.getByRole('checkbox', { name: 'Concluir: The Axe’s Grudge' }) as HTMLInputElement
    fireEvent.click(boss)
    expect(trophy.checked).toBe(true)
    expect(JSON.parse(localStorage.getItem(PROGRESS_V2_KEY)!).completed.pbz).toEqual(expect.arrayContaining(['boss-peng-meng', 'trophy-axes-grudge']))
    fireEvent.click(trophy)
    expect(trophy.checked).toBe(false)
    expect(boss.checked).toBe(true)
    fireEvent.click(trophy)
    expect(trophy.checked).toBe(true)
    fireEvent.click(boss)
    expect(trophy.checked).toBe(false)
    expect(boss.checked).toBe(false)
  })
  it('alterna idiomas independentes com nomes PSN PT-BR sem mudar IDs nem progresso', () => {
    const { unmount } = render(<App />)
    const interfaceSelect = screen.getByRole('combobox', { name: 'Idioma da interface' })
    expect(interfaceSelect.closest('.site-header')).not.toBeNull()
    expect(interfaceSelect.closest('.topbar')).toBeNull()
    expect(screen.queryByRole('combobox', { name: 'Idioma dos itens' })).toBeNull()
    openGame()
    const gameSelect = screen.getByRole('combobox', { name: 'Idioma dos itens' })
    expect(gameSelect.closest('.checklist-heading')).not.toBeNull()
    expect(gameSelect.closest('.topbar')).toBeNull()
    expect(interfaceSelect.parentElement?.textContent).toContain('🇧🇷')
    expect(gameSelect.parentElement?.textContent).toContain('🇺🇸')
    fireEvent.click(screen.getByRole('button', { name: 'Visão global' }))
    fireEvent.click(screen.getByRole('button', { name: 'Troféus' }))
    expect(screen.getByText('With Heart and Blood')).toBeDefined()
    fireEvent.change(screen.getByRole('combobox', { name: 'Idioma dos itens' }), { target: { value: 'pt-BR' } })
    expect(screen.getByRole('button', { name: /Vale do Córrego dos Prantos/ })).toBeDefined()
    expect(gameSelect.parentElement?.textContent).toContain('🇧🇷')
    expect(screen.getByText('Sangue e Coração')).toBeDefined()
    expect(screen.queryByText('With Heart and Blood')).toBeNull()
    const checkbox = screen.getByRole('checkbox', { name: 'Concluir: Sangue e Coração' }) as HTMLInputElement
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)
    const snapshot = localStorage.getItem(PROGRESS_V2_KEY)
    fireEvent.change(screen.getByRole('combobox', { name: 'Idioma da interface' }), { target: { value: 'en' } })
    expect(interfaceSelect.parentElement?.textContent).toContain('🇺🇸')
    expect(screen.getByRole('heading', { name: /Checklist by region/ })).toBeDefined()
    expect(screen.getByText('Sangue e Coração')).toBeDefined()
    expect(document.documentElement.lang).toBe('en')
    fireEvent.change(screen.getByRole('combobox', { name: 'Game item language' }), { target: { value: 'en' } })
    expect(screen.getByRole('button', { name: /Weeping Valley Creek/ })).toBeDefined()
    expect(screen.getByText('With Heart and Blood')).toBeDefined()
    expect(localStorage.getItem(PROGRESS_V2_KEY)).toBe(snapshot)
    expect(localStorage.getItem(INTERFACE_LANGUAGE_KEY)).toBe('en')
    expect(localStorage.getItem(GAME_LANGUAGE_KEY)).toBe('en')
    unmount(); render(<App />); openGame()
    expect(screen.getByRole('heading', { name: /Checklist by region/ })).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'All regions' }))
    fireEvent.click(screen.getByRole('button', { name: 'Trophies' }))
    expect((screen.getByRole('checkbox', { name: 'Complete: With Heart and Blood' }) as HTMLInputElement).checked).toBe(true)
  })
  it('apresenta nove etapas, troféus e informação do cabeçalho sem checklist demonstrativo', () => {
    render(<App />); openGame()
    expect(screen.getByRole('heading', { name: /Checklist por região/ })).toBeDefined()
    const metrics = screen.getByRole('region', { name: 'Informações da platina' })
    expect(within(metrics).getByText('36')).toBeDefined()
    expect(metrics.querySelectorAll('svg')).toHaveLength(7)
    expect(metrics.textContent).not.toContain('PowerPyx')
    expect(screen.getByRole('img', { name: /Arte oficial de Phantom Blade Zero/ }).getAttribute('src')).toContain('phantom-blade-zero-official.jpg')
    expect(screen.getByRole('progressbar').getAttribute('aria-valuemax')).toBe('35')
    expect(within(screen.getByRole('group', { name: 'Selecionar região' })).getAllByRole('button')).toHaveLength(10)
    expect(screen.getByRole('button', { name: /Crimson Forest/ })).toBeDefined()
    expect(screen.queryByRole('combobox', { name: 'Nível de dicas' })).toBeNull()
    expect(screen.queryByText('Definir um objetivo pessoal')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Antes de sair desta região' })).toBeDefined()
  })

  it('inicia escuro em azul, alterna para claro e persiste tema sem alterar o progresso', () => {
    const { unmount } = render(<App />)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(screen.getByRole('button', { name: 'Ativar tema claro' })).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Ativar tema claro' }))
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem(THEME_KEY)).toBe('light')
    expect(localStorage.getItem(PROGRESS_V2_KEY)).toBeNull()
    unmount(); render(<App />)
    expect(document.documentElement.dataset.theme).toBe('light')
    fireEvent.click(screen.getByRole('button', { name: 'Ativar tema escuro' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem(THEME_KEY)).toBe('dark')
  })

  it('marca objetivo real por ID em v2, alterna região e persiste na remontagem', () => {
    const { unmount } = render(<App />); openGame()
    const group = screen.getByText('Troféus', { selector: 'summary' }).closest('details')!
    fireEvent.click(within(group).getByText('Troféus', { selector: 'summary' }))
    const item = within(group).getAllByRole('checkbox')[0] as HTMLInputElement
    fireEvent.click(item)
    expect(item.checked).toBe(true)
    expect(JSON.parse(localStorage.getItem(PROGRESS_V2_KEY)!).schemaVersion).toBe(2)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Visão global' }))
    expect(screen.getByText(/A visão global inclui objetivos/)).toBeDefined()
    unmount(); render(<App />); openGame()
    const restoredGroup = screen.getByText('Troféus', { selector: 'summary' }).closest('details')!
    fireEvent.click(within(restoredGroup).getByText('Troféus', { selector: 'summary' }))
    expect((within(restoredGroup).getAllByRole('checkbox')[0] as HTMLInputElement).checked).toBe(true)
  })

  it('mostra nomes sem combo e só revela detalhes após clicar no olho da linha, sem alterar a marcação', () => {
    const objective = pbzContent.objectives.find(item => item.category === 'trophy' && item.regionIds.includes('weeping'))!
    localStorage.setItem(SETTINGS_KEY, '2') // preferência antiga permanece intacta, mas não libera descrições.
    const { unmount } = render(<App />); openGame()
    const trophyGroup = screen.getByText('Troféus', { selector: 'summary' }).closest('details')!
    fireEvent.click(within(trophyGroup).getByText('Troféus', { selector: 'summary' }))
    expect(within(trophyGroup).getByText(objective.title)).toBeDefined()
    expect(document.body.innerHTML).not.toContain(objective.description)
    const eye = within(trophyGroup).getByRole('button', { name: `Ver descrição de ${objective.title}` })
    const checkbox = within(trophyGroup).getByRole('checkbox', { name: `Concluir: ${objective.title}` }) as HTMLInputElement
    fireEvent.click(eye)
    expect(screen.getByText(objective.description)).toBeDefined()
    expect(within(trophyGroup).getByRole('button', { name: `Ocultar descrição de ${objective.title}` }).getAttribute('aria-expanded')).toBe('true')
    expect(checkbox.checked).toBe(false)
    fireEvent.click(within(trophyGroup).getByRole('button', { name: `Ocultar descrição de ${objective.title}` }))
    expect(document.body.innerHTML).not.toContain(objective.description)
    const search = screen.getByPlaceholderText('Buscar pelo nome...')
    fireEvent.change(search, { target: { value: objective.title } })
    expect(within(trophyGroup).getByText(objective.title)).toBeDefined()
    fireEvent.change(search, { target: { value: objective.description } })
    expect(screen.getByText(/Nenhum objetivo para esta seleção/)).toBeDefined()
    expect(localStorage.getItem(SETTINGS_KEY)).toBe('2')
    unmount(); render(<App />); openGame()
    expect(document.body.innerHTML).not.toContain(objective.description)
  })

  it('filtra região e perdíveis pendentes sem perder marcações compartilhadas', () => {
    render(<App />); openGame()
    fireEvent.click(screen.getByRole('button', { name: 'Perdíveis', exact: true }))
    expect(screen.getAllByText(/perdíveis e .* pré-requisitos/).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Pendentes', exact: true }))
    expect(screen.getByRole('button', { name: 'Pendentes', exact: true }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Visão global' }))
    expect(screen.getByText(/A visão global inclui objetivos/)).toBeDefined()
  })

  it('avisa em Crimson sobre Apprentice Healer pendente da etapa anterior', () => {
    render(<App />); openGame()
    fireEvent.click(screen.getByRole('button', { name: /Crimson Forest/ }))
    const warning = screen.getByRole('region', { name: 'Antes de sair desta região' })
    expect(within(warning).getAllByText(/Pré-requisito anterior:/).some(item => item.textContent?.includes('Apprentice Healer'))).toBe(true)
  })

  it('reserva condições de bloqueio do final para o olho, mantendo o nome visível', () => {
    const gate = pbzContent.objectives.find(item => item.id === 'ending-mirage-gate')!
    render(<App />); openGame()
    fireEvent.click(screen.getByRole('button', { name: /Mirage Estate/ }))
    const group = screen.getByText('Perdíveis', { selector: 'summary' }).closest('details')!
    fireEvent.click(within(group).getByText('Perdíveis', { selector: 'summary' }))
    expect(within(group).getByText(gate.title)).toBeDefined()
    expect(document.body.textContent).not.toContain(gate.description)
    fireEvent.click(within(group).getByRole('button', { name: `Ver descrição de ${gate.title}` }))
    expect(document.body.textContent).toContain(gate.description)
    expect(document.body.textContent).toContain(gate.missableBefore!)
  })

  it('mantém links gerais acessíveis sem spoilers', () => {
    render(<App />); openGame()
    const support = screen.getByRole('heading', { name: 'Painel de apoio' }).closest('section')!
    expect(within(support).getAllByRole('link').some(link => link.getAttribute('href')?.includes('trophy-guide-roadmap'))).toBe(true)
    expect(within(support).getAllByRole('link').some(link => link.getAttribute('href')?.includes('playstation.com'))).toBe(true)
  })

  it('valida importação v1 e pede confirmação antes de substituir progresso', async () => {
    render(<App />); openGame()
    const json = JSON.stringify(makeBackup({ pbz: ['pbz-prep-goals'], demo: [] }))
    const file = new File([json], 'backup.json', { type: 'application/json' })
    Object.defineProperty(file, 'text', { value: async () => json })
    const confirmation = vi.spyOn(window, 'confirm').mockReturnValue(false)
    fireEvent.change(screen.getByLabelText('Selecionar arquivo JSON de progresso'), { target: { files: [file] } })
    await waitFor(() => expect(confirmation).toHaveBeenCalled())
    expect(localStorage.getItem(PROGRESS_V2_KEY)).toBeNull()
    confirmation.mockReturnValue(true)
    fireEvent.change(screen.getByLabelText('Selecionar arquivo JSON de progresso'), { target: { files: [file] } })
    await waitFor(() => expect(JSON.parse(localStorage.getItem(PROGRESS_V2_KEY)!).completed.pbz).toContain('pbz-prep-goals'))
    expect(screen.queryByText('Definir um objetivo pessoal')).toBeNull()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')
  })

  it('bloqueia marcações se v2 estiver corrompido até importação explícita, preservando valor bruto', async () => {
    localStorage.setItem(PROGRESS_V2_KEY, '{dados originais')
    render(<App />); openGame()
    expect(screen.getByRole('alert').textContent).toMatch(/ilegível/)
    expect(screen.getAllByRole('checkbox').every(element => (element as HTMLInputElement).disabled)).toBe(true)
    const json = JSON.stringify(makeBackup({ pbz: [], demo: [] }))
    const file = new File([json], 'backup.json', { type: 'application/json' })
    Object.defineProperty(file, 'text', { value: async () => json })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    fireEvent.change(screen.getByLabelText('Selecionar arquivo JSON de progresso'), { target: { files: [file] } })
    await waitFor(() => expect(localStorage.getItem(INVALID_V2_SNAPSHOT_KEY)).toBe('{dados originais'))
    expect(screen.queryByRole('alert')).toBeNull()
  })
})

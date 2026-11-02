// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import App from '../src/App'
import { pbzContent } from '../src/data/games/phantom-blade-zero'
import { makeBackup, STORAGE_KEY } from '../src/storage'
import { INVALID_V2_SNAPSHOT_KEY, PROGRESS_V2_KEY, SETTINGS_KEY } from '../src/repositories/local'

beforeEach(() => localStorage.clear())
afterEach(() => { cleanup(); vi.restoreAllMocks() })
function openGame() { fireEvent.click(screen.getByRole('heading', { name: 'Phantom Blade Zero' }).closest('button')!) }
function selectSpoilers(value: string) { fireEvent.change(screen.getByRole('combobox', { name: 'Nível de dicas' }), { target: { value } }) }

describe('guia real no navegador', () => {
  it('apresenta nove etapas, troféus e informação do cabeçalho sem checklist demonstrativo', () => {
    render(<App />); openGame()
    expect(screen.getByRole('heading', { name: /Checklist por região/ })).toBeDefined()
    expect(screen.getByText(/36 · 1 platina/)).toBeDefined()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuemax')).toBe('35')
    expect(screen.getAllByRole('button', { name: /Etapa \d/ })).toHaveLength(9)
    expect(screen.queryByText('Definir um objetivo pessoal')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Antes de sair desta região' })).toBeDefined()
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

  it('protege título, descrição e pesquisa no nível zero e persiste preferência', () => {
    const objective = pbzContent.objectives.find(item => item.spoiler === 2 && item.regionIds.includes('weeping'))!
    const { unmount } = render(<App />); openGame()
    expect(document.body.textContent).not.toContain(objective.title)
    expect(document.body.innerHTML).not.toContain(objective.title)
    expect(document.body.innerHTML).not.toContain(objective.description)
    expect(document.body.innerHTML).not.toContain('phantom-blade-zero-true-ending-guide')
    const search = screen.getByPlaceholderText('Buscar objetivo visível...')
    fireEvent.change(search, { target: { value: objective.title } })
    expect(screen.getByText(/Nenhum objetivo visível/)).toBeDefined()
    fireEvent.change(search, { target: { value: '' } })
    selectSpoilers('2')
    expect(document.body.textContent).toContain(objective.title)
    expect(localStorage.getItem(SETTINGS_KEY)).toBe('2')
    unmount(); render(<App />); openGame()
    expect((screen.getByRole('combobox', { name: 'Nível de dicas' }) as HTMLSelectElement).value).toBe('2')
  })

  it('filtra região e perdíveis pendentes sem perder marcações compartilhadas', () => {
    render(<App />); openGame(); selectSpoilers('2')
    fireEvent.click(screen.getByRole('button', { name: 'Perdíveis', exact: true }))
    expect(screen.getAllByText(/perdíveis e .* pré-requisitos/).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Pendentes', exact: true }))
    expect(screen.getByRole('button', { name: 'Pendentes', exact: true }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Visão global' }))
    expect(screen.getByText(/A visão global inclui objetivos/)).toBeDefined()
  })

  it('avisa em Crimson sobre Apprentice Healer pendente da etapa anterior', () => {
    render(<App />); openGame(); selectSpoilers('2')
    fireEvent.click(screen.getByRole('button', { name: /02 · 0%Crimson Forest/ }))
    const warning = screen.getByRole('region', { name: 'Antes de sair desta região' })
    expect(within(warning).getAllByText(/Pré-requisito anterior:/).some(item => item.textContent?.includes('Apprentice Healer'))).toBe(true)
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

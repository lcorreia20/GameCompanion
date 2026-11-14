import { describe, expect, it } from 'vitest'
import { trophies } from '../src/data/games/phantom-blade-zero/trophies'
import { quests } from '../src/data/games/phantom-blade-zero/quests'
import { gameName, questNamesPtBR, trophyNamesPtBR } from '../src/data/games/phantom-blade-zero/localization'
import { regionNamesPtBR } from '../src/data/games/phantom-blade-zero/localization'
import { regions } from '../src/data/games/phantom-blade-zero/regions'

describe('nomes PSN e fallback', () => {
  it('cobre os 36 IDs de troféu e os 11 títulos de missão presentes nas descrições PSN', () => {
    expect(Object.keys(trophyNamesPtBR).sort()).toEqual(trophies.map(trophy => trophy.id).sort())
    expect(Object.keys(questNamesPtBR).every(id => quests.some(quest => quest.id === id))).toBe(true)
    expect(Object.keys(questNamesPtBR)).toHaveLength(11)
  })
  it('não inventa tradução para títulos ausentes e mantém o nome inglês quando solicitado', () => {
    expect(gameName('trophy', 'with-heart-and-blood', 'With Heart and Blood', 'pt-BR')).toBe('Sangue e Coração')
    expect(gameName('quest', 'deep-valley', 'Deep in the Valley', 'pt-BR')).toBe('Deep in the Valley')
    expect(gameName('trophy', 'with-heart-and-blood', 'With Heart and Blood', 'en')).toBe('With Heart and Blood')
  })
  it('localiza as nove áreas por ID sem alterar os dados do roteiro', () => {
    expect(Object.keys(regionNamesPtBR).sort()).toEqual(regions.map(region => region.id).sort())
    expect(gameName('region', 'mandate', 'Mandate Encampment', 'pt-BR')).toBe('Acampamento da Irmandade')
    expect(gameName('region', 'mandate', 'Mandate Encampment', 'en')).toBe('Mandate Encampment')
    expect(regions.find(region => region.id === 'mandate')?.name).toBe('Mandate Encampment')
  })
})

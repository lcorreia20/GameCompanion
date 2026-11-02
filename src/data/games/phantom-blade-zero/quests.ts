import type { Quest, QuestStep } from './types'
import { sourceUrls as s } from './sources'

const step = (id: string, description: string, regionId?: string, before?: string, urls: string[] = [s.trophies]): QuestStep => ({ id, description, ...(regionId ? { regionId } : {}), ...(before ? { before } : {}), sourceUrls: urls })
const quest = (id: string, name: string, regionIds: string[], missable: boolean, steps: QuestStep[], urls: string[] = [s.trophies]): Quest => ({ id, name, regionIds, missable, requiredForPlatinum: true, steps, sourceUrls: urls })
const mirageCutoff = 'Antes de entrar em Mirage Estate pela Green Serpent House (aviso no jogo).'

// Os dez contos de ícone roxo estão na ordem publicada para o final verdadeiro;
// o guia de final não especifica etapas individuais para nove deles: não extrapolar.
const purpleBeforeMirage = [
  ['deep-valley', 'Deep in the Valley'],
  ['illusion-inanis', 'Illusion of Inanis'],
  ['sha-chi-boat', 'Sha-Chi Powered Boat'],
  ['allure-vanity', 'Allure of Vanity'],
  ['illusory-pipa', 'Illusory Pipa'],
  ['pillars-kunlun', 'Pillars of Kunlun'],
  ['whence-weeping', 'Whence the Weeping'],
  ['heralds-illusion', 'The Herald’s Illusion'],
  ['crimson-manor', 'Crimson Manor'],
] as const

export const quests: Quest[] = [
  ...purpleBeforeMirage.map(([id, name]) => quest(id, name, [], true,
    [step(`${id}-before-mirage`, `Concluir o conto roxo “${name}” para habilitar o final verdadeiro. O guia de final não detalha aqui os passos individuais.`, undefined, mirageCutoff, [s.ending])], [s.ending])),
  quest('secrets-lake', 'Secrets at the Heart of the Lake', ['village', 'meigu'], true, [
    step('secrets-lake-start', 'Iniciar ao obter uma das Memory Flowers de Firefly em Village of Lu.', 'village', undefined, [s.trophies, s.village]),
    step('secrets-lake-complete', 'Concluir todas as etapas do conto roxo para o final verdadeiro e o troféu Forbidden Arts Beneath the Lake; consultar guia específico para etapas não descritas no roteiro.', undefined, mirageCutoff, [s.ending, s.trophies]),
  ], [s.trophies, s.ending, s.village]),
  quest('bloodline-awakening', 'Bloodline Awakening', ['weeping', 'crimson', 'meigu', 'pangzhen'], false, [
    step('bloodline-start', 'Descobrir o primeiro Long Pillar para iniciar o conto; a ordem dos locais pode variar.', undefined, undefined, [s.trophies]),
    ...([['weeping', 'Weeping Creek Valley'], ['crimson', 'Crimson Forest'], ['meigu-east', 'Meigu Lake East'], ['meigu-ruins', 'Meigu Lake, Phantom Illusionist Ruins'], ['pangzhen', 'Pangzhen']] as const)
      .map(([id, label]) => step(`bloodline-${id}`, `Concluir o desafio Long Pillar em ${label}.`, id.startsWith('meigu') ? 'meigu' : id, undefined, [s.trophies])),
  ], [s.trophies, s.ending]),
  quest('severed-mindseal', 'A Severed Mindseal', ['weeping', 'meigu', 'crimson'], true, [
    step('mindseal-accept', 'Falar com Shadow Warden no sino Valley Sha-Chi Tower Summit.', 'weeping', 'Concluir o primeiro objetivo antes de sair da área; gatilho exato de falha desconhecido.', [s.trophies, s.weeping]),
    step('mindseal-stone-1', 'Obter a manivela do forno com o inimigo abaixo da escada, abrir o forno no 1º andar, recolher a manivela e entregar Primal Stone a Shadow Warden.', 'weeping', 'Antes de deixar a primeira região (recomendação do guia).', [s.trophies, s.weeping]),
    step('mindseal-stone-2', 'Reencontrar Shadow Warden na torre Sha-Chi de Meigu Lake, acessível pelos cais ao norte de Pangzhen.', 'meigu'),
    step('mindseal-stone-3', 'Após Mirage Estate, retornar à torre Sha-Chi na área congelada de Crimson Forest e entregar a última Primal Stone.', 'crimson'),
  ], [s.trophies, s.weeping]),
  quest('apprentice-healer', 'Apprentice Healer', ['weeping'], true, [
    step('apprentice-start', 'Após Peng Meng, pedir a Yu’er, no sino Outpost, a missão de coletar ervas.', 'weeping', 'Antes de derrotar Jing Ye em Crimson Forest.', [s.trophies, s.weeping]),
    step('apprentice-vine', 'Coletar Blood-Stopper Vine perto de Axemaster’s Holding Cell.', 'weeping', undefined, [s.weeping]),
    step('apprentice-leaf', 'Coletar Congealeaf na área da Rusted Loong Key.', 'weeping', undefined, [s.weeping]),
    step('apprentice-goldweed', 'Coletar Blemish Goldweed junto ao Long Pillar de Weeping Creek.', 'weeping', undefined, [s.weeping]),
    step('apprentice-return', 'Entregar as três ervas a Yu’er no Outpost.', 'weeping', 'Antes de derrotar Jing Ye, The Outlaw em Crimson Forest.', [s.trophies, s.crimson]),
  ], [s.trophies, s.weeping, s.crimson]),
  quest('flesh-lily', 'Flesh Lily', ['weeping', 'pangzhen'], true, [
    step('lily-start', 'O conto começa automaticamente ao encontrar Yu’er.', 'weeping', undefined, [s.weeping]),
    step('lily-pickup', 'Derrotar Hua na área Flesh Lily Fields e pegar Twin Flesh Lilies junto ao altar.', 'weeping', undefined, [s.trophies, s.weeping]),
    step('lily-yuer', 'Entregar as flores a Yu’er no Outpost.', 'weeping', 'Antes de derrotar Bai Chilian em Crimson Forest (recomendação do roteiro).', [s.trophies, s.weeping]),
    step('lily-pangzhen', 'Após Chang Hong em Pangzhen, falar com o idoso na casa de Yu’er para concluir.', 'pangzhen'),
  ], [s.trophies, s.weeping]),
  quest('healers-mercy', 'A Healer’s Mercy', ['crimson'], true, [
    step('mercy-accept', 'Aceitar com Yu’er perto do sino Thieves’ Camp.', 'crimson', 'Antes de derrotar Bai Chilian.', [s.crimson]),
    step('mercy-small-cave', 'Atender o ferido na caverna pequena perto de Outlaw Trap.', 'crimson', undefined, [s.trophies, s.crimson]),
    step('mercy-large-cave', 'Atender o ferido na caverna maior perto de Outlaw Trap.', 'crimson', undefined, [s.trophies, s.crimson]),
    step('mercy-lodge', 'Atender o ferido na área sob a escada de Cliffside Lodge.', 'crimson', undefined, [s.trophies, s.crimson]),
    step('mercy-dungeon', 'Pegar Thieves’ Camp Dungeon Key sob a adega de Cliffside Lodge e atender o ferido atrás da porta trancada do acampamento.', 'crimson', undefined, [s.trophies, s.crimson]),
    step('mercy-return', 'Voltar a Yu’er após tratar os quatro feridos.', 'crimson', 'Antes de derrotar Bai Chilian, Lady of the Twin Serpents.', [s.trophies, s.crimson]),
  ], [s.trophies, s.crimson]),
  quest('secrets-baishan', 'Secrets of the Baishan Sect', ['crimson', 'mandate'], true, [
    step('baishan-accept', 'Falar com Lanlan na ponte junto ao Thieves’ Camp.', 'crimson', 'Aceitar antes de derrotar Bai Chilian.', [s.trophies, s.crimson]),
    step('baishan-cellar', 'Na Cliffside Lodge, usar as manivelas da adega e da câmara secreta para falar com a garota.', 'crimson', undefined, [s.trophies, s.crimson]),
    step('baishan-body', 'Após Wu Lengshuang em Mandate Encampment, examinar o corpo nas flores.', 'mandate', 'Antes de avançar para a etapa de Yubi; ignorar o corpo pode falhar o conto.', [s.trophies]),
    step('baishan-yubi', 'Derrotar Yubi em Mandate Encampment e concluir a sequência do conto.', 'mandate'),
  ], [s.trophies, s.crimson]),
  quest('journey-home', 'The Journey Home', ['village', 'pangzhen'], true, [
    step('journey-accept', 'Falar com Old Man Gen junto ao sino de seu esconderijo.', 'village', undefined, [s.trophies, s.village]),
    step('journey-return', 'Após abrir a passagem para Pangzhen, voltar a Old Man Gen e aceitar o pedido seguinte.', 'village', 'Antes de entrar em Pangzhen (recomendação do roteiro).', [s.trophies, s.village]),
    step('journey-house', 'Em Pangzhen, encontrar a casa de Old Man Gen, abrir a porta e examinar o corpo.', 'pangzhen'),
    step('journey-finish', 'Retornar a Old Man Gen em Village of Lu.', 'village'),
  ], [s.trophies, s.village]),
  quest('young-master-lan', 'Young Master Lan', ['village', 'pangzhen'], true, [
    step('lan-accept', 'Falar com Young Master Lan no sino de seu esconderijo.', 'village', undefined, [s.trophies, s.village]),
    step('lan-return', 'Após abrir a passagem para Pangzhen, voltar a falar com Young Master Lan.', 'village', 'Antes de entrar em Pangzhen (recomendação do roteiro).', [s.trophies, s.village]),
    step('lan-key', 'Em Pangzhen, encontrá-lo em Pavilion of Knowledge Crossroads e receber Lan Manor Key.', 'pangzhen'),
    step('lan-rest', 'Descansar em um sino, voltar, derrotar os inimigos e conversar com ele.', 'pangzhen'),
    step('lan-manor', 'Entrar no solar e concluir a cena.', 'pangzhen'),
  ], [s.trophies, s.village]),
  quest('quick-hands-requests', 'Quick Hand’s Requests', ['crimson', 'village', 'pangzhen', 'meigu', 'mirage'], false, [
    step('quick-rescue', 'Resgatar Quick Hand Zhang perto de Trail of Cages e iniciar os pedidos no esconderijo em Crimson Forest.', 'crimson', undefined, [s.trophies, s.crimson]),
    ...([['crimson', 3], ['village', 3], ['pangzhen', 4], ['meigu', 4], ['mirage', 3]] as const).map(([id, count]) => step(`quick-${id}`, `Reunir e entregar a Zhang os ${count} tesouros desta etapa.`, id, undefined, [s.trophies, s.collectibles])),
  ], [s.trophies, s.collectibles]),
  quest('heart-banyan', 'Heart of the Banyan', ['crimson', 'pangzhen', 'mandate', 'meigu', 'mountain'], false, [
    step('banyan-start', 'O conto começa após o segundo encontro com Illusion of Inanis.'),
    ...(['crimson', 'pangzhen', 'mandate', 'meigu', 'mountain'] as const).map(id => step(`banyan-${id}`, 'Concluir o desafio Banyan Tree nesta região.', id, undefined, [s.trophies, s.collectibles])),
  ], [s.trophies, s.collectibles]),
]

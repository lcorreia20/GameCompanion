import type { Trophy } from './types'
import { sourceUrls as s } from './sources'

// Nomes e condições dos troféus PS5; requisitos resumidos em português, sem reproduzir o guia.
const entries: Array<[string, string, string, Trophy['rarity'], string[], string[]?]> = [
  ['defy-destiny', 'Defy Destiny', 'Obter todos os demais troféus.', 'platinum', []],
  ['hearts-journey', 'The Heart’s Journey', 'Escapar dos perseguidores na estrada principal.', 'bronze', ['weeping']],
  ['with-heart-and-blood', 'With Heart and Blood', 'Concluir o final verdadeiro (All Comes to Light).', 'gold', ['soulrend'], ['deep-valley', 'illusion-inanis', 'sha-chi-boat', 'allure-vanity', 'illusory-pipa', 'pillars-kunlun', 'whence-weeping', 'heralds-illusion', 'crimson-manor', 'secrets-lake', 'bloodline-awakening']],
  ['axes-grudge', 'The Axe’s Grudge', 'Derrotar Axemaster Peng Meng.', 'bronze', ['weeping']],
  ['scarlet-wraithblade', 'Scarlet Wraithblade', 'Derrotar Hua, the Bride.', 'bronze', ['weeping']],
  ['the-hunt', 'The Hunt', 'Derrotar the Hunt, Hunter of the Order.', 'silver', ['weeping']],
  ['thousand-cups', 'A Thousand Cups Drained', 'Derrotar Hua Qianxiao, the Sword Fanatic.', 'bronze', ['crimson']],
  ['shattered-mirror', 'The Shattered Mirror', 'Derrotar Bai Chilian, Lady of the Twin Serpents.', 'silver', ['crimson']],
  ['meet-again', 'Will We Meet Again?', 'Derrotar Mu Xiaokui, the Young Mistress of the Order.', 'silver', ['village']],
  ['lions-spirit', 'The Lion’s Spirit Lives On', 'Derrotar Flame, the Lion Dance Grandmaster.', 'silver', ['pangzhen']],
  ['seven-stars', 'Sword Against the Seven-Stars', 'Derrotar o Chief Disciple of the Seven-Stars.', 'silver', ['mandate']],
  ['crossroads-blood', 'Crossroads of Blood', 'Derrotar Huangxing, the Kunlun Renegade.', 'silver', ['mountain']],
  ['nothing-waste', 'Nothing Goes to Waste', 'Derrotar the Puppet Scavenger.', 'silver', ['weeping']],
  ['return-dust', 'All Return to Dust', 'Derrotar Lei Dang, the Order’s Envoy.', 'silver', ['mirage']],
  ['white-shadow', 'The White Shadow', 'Derrotar the Blizzard Blademaster.', 'silver', ['meigu']],
  ['saw-through', 'Saw It Through', 'Derrotar the Saw and the Crusher.', 'silver', ['soulrend']],
  ['dreams-end', 'All Dreams Must End', 'Fazer os planos de Meng Hua fracassarem; derrotar a chefe final normal.', 'gold', ['soulrend']],
  ['misty-waters', 'Master of the Misty Waters', 'Derrotar Blackwater Leader You Loong, Zither Maiden Yan Qiansui e the One-Eyed Archer em Meigu Lake.', 'bronze', ['meigu']],
  ['four-freed', 'The Four Freed', 'Derrotar os quatro Great Puppets: Yuzan, Yubi, Yuding e Yucong.', 'gold', ['village', 'mandate', 'mirage', 'crimson']],
  ['two-blade-masters', 'The Two Blade Masters', 'Derrotar Zhu Yuan e Commander Bi Feng.', 'bronze', ['meigu', 'mountain']],
  ['three-wardens', 'Three Wardens Fall', 'Derrotar Shadow Wardens Cavalrybane, Soulclaimer e Heartpiercer.', 'bronze', ['pangzhen', 'meigu']],
  ['forbidden-arts', 'Forbidden Arts Beneath the Lake', 'Concluir Secrets at the Heart of the Lake.', 'silver', ['village', 'meigu'], ['secrets-lake']],
  ['phantom-and-blade', 'Phantom and Blade', 'Concluir Bloodline Awakening (cinco Long Pillars).', 'silver', ['weeping', 'crimson', 'meigu', 'pangzhen'], ['bloodline-awakening']],
  ['last-baishan', 'The Last of Baishan', 'Concluir Secrets of the Baishan Sect.', 'bronze', ['crimson', 'mandate'], ['secrets-baishan']],
  ['together-end', 'Together Till the End', 'Concluir The Journey Home.', 'bronze', ['village', 'pangzhen'], ['journey-home']],
  ['wanderers-honor', 'A Wanderer’s Honor', 'Concluir Young Master Lan.', 'bronze', ['village', 'pangzhen'], ['young-master-lan']],
  ['spectral-blade', 'Spectral Blade', 'Concluir A Severed Mindseal.', 'bronze', ['weeping', 'meigu', 'crimson'], ['severed-mindseal']],
  ['healers-legacy', 'The Healer’s Legacy', 'Concluir Flesh Lily, Apprentice Healer e A Healer’s Mercy.', 'bronze', ['weeping', 'crimson', 'pangzhen'], ['flesh-lily', 'apprentice-healer', 'healers-mercy']],
  ['lost-found', 'Lost and Found', 'Concluir todos os Quick Hand’s Requests.', 'bronze', ['crimson', 'village', 'pangzhen', 'meigu', 'mirage'], ['quick-hands-requests']],
  ['trees-sorrow', 'Even Trees Know Sorrow', 'Concluir Heart of the Banyan (cinco desafios).', 'silver', ['crimson', 'pangzhen', 'mandate', 'meigu', 'mountain'], ['heart-banyan']],
  ['tempered-ten', 'A Tempered Ten', 'Temperar 10 armas.', 'bronze', []],
  ['overwhelming-force', 'Overwhelming Force', 'Elevar uma arma ao nível 30.', 'bronze', []],
  ['every-flower', 'Listen to Every Flower', 'Completar 10 Memory Flowers inteiras (não apenas pétalas).', 'bronze', []],
  ['collectors-notes', 'Collector’s Notes', 'Obter 30 acessórios.', 'silver', []],
  ['phantom-arsenal', 'Phantom Arsenal', 'Temperar 10 Phantom Edges.', 'bronze', []],
  ['skill-strength', 'Skill Over Strength', 'Elevar uma Phantom Edge ao nível 30.', 'bronze', []],
]

const missable = new Set(['with-heart-and-blood', 'forbidden-arts', 'last-baishan', 'together-end', 'wanderers-honor', 'spectral-blade', 'healers-legacy'])

export const trophies: Trophy[] = entries.map(([id, name, requirement, rarity, regionIds, questIds]) => ({
  id, name, requirement, rarity, regionIds, ...(questIds ? { questIds } : {}),
  missable: missable.has(id),
  sourceUrls: [s.trophies, ...(id === 'with-heart-and-blood' || id === 'forbidden-arts' ? [s.ending] : [])],
}))

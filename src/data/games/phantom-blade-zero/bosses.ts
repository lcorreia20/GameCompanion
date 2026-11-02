import type { Boss } from './types'
import { sourceUrls as s } from './sources'

const entries: Array<[string, string, string, boolean, string[]]> = [
  ['peng-meng', 'Axemaster Peng Meng', 'weeping', true, ['axes-grudge']],
  ['hua-bride', 'Hua, the Bride / Deadly Betrothed', 'weeping', false, ['scarlet-wraithblade', 'healers-legacy']],
  ['hunt', 'The Hunt', 'weeping', true, ['the-hunt']],
  ['puppet-scavenger', 'The Puppet Scavenger', 'weeping', false, ['nothing-waste']],
  ['hua-qianxiao', 'Hua Qianxiao, the Sword Fanatic', 'crimson', true, ['thousand-cups']],
  ['jing-ye', 'Jing Ye, The Outlaw', 'crimson', true, []],
  ['bai-chilian', 'Bai Chilian, Lady of the Twin Serpents', 'crimson', true, ['shattered-mirror']],
  ['mu-xiaokui', 'Mu Xiaokui', 'village', true, ['meet-again']],
  ['flame', 'Flame, the Lion Dance Grandmaster', 'pangzhen', true, ['lions-spirit']],
  ['chief-disciple', 'Chief Disciple of the Seven-Stars', 'mandate', false, ['seven-stars']],
  ['huangxing', 'Huangxing, the Kunlun Renegade', 'mountain', false, ['crossroads-blood']],
  ['lei-dang', 'Lei Dang, the Order’s Envoy', 'mirage', true, ['return-dust']],
  ['blizzard-blademaster', 'Blizzard Blademaster', 'meigu', false, ['white-shadow']],
  ['saw-crusher', 'The Saw and the Crusher', 'soulrend', true, ['saw-through']],
  ['meng-hua', 'Meng Hua', 'soulrend', true, ['dreams-end', 'with-heart-and-blood']],
  ['you-loong', 'Blackwater Leader You Loong', 'meigu', false, ['misty-waters']],
  ['yan-qiansui', 'Zither Maiden Yan Qiansui', 'meigu', false, ['misty-waters']],
  ['one-eyed-archer', 'One-Eyed Archer', 'meigu', false, ['misty-waters']],
  ['yuzan', 'Yuzan', 'village', true, ['four-freed']],
  ['yubi', 'Yubi', 'mandate', false, ['four-freed', 'last-baishan']],
  ['yuding', 'Yuding', 'mirage', true, ['four-freed']],
  ['yucong', 'Yucong', 'crimson', false, ['four-freed']],
  ['zhu-yuan', 'Zhu Yuan (também Zhu Yan no corpo do guia)', 'meigu', false, ['two-blade-masters']],
  ['bi-feng', 'Commander Bi Feng', 'mountain', false, ['two-blade-masters']],
  ['cavalrybane', 'Shadow Warden Cavalrybane', 'pangzhen', true, ['three-wardens']],
  ['soulclaimer', 'Shadow Warden Soulclaimer', 'pangzhen', true, ['three-wardens']],
  ['heartpiercer', 'Shadow Warden Heartpiercer', 'meigu', true, ['three-wardens']],
]

export const bosses: Boss[] = entries.map(([id, name, regionId, storyRequired, trophyIds]) => ({
  id, name, regionId, storyRequired, trophyIds,
  sourceUrls: [s.trophies, ...(['hua-bride', 'peng-meng', 'hunt', 'puppet-scavenger'].includes(id) ? [s.weeping] : []),
    ...(['jing-ye', 'bai-chilian', 'hua-qianxiao'].includes(id) ? [s.crimson] : [])],
}))

import type { Region } from './types'
import { sourceUrls as s } from './sources'

export const regions: Region[] = [
  { id: 'weeping', name: 'Weeping Valley Creek', aliases: ['Weeping Creek Valley'], order: 1, sourceUrls: [s.collectibles, s.weeping] },
  { id: 'crimson', name: 'Crimson Forest', order: 2, sourceUrls: [s.collectibles, s.crimson] },
  { id: 'village', name: 'Village of Lu', order: 3, sourceUrls: [s.collectibles, s.village] },
  { id: 'pangzhen', name: 'Pangzhen', order: 4, sourceUrls: [s.collectibles, s.pangzhen] },
  { id: 'mandate', name: 'Mandate Encampment', order: 5, sourceUrls: [s.collectibles, s.mandate] },
  { id: 'meigu', name: 'Meigu Lake', order: 6, sourceUrls: [s.collectibles, s.meigu] },
  { id: 'mountain', name: 'Mountain of Imprisonment', order: 7, sourceUrls: [s.collectibles, s.mountain] },
  { id: 'mirage', name: 'Mirage Estate', parentId: 'pangzhen', order: 8, sourceUrls: [s.collectibles, s.mirage] },
  { id: 'soulrend', name: 'Mount Soulrend', order: 9, sourceUrls: [s.collectibles, s.soulrend] },
]

import type { SourceRef } from './types'

export const sourceUrls = {
  trophies: 'https://www.powerpyx.com/phantom-blade-zero-trophy-guide-roadmap/',
  ending: 'https://www.powerpyx.com/phantom-blade-zero-true-ending-guide/',
  collectibles: 'https://www.powerpyx.com/phantom-blade-zero-collectibles-guide-100-completion/',
  official: 'https://www.playstation.com/pt-br/games/phantom-blade-zero/',
  weeping: 'https://www.powerpyx.com/phantom-blade-zero-weeping-creek-valley-collectible-locations/',
  crimson: 'https://www.powerpyx.com/phantom-blade-zero-crimson-forest-collectible-locations/',
  village: 'https://www.powerpyx.com/phantom-blade-zero-village-of-lu-collectible-locations/',
  pangzhen: 'https://www.powerpyx.com/phantom-blade-zero-pangzhen-collectible-locations/',
  mandate: 'https://www.powerpyx.com/phantom-blade-zero-mandate-encampment-collectible-locations/',
  meigu: 'https://www.powerpyx.com/phantom-blade-zero-meigu-lake-collectible-locations/',
  mountain: 'https://www.powerpyx.com/phantom-blade-zero-mountain-of-imprisonment-collectible-locations/',
  mirage: 'https://www.powerpyx.com/phantom-blade-zero-mirage-estate-pangzhen-collectible-locations/',
  soulrend: 'https://www.powerpyx.com/phantom-blade-zero-mount-soulrend-collectible-locations/',
} as const

export const sources: SourceRef[] = [
  { id: 'powerpyx-trophies', title: 'PowerPyx — Trophy Guide & Roadmap', url: sourceUrls.trophies },
  { id: 'powerpyx-ending', title: 'PowerPyx — True Ending Guide', url: sourceUrls.ending },
  { id: 'powerpyx-collectibles', title: 'PowerPyx — Collectibles Guide', url: sourceUrls.collectibles },
  { id: 'playstation-official', title: 'PlayStation Brasil — Phantom Blade Zero', url: sourceUrls.official },
  ...(['weeping', 'crimson', 'village', 'pangzhen', 'mandate', 'meigu', 'mountain', 'mirage', 'soulrend'] as const).map(id => ({ id: `powerpyx-${id}`, title: `PowerPyx — região ${id}`, url: sourceUrls[id] })),
]

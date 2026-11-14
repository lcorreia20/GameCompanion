// IDs do checklist não coincidem em todos os casos com os parâmetros de região do MetaBot.
const mapRegions: Record<string, string> = {
  weeping: 'weeping-creek-valley',
  crimson: 'crimson-forest',
  village: 'village-of-lu',
  pangzhen: 'pangzhen',
  mandate: 'mandate-encampment',
  meigu: 'meigu-lake',
  mountain: 'mountain-of-imprisonment',
  mirage: 'mirage-estate',
  soulrend: 'mount-soulrend',
}

export function regionMapUrl(regionId: string, language: 'en' | 'pt-BR'): string | null {
  const mapRegion = mapRegions[regionId]
  if (!mapRegion) return null
  return `https://metabot.gg/${language === 'pt-BR' ? 'pt_BR' : 'en'}/phantom-blade-zero/map?region=${mapRegion}`
}

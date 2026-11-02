import type { Collectible } from './types'
import { sourceUrls as s } from './sources'

// Apenas itens documentados relevantes a troféus, contos e limiares; não são as 564 localizações do 100%.
export const collectibles: Collectible[] = [
  { id: 'twin-flesh-lilies', name: 'Twin Flesh Lilies', regionId: 'weeping', purpose: 'Pegar no altar da arena de Hua e entregar a Yu’er para Flesh Lily / The Healer’s Legacy.', requiredForPlatinum: true, sourceUrls: [s.weeping, s.trophies] },
  { id: 'blood-stopper-vine', name: 'Blood-Stopper Vine', regionId: 'weeping', purpose: 'Primeira erva de Apprentice Healer; perto de Axemaster’s Holding Cell.', requiredForPlatinum: true, sourceUrls: [s.weeping, s.trophies] },
  { id: 'congealeaf', name: 'Congealeaf', regionId: 'weeping', purpose: 'Segunda erva de Apprentice Healer; perto da porta da Rusted Loong Key.', requiredForPlatinum: true, sourceUrls: [s.weeping, s.trophies] },
  { id: 'blemish-goldweed', name: 'Blemish Goldweed', regionId: 'weeping', purpose: 'Terceira erva de Apprentice Healer; junto ao Long Pillar.', requiredForPlatinum: true, sourceUrls: [s.weeping, s.trophies] },
  { id: 'sha-chi-crank', name: 'Sha-Chi Furnace Inspection Crank', regionId: 'weeping', purpose: 'Abrir o forno da torre e recuperar após usá-la; necessária em A Severed Mindseal.', requiredForPlatinum: true, sourceUrls: [s.weeping] },
  { id: 'primal-stone', name: 'Primal Stone', regionId: 'weeping', purpose: 'Entregar a Shadow Warden para a primeira etapa de A Severed Mindseal.', requiredForPlatinum: true, sourceUrls: [s.weeping, s.trophies] },
  { id: 'cellar-crank', name: 'Crimson Forest Cellar Crank', regionId: 'crimson', purpose: 'Abrir adega da Cliffside Lodge para Secrets of the Baishan Sect.', requiredForPlatinum: true, sourceUrls: [s.crimson, s.trophies] },
  { id: 'chamber-crank', name: 'Crimson Forest Secret Chamber Crank', regionId: 'crimson', purpose: 'Abrir câmara secreta e falar com a garota em Secrets of the Baishan Sect.', requiredForPlatinum: true, sourceUrls: [s.crimson, s.trophies] },
  { id: 'dungeon-key', name: 'Thieves’ Camp Dungeon Key', regionId: 'crimson', purpose: 'Alcançar um dos quatro feridos de A Healer’s Mercy.', requiredForPlatinum: true, sourceUrls: [s.crimson, s.trophies] },
  { id: 'gen-key', name: 'Old Man Gen’s Brass Key', regionId: 'village', purpose: 'Pedido seguinte de The Journey Home antes de avançar por Pangzhen.', requiredForPlatinum: true, sourceUrls: [s.village, s.trophies] },
  { id: 'lan-manor-key', name: 'Lan Manor Key', regionId: 'pangzhen', purpose: 'Chave recebida de Young Master Lan durante o conto.', requiredForPlatinum: true, sourceUrls: [s.trophies] },
  { id: 'firefly-flower', name: 'Firefly’s Memory Flowers', regionId: 'village', purpose: 'Uma das flores inicia Secrets at the Heart of the Lake; guia regional menciona seis para abrir passagem ao Broken Puppet Pit.', requiredForPlatinum: true, quantity: 6, sourceUrls: [s.trophies, s.village] },
  { id: 'quick-treasures', name: 'Tesouros de Quick Hand Zhang', purpose: 'Entregar os conjuntos de tesouros para Lost and Found; o roteiro informa 3/3/4/4/3 por etapa, mas o guia 100% contabiliza 16 no total. Consultar guias regionais; total não confirmado.', requiredForPlatinum: true, sourceUrls: [s.trophies, s.collectibles] },
  { id: 'memory-flowers-10', name: 'Memory Flowers completas', purpose: 'Completar dez flores (cada uma reúne 2 a 6 pétalas) para Listen to Every Flower; não são necessárias todas as 129 localizações de pétalas.', requiredForPlatinum: true, quantity: 10, sourceUrls: [s.trophies, s.collectibles] },
  { id: 'accessories-30', name: 'Acessórios', purpose: 'Obter quaisquer 30 acessórios para Collector’s Notes; o guia informa mais de 60 disponíveis.', requiredForPlatinum: true, quantity: 30, sourceUrls: [s.trophies, s.collectibles] },
  { id: 'sha-chi-amber', name: 'Sha-Chi Amber Shards', purpose: 'Melhorias úteis de habilidades; sem obrigação de coletar todos para troféus.', requiredForPlatinum: false, sourceUrls: [s.collectibles] },
  { id: 'blackstone', name: 'Blackstone Shards', purpose: 'Melhorias úteis de dano; sem obrigação de coletar todos para troféus.', requiredForPlatinum: false, sourceUrls: [s.collectibles] },
]

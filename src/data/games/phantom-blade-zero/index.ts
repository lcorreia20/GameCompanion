import type { PhantomBladeZeroContent } from '../../../domain/models/guide'
import { metadata } from './metadata'
import { regions } from './regions'
import { trophies } from './trophies'
import { quests } from './quests'
import { collectibles } from './collectibles'
import { bosses } from './bosses'
import { objectives } from './objectives'
import { sources } from './sources'

export const pbzContent: PhantomBladeZeroContent = { metadata, regions, trophies, quests, collectibles, bosses, objectives, sources }
export type { PhantomBladeZeroContent, Objective, Trophy, Quest, Region, Collectible, Boss } from '../../../domain/models/guide'

import {Id, IsoDateTime} from 'shared/modules/common'

/**
 * NM - Near Mint
 *
 * LP - Lightly Played
 *
 * MP - Moderately Played
 *
 * HP - Heavily Played
 *
 * DM - Damaged
 *
 * U - Unopened
 */
export type Condition = 'NM' | 'LP' | 'MP' | 'HP' | 'DM' | 'U'

export interface Card {
  id: Id
  pokemonTcgId: string
  tcgPlayerId: number
  created: IsoDateTime
  updated: IsoDateTime
  isFromPack: boolean
  purchasePrice?: number
  salePrice?: number
  purchasedDate: IsoDateTime
  soldDate: IsoDateTime
  condition: Condition
  language: string
}

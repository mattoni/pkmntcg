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

export interface OwnedCard {
  /** ID as stored in the database */
  id: Id
  /** Id from Pokemon TCG API */
  pokemonTcgId: string
  /** ID from TCG Player */
  tcgPlayerId: number
  /** Date owned card was created */
  created: IsoDateTime
  /** Date owned card was last updated */
  updated: IsoDateTime
  /** Was this card pulled from a pack? */
  isFromPack: boolean
  /** How much was this card purchased for? */
  purchasePrice: number | null
  /** How much was this card sold for, if at all? */
  salePrice: number | null
  /** What date was the card purchased? */
  purchasedDate: IsoDateTime | null
  /** What date was the card sold? */
  soldDate: IsoDateTime | null
  /** What is the condition of the card? */
  condition: Condition
  /** What language is the card in? */
  language: string
}

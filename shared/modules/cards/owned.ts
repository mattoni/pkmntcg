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

/**
 * An owned card is a card the player has added to their collection.
 * It contains information about what card it is, what they paid for it,
 * and if they sold it how much they sold for (to keep track of gains).
 * If a player has multiple of the same card, an OwnedCard entry
 * will exist for every copy of the card they have.
 */
export interface OwnedCard {
  /** The ID as stored in the database. */
  id: Id
  /**
   * Set to true if the card was pulled from a pack.
   * This will change the calculation on value gained/lost as
   * it wil be based on how much they paid for the pack.
   */
  isFromPack: boolean
  /** The condition the card is in. */
  condition: Condition
  /** The language the card is in. */
  language: string
  /**
   * Shadowless cards have no shadow around the border, and are exclusive to the Base Set.
   * They will have different pricing because of their increased value.
   */
  isShadowless: boolean
  /** Some sets have a first edition modifier. */
  isFirstEdition: boolean
  /** Some sets have reverse holofoil edition for some cards */
  isReverseHolo: boolean
  /** Events are dates that we want to keep track of. */
  events: {
    /** The date owned card was added. */
    created: IsoDateTime
    /** The date owned card was last updated. */
    updated: IsoDateTime
    /** The date the card purchased. */
    purchased: IsoDateTime | null
    /** The date the card was sold. */
    sold: IsoDateTime | null
  }
  /** Pricing information relevant to this card. */
  price: {
    /** The amount this card was purchased for. */
    purchased: number | null
    /** How much was this card sold for, if at all? */
    sold: number | null
  }
  /** Meta reference data for this card (external API ids etc). */
  meta: {
    /** The reference ID for our internal representation */
    internalReferenceId: string
    /** ID from Pokemon TCG API. */
    pokemonTcgId: string
    /** ID from TCG Player. */
    tcgPlayerProductId: number
    /** The SKU (used to track pricing) from TCG Player. */
    tcgPlayerSku: number
  }
}

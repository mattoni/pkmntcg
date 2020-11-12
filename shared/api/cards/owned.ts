import {OwnedCard} from '../../modules/cards/owned'

export type OwnedCardCreateRequestSchema =
  // Required fields
  Pick<OwnedCard, 'pokemonTcgId' | 'purchasedDate' | 'condition' | 'language'> &
    // Optional fields
    Partial<
      Pick<OwnedCard, 'isFromPack' | 'purchasePrice' | 'salePrice' | 'soldDate'>
    >

export type OwnedCardResponseSchema = OwnedCard

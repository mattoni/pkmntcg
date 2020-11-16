import {Id, IsoDateTime} from 'shared/modules/common'

export type Modifier = 'N' | 'H' | 'RH' | 'FE' | 'FEH'

export type Price = {
  low: number | null
  high: number | null
  market: number | null
  tcgPlayerSku: number
}

export interface CardDayPrice {
  id: Id
  date: IsoDateTime
  internalReferenceId: Id
  tcgPlayerProductId: number
  prices: Record<Modifier, Price>
}

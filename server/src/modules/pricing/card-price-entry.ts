import {Id, IsoDateTime} from 'shared/modules/common'

export interface CardPriceEntry {
  id: Id
  date: IsoDateTime
  referenceId: Id
  tcgPlayerProductId: number
}

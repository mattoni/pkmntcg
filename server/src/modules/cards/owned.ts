import {Db, DbCollection} from '../../database'
import {Cards} from 'shared/api'
import {OwnedCard} from 'shared/modules/cards'
import * as TE from 'fp-ts/lib/TaskEither'
import {createNotFoundError, createServerError, InternalError} from '../common'
import {pipe} from 'fp-ts/lib/pipeable'
import {convertDocId} from '../common/mongo'
import {WithoutId} from 'shared/types/common'
import {formatISO} from 'date-fns'

// const getOwnedCardFromParams = (
//   params: Cards.OwnedCardCreateRequestSchema
// ): WithoutId<OwnedCard> => {
//   return {
//     isFromPack: false,
//     purchasePrice: null,
//     salePrice: null,
//     soldDate: null,
//     created: formatISO(new Date()),

//     ...params,
//   }
// }

export const insertOwnedCardIntoDb = (db: Db) => (
  params: Cards.OwnedCardCreateRequestSchema
): TE.TaskEither<InternalError, OwnedCard> => {
  return pipe(
    TE.tryCatch(
      () => db.collection(DbCollection.cards).insertOne(params),
      (e) => createServerError('database-error', e)
    ),
    TE.chain((res) => TE.right(convertDocId<OwnedCard>(res.ops[0])))
  )
}

export const getOwnedCardFromDb = (db: Db) => (
  params: Pick<OwnedCard, 'id'>
): TE.TaskEither<InternalError, OwnedCard> => {
  return pipe(
    TE.tryCatch(
      () =>
        db.collection<OwnedCard>(DbCollection.cards).findOne({$id: params.id}),
      (e) => createServerError('database-error', e)
    ),
    TE.chain((card) =>
      card
        ? TE.right(convertDocId(card))
        : TE.left(createNotFoundError('card-not-found'))
    )
  )
}

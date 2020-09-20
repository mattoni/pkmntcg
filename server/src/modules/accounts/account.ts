import {Account} from 'shared/modules/accounts'
import {AccountCreateRequestSchema} from 'shared/api/accounts'
import {Id} from 'shared/modules/common'
import * as TE from 'fp-ts/lib/TaskEither'
import {Db, DbCollection} from '../../database'
import {pipe} from 'fp-ts/lib/pipeable'
import {createInternalError, createServerError, InternalError} from '../common'
import {convertDocId} from '../common/mongo'

/** An account used exclusively on the server. Contains hashed password */
export interface ServerAccount extends Account {
  /** just a test */
  secret?: string
}

export const lookupAccountByEmail = (db: Db) => (
  email: string
): TE.TaskEither<InternalError, ServerAccount> => {
  return pipe(
    TE.tryCatch(
      () =>
        db.collection<ServerAccount>(DbCollection.accounts).findOne({email}),
      (e) => createServerError('database-error', e)
    ),
    TE.chain((account) =>
      account
        ? TE.right(convertDocId(account))
        : TE.left(
            createInternalError({
              status: 404,
              code: 'account-not-found',
            })
          )
    )
  )
}

export const lookupAccountById = (db: Db) => (
  $id: Id
): TE.TaskEither<InternalError, ServerAccount> => {
  return pipe(
    TE.tryCatch(
      () => db.collection<ServerAccount>(DbCollection.accounts).findOne({$id}),
      (e) => createServerError('database-error', e)
    ),
    TE.chain((account) =>
      account
        ? TE.right(convertDocId(account))
        : TE.left(
            createInternalError({
              status: 404,
              code: 'account-not-found',
            })
          )
    )
  )
}

export const createAccount = (db: Db) => (
  params: AccountCreateRequestSchema
): TE.TaskEither<InternalError, ServerAccount> => {
  const account: Omit<Account, 'id'> = {
    ...params,
  }
  return pipe(
    TE.tryCatch(
      () => db.collection(DbCollection.accounts).insertOne(account),
      (e) => createServerError('database-error', e)
    ),
    TE.chain(() => TE.right(convertDocId(account)))
  )
}

const saveAccount = (db: Db) => (
  account: ServerAccount
): TE.TaskEither<InternalError, ServerAccount> => {
  const {id, ...params} = account
  return pipe(
    TE.tryCatch(
      () =>
        db
          .collection(DbCollection.accounts)
          .updateOne({$id: id}, {$set: params}),
      (e) => createServerError('database-error', e)
    ),
    TE.chain(() => TE.right(account))
  )
}

export const updateAccount = (db: Db) => (update: Pick<Account, 'name'>) => (
  account: ServerAccount
): TE.TaskEither<InternalError, ServerAccount> => {
  return saveAccount(db)({...account, name: update.name})
}

export const serverAccountToAccount = (sa: ServerAccount): Account => {
  const a = {...sa}
  // delete a.password
  return a
}

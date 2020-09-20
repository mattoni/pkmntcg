import jwt from 'jsonwebtoken'
import {
  ServerAccount,
  serverAccountToAccount,
  lookupAccountByEmail,
  lookupAccountById,
} from '../accounts'
import {Id} from 'shared/modules/common'
import {
  AccessToken,
  AuthTokenContent,
  MagicLinkToken,
  RefreshToken,
} from 'shared/modules/auth'
import {v4 as uuidv4} from 'uuid'
import {pipe, flow} from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import {Db} from '../../database'
import {InternalError, createInternalError} from '../common'

// TEMP
const fakeRefreshTokens: Record<string, string> = {}

const ensureIsMagicLinkToken = (
  content: AuthTokenContent
): E.Either<InternalError, AuthTokenContent> =>
  content.isMagic
    ? E.right(content)
    : E.left(createInternalError({code: 'token-invalid', status: 403}))

const getAccountFromRefreshToken = (db: Db) => (
  refresh: string
): TE.TaskEither<InternalError, ServerAccount> =>
  fakeRefreshTokens[refresh]
    ? lookupAccountById(db)(fakeRefreshTokens[refresh])
    : TE.left(createInternalError({code: 'refresh-token-invalid', status: 403}))

const createSignedJWT = (
  payload: Partial<AuthTokenContent>,
  expiresIn = 1800
): E.Either<InternalError, string> =>
  E.tryCatch<InternalError, string>(
    () => {
      if (!process.env.TOKEN_SECRET) {
        throw new Error('Token secret not found in env file.')
      }
      return jwt.sign(payload, process.env.TOKEN_SECRET, {
        expiresIn: `${expiresIn}s`,
      })
    },
    (error) =>
      createInternalError({
        status: 500,
        code: 'server-error',
        error,
      })
  )

/**
 * Validates a JWT was created by us and returns the content.
 * @param token The JWT string to decode
 */
export const validateAndDecodeAccessToken = (
  token: string
): E.Either<InternalError, AuthTokenContent> =>
  E.tryCatch<InternalError, AuthTokenContent>(
    () => {
      if (!process.env.TOKEN_SECRET) {
        throw new Error('Token secret not found in env file.')
      }
      return jwt.verify(token, process.env.TOKEN_SECRET) as AuthTokenContent
    },
    (error) =>
      createInternalError({
        status: 401,
        code: 'token-invalid',
        error,
      })
  )

export const generateRefreshToken = ({
  id,
}: {
  id: Id
}): TE.TaskEither<InternalError, string> => {
  const refreshToken = uuidv4()
  fakeRefreshTokens[refreshToken] = id
  // TODO store these tokens in db referencing account
  return TE.right(refreshToken)
}

/**
 * Generates an access token for an account.
 *
 * An access token is a JWT that can be used at all API endpoints
 * directly from a device.
 * @param account The account to generate the token for
 */
export const generateAccessToken = (
  account: ServerAccount
): E.Either<InternalError, AccessToken> =>
  createSignedJWT(serverAccountToAccount(account))

/**
 * Generates a magic link token for an email.
 *
 * A magic link token is sent to a user's email address. Once they click it
 * they are re-routed back to either the site or the app, which then
 * exchanges that magic token for a real access token.
 * @param email The email address associated with the magic link
 * @param isSignup If this token can be used to complete signup
 */
export const generateMagicLinkToken = (
  email: string,
  options?: {isSignup?: boolean}
): E.Either<InternalError, MagicLinkToken> =>
  createSignedJWT({email, isSignup: options?.isSignup, isMagic: true})

/**
 * Exchanges a "magic link token" for an actual access token.
 * @param mlt The magic link token string
 */
export const exchangeMLTokenForAccessToken = (db: Db) => (
  mlt: MagicLinkToken
): TE.TaskEither<InternalError, AccessToken> =>
  pipe(
    flow(validateAndDecodeAccessToken, TE.fromEither)(mlt),
    TE.chain(flow(ensureIsMagicLinkToken, TE.fromEither)),
    TE.chain((at) => lookupAccountByEmail(db)(at.email)),
    TE.chain(flow(generateAccessToken, TE.fromEither))
  )

export const exchangeRefreshTokenForAccessToken = (db: Db) => (
  refreshToken: string
): TE.TaskEither<InternalError, AccessToken> =>
  pipe(
    getAccountFromRefreshToken(db)(refreshToken),
    TE.chain(flow(generateAccessToken, TE.fromEither))
  )

export const deleteRefreshToken = ({
  token,
}: {
  token: RefreshToken
}): TE.TaskEither<InternalError, boolean> => {
  delete fakeRefreshTokens[token]
  // TODO store these tokens in db referencing account
  return TE.right(true)
}

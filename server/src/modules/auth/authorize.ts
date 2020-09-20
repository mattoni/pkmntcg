import {Either, left} from 'fp-ts/lib/Either'
import {AuthTokenContent} from 'shared/modules/auth'
import {FastifyRequest} from 'fastify'
import {validateAndDecodeAccessToken} from './token'
import {InternalError, createInternalError} from '../common'

export const authorize = (
  request: FastifyRequest
): Either<InternalError, AuthTokenContent> => {
  const header = request.headers.authorization

  if (!header) {
    return left(
      createInternalError({
        code: 'auth-token-missing',
        status: 401,
      })
    )
  }

  const [, token] = header.split(' ')

  return validateAndDecodeAccessToken(token)
}

import {FastifyRequest} from 'fastify/types/request'
import {pipe} from 'fp-ts/lib/pipeable'
import {lookupAccountByEmail} from '../../modules/accounts'
import * as TE from 'fp-ts/lib/TaskEither'
import {createValidationError} from '../../modules/common'

export const verifyEmailNotExists = (request: FastifyRequest) => (
  email: string
) => {
  return pipe(
    lookupAccountByEmail(request.db)(email),
    TE.fold(
      (left) =>
        left.code === 'account-not-found' ? TE.right(email) : TE.left(left),
      () =>
        TE.left(
          createValidationError([
            {
              field: 'email', //
              type: 'invalid',
              details: request.ttag
                .t`An account with that email address already exists.`,
            },
          ])
        )
    )
  )
}

import {FastifyReply, FastifyInstance} from 'fastify'
import {
  generateRefreshToken,
  exchangeRefreshTokenForAccessToken,
} from '../../modules/auth'
import * as TE from 'fp-ts/lib/TaskEither'
import {pipe} from 'fp-ts/lib/pipeable'
import {foldReply} from '../replies'
import {InternalError} from '../../modules/common'
import {RefreshResponseSchema} from 'shared/api/auth/refresh'

export const applyRefreshCookie = (account: {id: string}) => (
  reply: FastifyReply
): TE.TaskEither<InternalError, string> => {
  return pipe(
    generateRefreshToken(account),
    TE.chainFirst((rt) =>
      TE.right(reply.setCookie('refresh', rt, {httpOnly: true}))
    )
  )
}

export const handleTokenRefresh = async (
  server: FastifyInstance
): Promise<void> => {
  server.post('/refresh', async (request, reply) => {
    const {refresh} = request.cookies

    foldReply<RefreshResponseSchema>(
      request,
      reply
    )(await pipe(exchangeRefreshTokenForAccessToken(request.db)(refresh))())
  })
}

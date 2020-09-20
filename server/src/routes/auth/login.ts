/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {FastifyInstance} from 'fastify'
import * as TE from 'fp-ts/lib/TaskEither'
import {pipe} from 'fp-ts/lib/pipeable'
import {
  sendLoginEmail,
  generateMagicLinkToken,
  exchangeMLTokenForAccessToken,
  validateAndDecodeAccessToken,
  deleteRefreshToken,
} from '../../modules/auth'
import {taskFoldReply} from '../replies'
import {applyRefreshCookie} from './refresh'
import {flow} from 'fp-ts/lib/function'
import {lookupAccountByEmail} from '../../modules/accounts'
import {
  LoginRequestSchema,
  LoginResponseSchema,
  AuthorizeResponseSchema,
} from 'shared/api/auth/login'

export const handleLogin = async (server: FastifyInstance): Promise<void> => {
  server.post(
    '/login',
    {
      schema: {
        body: server.getSchema('LoginRequestSchema'),
      },
    },
    async (request, reply) => {
      const {email} = request.body as LoginRequestSchema
      const {redirectUri} = request.query as Record<'redirectUri', string>
      return pipe(
        lookupAccountByEmail(request.db)(email),
        TE.chain((account) =>
          flow(generateMagicLinkToken, TE.fromEither)(account.email)
        ),
        TE.chain(sendLoginEmail(email, redirectUri)),
        taskFoldReply<LoginResponseSchema>(request, reply)
      )()
    }
  )
}

export const handleAuthorize = async (
  server: FastifyInstance
): Promise<void> => {
  server.post(
    '/authorize',
    {
      schema: {
        querystring: server.getSchema('AuthorizeQuerySchema'),
      },
    },
    async (request, reply) => {
      const {mlt} = request.query as Record<'mlt', string>
      return pipe(
        exchangeMLTokenForAccessToken(request.db)(mlt),
        TE.chainFirst((at) =>
          pipe(
            // Need to extract out the account to associate the refresh cookie with
            flow(validateAndDecodeAccessToken, TE.fromEither)(at),
            TE.chain((content) => applyRefreshCookie(content)(reply))
          )
        ),
        taskFoldReply<AuthorizeResponseSchema>(request, reply)
      )()
    }
  )
}

export const handleLogout = async (
  server: FastifyInstance
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<void> => {
  server.post('/logout', async (request, reply) => {
    const {refresh} = request.cookies

    reply.clearCookie('refresh')
    pipe(deleteRefreshToken({token: refresh}), taskFoldReply(request, reply))()
  })
}

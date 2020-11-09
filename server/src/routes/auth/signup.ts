import {FastifyInstance} from 'fastify'
import * as TE from 'fp-ts/lib/TaskEither'
import * as T from 'fp-ts/lib/Task'
import {pipe} from 'fp-ts/lib/pipeable'
import {generateMagicLinkToken, sendSignupEmail} from '../../modules/auth'
import {foldReply} from '../replies'
import {SignupRequestSchema, SignupResponseSchema} from 'shared/api/auth'
import {verifyEmailNotExists} from '../accounts/common'

export const handleSignup = async (server: FastifyInstance): Promise<void> => {
  server.post(
    '/signup',
    {
      schema: {
        body: server.getSchema('SignupRequestSchema'),
      },
    },
    async (request, reply) => {
      const {email} = request.body as SignupRequestSchema
      const {redirectUri} = request.query as Record<'redirectUri', string>

      const doSignup = pipe(
        generateMagicLinkToken(email, {isSignup: true}),
        TE.fromEither,
        TE.chain(sendSignupEmail(email, redirectUri))
      )

      return pipe(
        email,
        verifyEmailNotExists(request),
        TE.chain(() => doSignup),
        T.map(foldReply<SignupResponseSchema>(request, reply))
      )()
    }
  )
}

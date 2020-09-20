/* eslint-disable @typescript-eslint/require-await */
import {FastifyInstance} from 'fastify'
import {
  updateAccount,
  lookupAccountById,
  serverAccountToAccount,
  createAccount,
} from '../../modules/accounts'
import * as TE from 'fp-ts/lib/TaskEither'
import {pipe} from 'fp-ts/lib/pipeable'
import {taskFoldReply} from '../replies'
import {authorize, isSignupToken} from '../../modules/auth'
import {flow} from 'fp-ts/lib/function'
import {
  AccountCreateQuerySchema,
  AccountCreateRequestSchema,
} from 'shared/api/accounts'
import {verifyEmailNotExists} from './common'

export const handleCreateAccount = async (
  server: FastifyInstance
): Promise<void> => {
  server.post(
    '/account',
    {
      schema: {
        body: server.getSchema('AccountCreateRequestSchema'),
        querystring: server.getSchema('AccountCreateQuerySchema'),
      },
    },
    async (request, reply) => {
      const {mlt} = request.query as AccountCreateQuerySchema
      const params = request.body as AccountCreateRequestSchema

      return pipe(
        flow(isSignupToken, TE.fromEither)(mlt),
        TE.chain(({email}) => verifyEmailNotExists(request)(email)),
        TE.chain(() => createAccount(request.db)(params)),
        TE.chain((v) => TE.right(serverAccountToAccount(v))),
        taskFoldReply(request, reply)
      )()
    }
  )
}

export const handleUpdateAccount = async (
  server: FastifyInstance
): Promise<void> => {
  server.patch('/account', async (request, reply) => {
    const {name} = request.body as {name: string}
    return pipe(
      flow(authorize, TE.fromEither)(request),
      TE.chain((v) => lookupAccountById(request.db)(v.id)),
      TE.chain(updateAccount(request.db)({name})),
      TE.chain((v) => TE.right(serverAccountToAccount(v))),
      taskFoldReply(request, reply)
    )()
  })
}

import {FastifyInstance} from 'fastify'
import {insertOwnedCardIntoDb} from '../../modules/cards'
import {pipe} from 'fp-ts/lib/pipeable'
import {taskFoldReply} from '../replies'
import {OwnedCardCreateRequestSchema} from 'shared/api/cards'

export const handleCreateOwnedCard = async (
  server: FastifyInstance
): Promise<void> => {
  server.post(
    '/cards',
    {
      schema: {
        body: server.getSchema('OwnedCardCreateRequestSchema'),
        response: {
          200: server.getSchema('OwnedCardResponseSchema'),
        },
      },
    },
    async (request, reply) => {
      const ownedCardCreateParams = request.body as OwnedCardCreateRequestSchema

      return pipe(
        insertOwnedCardIntoDb(request.db)(ownedCardCreateParams),
        taskFoldReply(request, reply)
      )
    }
  )
}

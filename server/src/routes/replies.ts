/* eslint-disable @typescript-eslint/ban-types */
import {FastifyReply, FastifyRequest} from 'fastify'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/lib/Task'
import {
  InternalError,
  logInternalError,
  convertInternalToPublicError,
} from '../modules/common'

export const replyWithError = (
  request: FastifyRequest,
  reply: FastifyReply
) => (error: InternalError): void => {
  logInternalError(error)

  void reply
    .type('application/json')
    .code(error.status)
    .send({error: convertInternalToPublicError(request.ttag.t, error)})
}

const replyWithSuccess = (reply: FastifyReply, code = 200) => (
  payload: unknown
): void => {
  void reply.type('application/json').code(code).send({
    data: payload,
  })
}

export const foldReply = <TSuccess = unknown>(
  request: FastifyRequest,
  reply: FastifyReply,
  successCode?: number
): ((ma: E.Either<InternalError, TSuccess>) => void) => {
  return E.fold(
    replyWithError(request, reply),
    replyWithSuccess(reply, successCode)
  )
}

export const taskFoldReply = <TSuccess = unknown>(
  request: FastifyRequest,
  reply: FastifyReply,
  successCode?: number
): ((ma: TE.TaskEither<InternalError, TSuccess>) => T.Task<void>) => {
  return TE.fold(
    (v) => T.of(replyWithError(request, reply)(v)),
    (e) => T.of(replyWithSuccess(reply, successCode)(e))
  )
}

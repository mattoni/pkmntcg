import fastify, {FastifyServerOptions} from 'fastify'
import fastifyCookie from 'fastify-cookie'
import fastifyCors from 'fastify-cors'
import fastifyTtag from './plugins/fastify-ttag'
import {replyWithError} from './routes/replies'
import {ErrorCode, AppError} from 'shared/modules/common'
import {createInternalError, getValidationErrorDetails} from './modules/common'
import fs from 'fs'
import path from 'path'
import {promisify} from 'util'
import {handleCreateAccount, handleUpdateAccount} from './routes/accounts'
import {
  handleLogin,
  handleSignup,
  handleAuthorize,
  handleTokenRefresh,
  handleLogout,
} from './routes/auth'
import {Db} from './database'
import fastifyDb from './plugins/database'

// If you're adding new supported languages, put them on this list
const languages = ['ja', 'en']

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const buildServer = async (db: Db, opts: FastifyServerOptions = {}) => {
  const server = fastify(opts)

  void server.register(fastifyCors, {
    credentials: true,
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })

  void server.register(fastifyDb, {db})

  void server.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET, // for cookies signature
  })

  void server.register(fastifyTtag, {languages})

  const setupSchemas = async (): Promise<void> => {
    const directoryPath = path.resolve(__dirname, '../schemas')

    const readdir = promisify(fs.readdir)
    const readFile = promisify(fs.readFile)

    const files = await readdir(directoryPath)
    for (const file of files) {
      if (!file.includes('.json')) continue
      const content = await readFile(`${directoryPath}/${file}`)
      const parsed = JSON.parse(content.toString()) as Record<string, string>
      server.addSchema({
        $id: file.replace('.json', ''),
        ...parsed,
      })
    }
  }

  await setupSchemas()

  // Auth Routes
  void server.register(handleLogin, {prefix: '/v1'})
  void server.register(handleSignup, {prefix: '/v1'})
  void server.register(handleAuthorize, {prefix: '/v1'})
  void server.register(handleTokenRefresh, {prefix: '/v1'})
  void server.register(handleLogout, {prefix: '/v1'})

  // Account Routes
  void server.register(handleCreateAccount, {prefix: '/v1'})
  void server.register(handleUpdateAccount, {prefix: '/v1'})

  server.setNotFoundHandler((request, reply) => {
    void replyWithError(
      request,
      reply
    )(createInternalError({code: 'endpoint-missing', status: 404}))
  })

  server.setErrorHandler((error, request, reply) => {
    const {statusCode} = error

    let code: ErrorCode
    let validation: AppError['validation']

    if (error.validation) {
      code = 'validation-error'

      validation = error.validation.map((v) => {
        return getValidationErrorDetails(v, request.ttag.t)
      })
    } else {
      switch (statusCode) {
        case 400:
          code = 'bad-request'
          break
        default:
          code = 'server-error'
      }
    }

    const status = error.validation ? 422 : statusCode || 500

    void replyWithError(
      request,
      reply
    )(createInternalError({code, status, error, validation}))
  })

  return server
}

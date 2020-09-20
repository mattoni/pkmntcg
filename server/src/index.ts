import dotenv from 'dotenv'
dotenv.config()
import {buildServer} from './server'
import {FastifyLoggerOptions} from 'fastify'
import {connectToDb} from './database'
import gracefulShutdown from 'fastify-graceful-shutdown'

const init = async (): Promise<void> => {
  const server = await buildServer(await connectToDb(), {
    // prettyPrint isn't defined, so we need to force it as logger option type
    logger: {level: 'info', prettyPrint: true} as FastifyLoggerOptions,
    ignoreTrailingSlash: true,
  })

  void server.register(gracefulShutdown)

  server.listen(8001, '0.0.0.0', (err, address) => {
    if (err) throw err
    server.log.info(`server listening on ${address}`)
  })
}

void init()

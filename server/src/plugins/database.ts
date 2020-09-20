import {FastifyPlugin, FastifyRequest} from 'fastify'
import fp from 'fastify-plugin'
import {Db} from '../database'

declare module 'fastify' {
  interface FastifyRequest {
    db: Db
  }
}

interface FastifyDbOptions {
  db: Db
}

/**
 * Custom fastify plugin to inject our database instance per request
 */
const fastifyDb: FastifyPlugin<FastifyDbOptions> = (fastify, opts, done) => {
  fastify.addHook('preHandler', async (req, _) => {
    req.db = opts.db
  })

  done()
}

export default fp(fastifyDb)

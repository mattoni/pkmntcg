/// <reference types="node" />

declare module 'fastify-language-parser' {
  import {FastifyPlugin} from 'fastify'

  declare module 'fastify' {
    interface FastifyRequest {
      detectedLng:
        | string
        | {code: string; script: string; region: string; quality: number}[]
    }
  }

  export interface FastifyLangOptions {
    fallbackLng?: string
    order: Array<'cookie' | 'header' | 'path' | 'query' | 'session'>
    supportedLngs?: string[]
  }

  declare const fastifyLang: FastifyPlugin<FastifyLangOptions>

  export default fastifyLang
}

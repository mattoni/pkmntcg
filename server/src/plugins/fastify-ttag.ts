import {FastifyPlugin, FastifyRequest} from 'fastify'
import fp from 'fastify-plugin'
import {TTag, t, msgid, ngettext, addLocale, useLocale} from 'ttag'
import parser from 'accept-language-parser'

declare module 'fastify' {
  interface FastifyRequest {
    ttag: TTag
  }
}

declare module 'ttag' {
  export class TTag {
    t: typeof t
    msgid: typeof msgid
    ngettext: typeof ngettext
    addLocale: typeof addLocale
    useLocale: typeof useLocale
  }
}

interface FastifyTtagOptions {
  languages: string[]
}

/**
 * Custom fastify plugin to make ttag instance per request available on the request object
 */
const fastifyTtag: FastifyPlugin<FastifyTtagOptions> = (
  fastify,
  opts,
  done
) => {
  // preHandler
  fastify.addHook('onRequest', async (req, _) => {
    const header = req.headers['accept-language']

    req.ttag = new TTag()
    const locale = header
      ? parser.pick(opts.languages, header, {loose: true})
      : 'en'

    if (locale !== 'en') {
      try {
        const translationsObj = await import(`shared/i18n/${locale}.po.json`)
        req.ttag.addLocale(locale, {...translationsObj})
      } catch (e) {
        // TODO:error - Log this somewhere?
        console.error(
          `Attempted to load language file for '${locale}', but no such file exists.`
        )
      }
    }

    req.ttag.useLocale(locale) //
  })

  done()
}

export default fp<FastifyTtagOptions>(fastifyTtag)

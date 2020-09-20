import {MagicLinkToken} from 'shared/modules/auth'
import * as TE from 'fp-ts/lib/TaskEither'
import {InternalError, createInternalError} from '../common'
import {mailClient} from '../../email'

const redirectWhitelist = ['localhost:3000/login']

export const sendLoginEmail = (email: string, redirectUrl: string) => (
  mlt: MagicLinkToken
): TE.TaskEither<InternalError, {sentTo: string}> => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const redirect = `http://${redirectUrl}?mlt=${mlt}`

  if (!redirectWhitelist.includes(redirectUrl)) {
    return TE.left(
      createInternalError({
        code: 'unauthorized-redirect',
        status: 403,
      })
    )
  }

  return TE.tryCatch(
    async () => {
      await mailClient.send({
        to: email,
        from: 'alex@ivey.network',
        subject: 'Welcome To PkmnTcg',
        text: `Click this link to log in: ${redirect}`,
        html: `<a href=${redirect}>Click here to log in</a>`,
        mailSettings: {
          sandboxMode: {
            enable: process.env.NODE_ENV === 'test',
          },
        },
      })
      return {sentTo: email}
    },
    (error) =>
      createInternalError({
        code: 'email-send-failure',
        status: 500,
        error,
      })
  )
}

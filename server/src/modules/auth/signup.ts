import {MagicLinkToken} from 'shared/modules/auth'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import {InternalError, createAuthError, createServerError} from '../common'
import {mailClient} from '../../email'
import {pipe} from 'fp-ts/lib/pipeable'
import {validateAndDecodeAccessToken} from './token'

const redirectWhitelist = ['localhost:3000/signup']

export const sendSignupEmail = (email: string, redirectUrl: string) => (
  mlt: MagicLinkToken
): TE.TaskEither<InternalError, {sentTo: string}> => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const redirect = `http://${redirectUrl}?mlt=${mlt}`

  if (!redirectWhitelist.includes(redirectUrl)) {
    return TE.left(createAuthError('unauthorized-redirect'))
  }

  return TE.tryCatch(
    async () => {
      await mailClient.send({
        to: email,
        from: 'alex@ivey.network',
        subject: 'Welcome to PkmnTcg',
        text: `Click this link to complete signup: ${redirect}`,
        html: `<a href=${redirect}>Click here to complete signup</a>`,
      })
      return {sentTo: email}
    },
    (error) => createServerError('email-send-failure', error)
  )
}

export const isSignupToken = (
  mlt: MagicLinkToken
): E.Either<InternalError, {email: string}> =>
  pipe(
    mlt,
    validateAndDecodeAccessToken,
    E.chain((t) =>
      t.isSignup === true
        ? E.right({email: t.email})
        : E.left(createAuthError('token-invalid'))
    )
  )

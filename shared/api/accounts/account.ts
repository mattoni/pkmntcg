import {MagicLinkToken} from '../../modules/auth'

export interface AccountCreateQuerySchema {
  mlt: MagicLinkToken
}

export interface AccountCreateRequestSchema {
  name: string
  /** @format email */
  email: string
}

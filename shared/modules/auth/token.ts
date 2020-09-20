import {Account} from '../accounts'

export type AccessToken = string
export type MagicLinkToken = string
export type RefreshToken = string

export interface AuthTokenContent extends Account {
  /** Whether or not this token is part of a magic link */
  isMagic: boolean
  /** If this token is valid for signup*/
  isSignup?: boolean
  /** When the token was issued */
  iat: number
  /** When the token expires */
  exp: number
}

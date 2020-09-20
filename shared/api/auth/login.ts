import {ApiCallNoToken, callApi} from '../common'

export interface LoginRequestSchema {
  /** @format email */
  email: string
}

type LoginQueryParamsSchema = Record<'redirectUri', string>

export interface LoginResponseSchema {
  /** @format email */
  sentTo: string
}

/**
 * Use this to send a login email to the specified address
 */
export const login: ApiCallNoToken<
  LoginRequestSchema,
  LoginResponseSchema,
  LoginQueryParamsSchema
> = async (params) => {
  return callApi({
    endpoint: 'login',
    method: 'POST',
    ...params,
  })
}

export type AuthorizeQuerySchema = Record<'mlt', string>

export type AuthorizeResponseSchema = string

/**
 * This function will take the magic link token generated in the email from the `login()` function
 * and convert it to an access token
 */
export const authorize: ApiCallNoToken<
  null,
  AuthorizeResponseSchema,
  AuthorizeQuerySchema
> = async (params) => {
  return callApi({
    endpoint: 'authorize',
    method: 'POST',
    ...params,
  })
}

export type LogoutResponseSchema = boolean

/**
 * This function will take the magic link token generated in the email from the `login()` function
 * and convert it to an access token
 */
export const logout: ApiCallNoToken<null, LogoutResponseSchema> = async (
  params
) => {
  return callApi({
    endpoint: 'logout',
    method: 'POST',
    ...params,
  })
}

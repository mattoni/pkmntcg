import {ApiCallNoToken, callApi} from '../common'

export type RefreshResponseSchema = string

/**
 * This function will use the httpOnly refresh cookie to retrieve a fresh
 * access token
 */
export const refresh: ApiCallNoToken<null, RefreshResponseSchema> = async (
  params
) => {
  return callApi({
    endpoint: 'refresh',
    method: 'POST',
    ...params,
  })
}

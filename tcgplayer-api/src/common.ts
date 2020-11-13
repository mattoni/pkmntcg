export type AccessToken = string
export type ApiResult<T> = ApiSuccessResult<T> | ApiErrorResult
export type Timestamp = string
import {RequestInit} from 'node-fetch'

export const TCGPLAYER_API_URL = 'https://api.tcgplayer.com'

export interface ApiSuccessResult<T> {
  totalItems?: number
  success: true
  results: T[]
  errors: string[]
}

export interface ApiErrorResult {
  success: false
  errors: string[]
}

type PostData = Record<string, unknown>

/** Common parameters no matter what type of request it is */
type BaseApiRequestParams<Q extends string = string> = {
  endpoint: string
  query?: Record<Q, string>
  signal?: RequestInit['signal']
  authority?: string
}

type GetApiRequestParams = BaseApiRequestParams & {
  method: 'GET'
}

type PostApiRequestParams<
  T extends PostData = PostData,
  Q extends string = string
> = BaseApiRequestParams<Q> & {
  method: 'POST'
  data: T
}

export type ApiCall<Response, Q extends string = string> = (
  params?: Pick<BaseApiRequestParams<Q>, 'query'>
) => Promise<ApiResult<Response>>

export type ApiCallWithData<
  Data extends PostData,
  Response,
  Q extends string = string
> = (
  params: Pick<PostApiRequestParams<Data, Q>, 'query' | 'data'>
) => Promise<ApiResult<Response>>

export type ApiRequestParams = GetApiRequestParams | PostApiRequestParams

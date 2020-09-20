import {AppError} from '../modules/common/errors'
import {endpoints} from './endpoints'
import {AccessToken} from '../modules/auth'
import {t} from 'ttag'

export type ApiResult<T> = ApiSuccessResult<T> | ApiErrorResult

export interface ApiSuccessResult<T> {
  ok: true
  data: T
}

export interface ApiErrorResult {
  ok: false
  error: AppError
}

type PostPatchData = object | null
type QueryParams<T extends string = string> = Record<T, string>

/** Common parameters no matter what type of request it is */
type BaseApiRequestParams<Q extends QueryParams = QueryParams> = {
  endpoint: keyof typeof endpoints
  query?: Q
  signal?: AbortSignal
  version?: 'v1'
  locale?: 'en' | 'ja'
  authority?: string
}

type WithAccessToken = {
  token: AccessToken
}

type GetApiRequestParams = BaseApiRequestParams & {
  method: 'GET'
}

type PostApiRequestParams<
  T extends PostPatchData = PostPatchData,
  Q extends QueryParams = QueryParams
> = BaseApiRequestParams<Q> & {
  method: 'POST'
  data: T
}

type PatchApiRequestParams<
  T extends PostPatchData = PostPatchData,
  Q extends QueryParams = QueryParams
> = BaseApiRequestParams<Q> & {
  method: 'PATCH'
  data: T
}

type DeleteApiRequestParams = BaseApiRequestParams & {
  method: 'DELETE'
}

export type ApiCall<Response> = (
  params: Pick<GetApiRequestParams, 'query'> & WithAccessToken
) => Promise<ApiResult<Response>>

export type ApiCallWithData<Data extends PostPatchData, Response> = (
  params: Pick<PostApiRequestParams<Data>, 'query' | 'data'> & WithAccessToken
) => Promise<ApiResult<Response>>

export type ApiCallNoToken<
  Data extends PostPatchData,
  Response,
  Query extends QueryParams = QueryParams
> = (
  params: Omit<
    PostApiRequestParams<Data, Query>,
    'method' | 'endpoint' | 'token'
  >
) => Promise<ApiResult<Response>>

type ApiRequestParams =
  | GetApiRequestParams
  | PostApiRequestParams
  | PatchApiRequestParams
  | DeleteApiRequestParams

export const callApi = async <T>(
  params: ApiRequestParams & Partial<WithAccessToken>
): Promise<ApiResult<T>> => {
  const {
    endpoint,
    authority = 'localhost:8001',
    method,
    token,
    signal,
    query = {},
    version = 'v1',
  } = params

  const url = new URL(`http://${authority}/${version}${endpoints[endpoint]}`)

  Object.keys(query).forEach((key) => url.searchParams.append(key, query[key]))

  const headers = new Headers({
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
    cache: 'no-cache',
  })

  if (params.locale) {
    headers.append('Accept-Language', params.locale)
  }

  const request = new Request(url.href, {
    method,
    headers,
    credentials: 'include',
    body:
      params.method === 'POST' || params.method === 'PATCH'
        ? JSON.stringify(params.data)
        : undefined,
  })

  try {
    const res = await fetch(request, {signal})

    try {
      const result = await res.json()
      if (!res.ok) {
        return {
          ok: false,
          error: result.error,
        } as const
      }

      return {
        ok: true,
        data: result.data,
      }
    } catch (e) {
      return {
        ok: false,
        error: {
          details: t`The response returned from the server is invalid`,
          code: 'response-invalid',
          status: 0,
        },
      }
    }
  } catch (e) {
    console.log(e)
    return {
      ok: false,
      error: {
        details: t`There was an error attempting to reach the server. There may be an issue with the internet connection.`,
        code: 'network-error',
        status: 0,
      },
    }
  }
}

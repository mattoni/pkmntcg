export type AccessToken = string
export type ApiResult<T> = ApiSuccessResult<T> | ApiErrorResult

export type ClientCredentials = {
  clientId: string
  clientSecret: string
}

type ApiError = {
  description: string
}

type QueryParams = Record<string, string>
type PostData = Record<string, unknown>

export interface ApiSuccessResult<T> {
  ok: true
  data: T
}

export interface ApiErrorResult {
  ok: false
  error: ApiError
}

/** Common parameters no matter what type of request it is */
type BaseApiRequestParams<Q extends QueryParams = QueryParams> = {
  endpoint: string
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
  T extends PostData = PostData,
  Q extends QueryParams = QueryParams
> = BaseApiRequestParams<Q> & {
  method: 'POST'
  data: T
}

export type ApiCall<Response> = (
  params: Pick<GetApiRequestParams, 'query'> & WithAccessToken
) => Promise<ApiResult<Response>>

export type ApiCallWithData<Data extends PostData, Response> = (
  params: Pick<PostApiRequestParams<Data>, 'query' | 'data'> & WithAccessToken
) => Promise<ApiResult<Response>>

export type ApiCallNoToken<
  Data extends PostData,
  Response,
  Query extends QueryParams = QueryParams
> = (
  params: Omit<
    PostApiRequestParams<Data, Query>,
    'method' | 'endpoint' | 'token'
  >
) => Promise<ApiResult<Response>>

type ApiRequestParams = GetApiRequestParams | PostApiRequestParams

export const callApi = async <T>(
  params: ApiRequestParams & Partial<WithAccessToken>
): Promise<ApiResult<T>> => {
  const {
    endpoint,
    authority = 'https://api.tcgplayer.com',
    method,
    token,
    signal,
    query = {},
    version = 'v1',
  } = params

  const url = new URL(`http://${authority}/${version}${endpoint}`)

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
    body: params.method === 'POST' ? JSON.stringify(params.data) : undefined,
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
          description: `The response returned from the server is invalid`,
        },
      }
    }
  } catch (e) {
    console.log(e)
    return {
      ok: false,
      error: {
        description: `There was an error attempting to reach the server. There may be an issue with the internet connection.`,
      },
    }
  }
}

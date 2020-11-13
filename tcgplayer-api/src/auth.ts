import {ApiRequestParams, TCGPLAYER_API_URL, ApiResult} from './common'
import {isAfter} from 'date-fns'
import fetch, {Request, Headers} from 'node-fetch'
import {URL, URLSearchParams} from 'url'

export type ClientCredentials = {
  clientId: string
  clientSecret: string
}

type AccessTokenInfo = {
  access_token: string
  token_type: string
  expires_in: number
  userName: string
  '.issued': string
  '.expires': string
}

export class TcgPlayerAuth {
  private accessToken: AccessTokenInfo | null = null

  constructor(private clientCreds: ClientCredentials) {}

  async makeAuthorizedCall<T>(params: ApiRequestParams): Promise<ApiResult<T>> {
    if (this.isTokenExpired()) {
      const resp = await this.renewAccessToken()
      if (!resp.success) {
        return resp
      }

      this.accessToken = resp.token
    }

    const {
      endpoint,
      authority = 'https://api.tcgplayer.com',
      method,
      signal,
      query = {},
    } = params

    const url = new URL(`${authority}${endpoint}`)
    Object.keys(query).forEach((key) =>
      url.searchParams.append(key, query[key] || '')
    )

    console.log('URRRRL', url)
    const headers = new Headers({
      Accept: 'application/json',
      Authorization: `Bearer ${this.accessToken?.access_token}`,
      'Content-Type': 'application/json',
      cache: 'no-cache',
    })

    const request = new Request(url.href, {
      method,
      headers,
      body: params.method === 'POST' ? JSON.stringify(params.data) : undefined,
    })

    try {
      const res = await fetch(request, {signal: signal || null})

      try {
        return (await res.json()) as ApiResult<T>
      } catch (e) {
        return {
          success: false as const,
          errors: [
            `There was an error parsing the response from TCG Player API.`,
          ],
        }
      }
    } catch (e) {
      console.log(e)
      return {
        success: false as const,
        errors: [
          `There was an error attempting to reach the TCG Player API. There may be an issue with the internet connection.`,
        ],
      }
    }
  }

  private isTokenExpired() {
    return (
      !this.accessToken ||
      isAfter(new Date(), new Date(this.accessToken['.expires']))
    )
  }

  private async renewAccessToken() {
    const formData = new URLSearchParams()
    formData.append('grant_type', 'client_credentials')
    formData.append('client_id', this.clientCreds.clientId)
    formData.append('client_secret', this.clientCreds.clientSecret)

    try {
      const resp = await fetch(`${TCGPLAYER_API_URL}/token`, {
        method: 'POST',
        body: formData,
      })
      try {
        const data = await resp.json()
        if (resp.ok) {
          return {
            success: true as const,
            token: data as AccessTokenInfo,
          }
        }
        return {
          success: false as const,
          errors: [data.error],
        }
      } catch (e) {
        return {
          success: false as const,
          errors: [
            `There was an error parsing the response from TCG Player API.`,
          ],
        }
      }
    } catch (e) {
      return {
        success: false as const,
        errors: [
          `There was an error attempting to reach the TCG Player API. There may be an issue with the internet connection.`,
        ],
      }
    }
  }
}

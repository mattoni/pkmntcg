import {callApi, ClientCredentials} from './common'

// {
//   "access_token":"BEARER_TOKEN",
//   "token_type":"bearer",
//   "expires_in":1209599,
//   "userName":"PUBLIC_KEY",
//   ".issued":"Fri, 07 Jul 2017 16:47:46 GMT",
//   ".expires":"Fri, 21 Jul 2017 16:47:46 GMT"
// }
type AccessTokenInfo = {
  access_token: string
  token_type: string
  expires_in: number
  userName: string
  '.issued': string
  '.expires': string
}

export class TcgPlayer {
  constructor(private clientCreds: ClientCredentials) {}
  private accessTokenInfo: AccessTokenInfo | null = null

  authorize() {
    return callApi<AccessTokenInfo>({
      method: 'GET',
      endpoint: '/token',
    })
  }

  async _verifyOrUpdateAuth() {
    if (!this.accessTokenInfo) {
      const tokenResp = await this.authorize()
      if (tokenResp.ok) {
        this.accessTokenInfo = tokenResp.data
        return
      }
    }
  }
}

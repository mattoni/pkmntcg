import {ClientCredentials, TcgPlayerAuth} from './auth'
import {Catalog} from './catalog'

export class TcgPlayer {
  constructor(private clientCreds: ClientCredentials) {}

  private Auth = new TcgPlayerAuth(this.clientCreds)

  Catalog = new Catalog(this.Auth)
}

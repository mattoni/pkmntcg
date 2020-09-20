import {Email, Id} from '../common'

export interface Account {
  /** The id of this account */
  id: Id
  /** The email associated with this account */
  email: Email
  /** The name associated with this account */
  name: string
}

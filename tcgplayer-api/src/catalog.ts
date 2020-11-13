import type {TcgPlayerAuth} from './auth'
import {ApiCall, Timestamp} from './common'

export interface Category {
  categoryId: number
  name: string
  modifiedOn: Timestamp
  displayName: string
  seoCategoryName: string
  sealedLabel: string
  nonSealedLabel: string
  conditionGuideUrl: string
  isScannable: boolean
  popularity: number
}

export class Catalog {
  constructor(private auth: TcgPlayerAuth) {}

  listAllCategories: ApiCall<
    Category,
    'offset' | 'limit' | 'sortOrder' | 'sortDesc'
  > = async () => {
    return this.auth.makeAuthorizedCall<Category>({
      endpoint: '/catalog/categories',
      method: 'GET',
    })
  }
}

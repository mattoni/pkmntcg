import {MongoClient, MongoClientOptions, Db as MongoDbInstance} from 'mongodb'

export type Db = MongoDbInstance
 
export const connectToDb = async (options?: MongoClientOptions) => {
  const client = MongoClient.connect('mongodb://localhost:27017', options)
  return (await client).db('pkmntcg')
}

export const DbCollection = {
  accounts: 'accounts',
} as const

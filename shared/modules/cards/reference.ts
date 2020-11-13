import {Id} from '../common'
import {PokemonTCG} from 'pokemon-tcg-sdk-typescript'

type PokemonTcgCard = Omit<PokemonTCG.ICard, 'id'>

interface PokemonTcgMeta {
  id: string
}

interface TcgPlayerMeta {
  productId: number
  groupId: number
}

export interface CardReference extends PokemonTcgCard {
  id: Id
  meta: {
    pokemonTcg: PokemonTcgMeta
    tcgPlayerMeta: TcgPlayerMeta
  }
}

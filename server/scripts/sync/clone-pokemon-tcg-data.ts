import dotenv from 'dotenv'
dotenv.config()
import Git from 'nodegit'
import fs from 'fs'
import {promisify} from 'util'
import {PokemonTCG} from 'pokemon-tcg-sdk-typescript'
import {TcgPlayer} from 'tcgplayer-api/src'

/** TCGPlayer pokemon category id */
const POKEMON_CAT_ID = 3

const tcgPlayer = new TcgPlayer({
  clientId: process.env.TCGPLAYER_CLIENT_ID || '',
  clientSecret: process.env.TCGPLAYER_CLIENT_SECRET || '',
})

const test = (async () => {
  const resp = await tcgPlayer.Catalog.listAllGroupsDetails({
    query: {
      categoryId: `${POKEMON_CAT_ID}`,
    },
  })

  console.log(resp)
})()

const REPO_URL = 'https://github.com/PokemonTCG/pokemon-tcg-data.git'
const REPO_DIR = '/tmp/pokemon-tcg-data'
const REPO_CARDS_DIR = `${REPO_DIR}/json/cards`

const setup = async () => promisify(fs.rmdir)(REPO_DIR, {recursive: true})

const cloneRepo = async () => Git.Clone.clone(REPO_URL, REPO_DIR)

const getLatestCommit = async (repo: Git.Repository) =>
  repo.getBranchCommit('master')

const getLatestCommitHash = async (commit: Git.Commit) => commit.sha()

const getCardFilenames = async () =>
  (await promisify(fs.readdir)(REPO_CARDS_DIR))
    .filter((name) => name.includes('.json'))
    .map((f) => `${REPO_CARDS_DIR}/${f}`)

const readCardsFromFiles = async (filenames: string[]) =>
  Promise.all(
    filenames.map((filename) =>
      promisify(fs.readFile)(filename).then(
        (v) => JSON.parse(v.toString()) as PokemonTCG.Card[]
      )
    )
  )

// const matchCollectionToTcgPlayerId = async (cards: PokemonTCG.Card[]) =>

// void setup()
//   .then(cloneRepo)
//   .then(getLatestCommit)
//   .then(getLatestCommitHash)
//   .then((hash) => console.log(`Fetched Commit Hash: ${hash}`))
//   .then(getCardFilenames)
//   .then(readCardsFromFiles)
//   .then(console.log)

// void getCardFilenames().then(readCardsFromFiles).then(console.log)

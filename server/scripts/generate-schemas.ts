// This script takes the API post data/response data interfaces
// and converts them automatically to json-schema format.
// Fastify then consumes these for validation, making the
// interfaces our single source of truth on what the server
// can accept and respond with, as well as what the client can post/consume.

// In order for an interface to be picked up, it must have
// 'Schema' in the interface name
import * as TJS from 'typescript-json-schema'
import {resolve} from 'path'
import fs from 'fs'

const settings: TJS.PartialArgs = {
  required: true,
}

const compilerOptions: TJS.CompilerOptions = {
  strict: true,
  types: ['node'],
}

const program = TJS.getProgramFromFiles(
  [resolve(`../../shared/api/index.ts`)],
  compilerOptions
)

const generator = TJS.buildGenerator(program, settings)

if (!generator) {
  throw new Error('TS Schema Generator Error')
}

const symbols = generator.getUserSymbols().filter((s) => s.includes('Schema'))

fs.rmdirSync(resolve('../schemas'), {recursive: true})
fs.mkdirSync(resolve('../schemas'))

symbols.forEach((s) => {
  const schema = generator.getSchemaForSymbol(s)
  const filename = resolve(`../schemas/${s}.json`)

  fs.writeFile(filename, JSON.stringify(schema), (err) => {
    if (err) {
      return console.log(err)
    }

    console.log(`Wrote [${s}] to file ${filename}`)
  })
})

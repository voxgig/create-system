#!/usr/bin/env node
/* Copyright © 2026 Voxgig Ltd, MIT License. */

// CLI entry for `npm create @voxgig/system <name>` (npm resolves that to
// this package, @voxgig/create-system). Creates an empty Voxgig system
// project - the same structure as a working system (model-driven Seneca
// backend, jostraca-generated lambda templates) but with no implementation
// specifics: no entities, services, or messages beyond commented examples.

import Fs from 'node:fs'
import Path from 'node:path'

import { scaffold } from './scaffold'


const USAGE = `Usage: npm create @voxgig/system <name>

Creates the folder <name> in the current directory, holding an empty
Voxgig system project (backend only). Idempotent: over an existing
project only missing scaffold files are added - existing files are
never touched.

  <name>   project name: lowercase letters, digits, and dashes,
           starting with a letter (e.g. my-app)

Next steps are printed after creation.
`


async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('-'))
  const flags = process.argv.slice(2).filter((a) => a.startsWith('-'))

  if (flags.includes('-h') || flags.includes('--help') || 0 === args.length) {
    console.log(USAGE)
    process.exit(0 === args.length && 0 === flags.length ? 1 : 0)
  }

  const name = args[0]

  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    console.error(`create-system: invalid name "${name}" - use lowercase ` +
      'letters, digits, and dashes, starting with a letter (e.g. my-app)')
    process.exit(1)
  }

  const target = Path.resolve(process.cwd(), name)
  const existing = Fs.existsSync(target) && 0 < Fs.readdirSync(target).length

  const res = await scaffold({ name, folder: process.cwd() })

  if (existing) {
    // Idempotent over an existing project: only missing files were added.
    console.log(`\nExisting project: ${name}/`)
    if (0 === res.created.length) {
      console.log('Already complete - nothing to add.')
    }
    else {
      console.log('Added missing scaffold files:')
      for (const f of res.created) {
        console.log('  ' + f)
      }
    }
    console.log(`(${res.skipped.length} existing files left untouched)\n`)
  }
  else {
    console.log(`
Created ${name}/ (${res.created.length} files)

Next steps:
  cd ${name}/backend
  npm install
  npm run build     # compile the model and sources
  npm test          # run the starter tests
  npm run local     # boot the (empty) backend locally

Then open backend/model/ and uncomment the examples to add your first
entity, service, and messages.
`)
  }
}


if (require.main === module) {
  main().catch((e: any) => {
    console.error('create-system: failed:', e.message)
    process.exit(1)
  })
}


export {
  main,
}

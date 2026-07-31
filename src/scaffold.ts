/* Copyright © 2026 Voxgig Ltd, MIT License. */

// The project scaffold, built with jostraca components. Each part
// (src/part/*) is a jostraca component contributing one area of the
// generated project; this module composes them into the full tree:
//
//   <name>/
//     README.md .gitignore
//     backend/
//       package.json tsconfig.json
//       build/            model-build generation actions (@voxgig/build)
//       model/            voxgig-model sources (empty; commented examples)
//       src/env/          shared/local/lambda environments
//       src/srv/          services (empty; commented example)
//       test/             starter unit test

import Fs from 'node:fs'
import Os from 'node:os'
import Path from 'node:path'

import { Jostraca, Project, Folder } from 'jostraca'

import { RootPart } from './part/root'
import { BackendPart } from './part/backend'
import { BuildPart } from './part/build'
import { ModelPart } from './part/model'
import { EnvPart } from './part/env'
import { SrvPart } from './part/srv'
import { TestPart } from './part/test'


export type Spec = {
  name: string     // project name (kebab-case)
  folder: string   // parent folder to create the project in
}

export type ScaffoldResult = {
  created: string[]   // files created (relative to the project folder)
  skipped: string[]   // files that already existed and were left untouched
}


// Idempotent scaffold: generate the full project into a staging folder,
// then copy only the files that do not already exist in the target. An
// existing (possibly customized) project is never overwritten - re-running
// converges, filling in any scaffold files the project is missing.
async function scaffold(spec: Spec): Promise<ScaffoldResult> {
  const staging = Fs.mkdtempSync(Path.join(Os.tmpdir(), 'create-system-'))

  const jostraca = Jostraca()

  await jostraca.generate({ folder: staging }, () => {
    Project({ folder: spec.name }, () => {

      RootPart(spec)

      Folder({ name: 'backend' }, () => {
        BackendPart(spec)
        BuildPart(spec)
        ModelPart(spec)
        EnvPart(spec)
        SrvPart(spec)
        TestPart(spec)
      })
    })
  })

  const from = Path.join(staging, spec.name)
  const target = Path.join(spec.folder, spec.name)

  const created: string[] = []
  const skipped: string[] = []

  const walk = (rel: string) => {
    const src = Path.join(from, rel)
    for (const entry of Fs.readdirSync(src, { withFileTypes: true })) {
      if ('.jostraca' === entry.name) {
        continue
      }
      const relpath = Path.join(rel, entry.name)
      if (entry.isDirectory()) {
        walk(relpath)
      }
      else {
        const dest = Path.join(target, relpath)
        if (Fs.existsSync(dest)) {
          skipped.push(relpath)
        }
        else {
          Fs.mkdirSync(Path.dirname(dest), { recursive: true })
          Fs.copyFileSync(Path.join(from, relpath), dest)
          created.push(relpath)
        }
      }
    }
  }
  walk('.')

  Fs.rmSync(staging, { recursive: true, force: true })

  return { created: created.sort(), skipped: skipped.sort() }
}


export {
  scaffold,
}

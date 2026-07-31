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


async function scaffold(spec: Spec) {
  const jostraca = Jostraca()

  return jostraca.generate({ folder: spec.folder }, () => {
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
}


export {
  scaffold,
}

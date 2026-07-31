/* Copyright © 2026 Voxgig Ltd, MIT License. */

// backend/build/: the model-build generation actions. Plain JS, loaded by
// voxgig-model (declared in model/.model-config/model-config.aontu); each
// delegates to @voxgig/build's EnvLambda (jostraca-based templates).

import { File, Content, Folder } from 'jostraca'

import type { Spec } from '../scaffold'


function BuildPart(_spec: Spec) {

  Folder({ name: 'build' }, () => {

    File({ name: 'srv_yml.js' }, () => {
      Content(`// Generates gen/serverless/srv.yml: the per-service Serverless function
// definitions derived from the model. Uses @voxgig/build's EnvLambda, whose
// templates are jostraca-based and ship precompiled.

const Fs = require('fs')
const Path = require('path')

const { EnvLambda } = require('@voxgig/build')

const folder = Path.join(__dirname, '..', 'gen', 'serverless')

module.exports = async function(model, build) {
  Fs.mkdirSync(folder, { recursive: true })
  await EnvLambda.srv_yml(model, {
    folder,
  })
}
`)
    })

    File({ name: 'srv_handler.js' }, () => {
      Content(`// Generates one Lambda handler per service, into src/handler/lambda/<srv>.ts.
// Uses @voxgig/build's EnvLambda (jostraca-based templates, precompiled).

const Fs = require('fs')
const Path = require('path')

const { EnvLambda } = require('@voxgig/build')

const folder = Path.join(__dirname, '..', 'src', 'handler')
const envFolder = Path.join('..', '..', 'env')

module.exports = async function(model, build) {
  Fs.mkdirSync(Path.join(folder, 'lambda'), { recursive: true })
  await EnvLambda.srv_handler(model, {
    folder: Path.join(folder, 'lambda'),
    start: 'lambda',
    env: {
      folder: Path.join(envFolder, 'lambda'),
    },
    lang: 'ts',
  })
}
`)
    })

    File({ name: 'res_yml.js' }, () => {
      Content(`// Generates gen/serverless/res.yml: the Serverless resources block (IAM role,
// queues) derived from the model. Uses @voxgig/build's EnvLambda
// (jostraca-based templates, precompiled).

const Fs = require('fs')
const Path = require('path')

const { EnvLambda } = require('@voxgig/build')

const folder = Path.join(__dirname, '..', 'gen', 'serverless')

module.exports = async function(model, build) {
  Fs.mkdirSync(folder, { recursive: true })
  await EnvLambda.resources_yml(model, {
    folder,
    filename: 'res.yml',
    custom: null,
  })
}
`)
    })
  })
}


export {
  BuildPart,
}

/* Copyright © 2026 Voxgig Ltd, MIT License. */

// backend/build/: the model-build generation actions. Plain JS, loaded by
// voxgig-model (declared in model/.model-config/model-config.aontu).
//
// Each action resolves its template in layers (first hit wins):
//   1. backend/src/gen/<name>.ts  compiled generator override
//   2. backend/tm/lambda/<frag>   project fragment (via spec.tm)
//   3. @voxgig/build defaults
// Use `voxgig-system template list|eject|diff` to customize.

import { File, Content, Folder } from 'jostraca'

import type { Spec } from '../scaffold'


// One generation action: layered override -> EnvLambda default.
function action(name: string, generator: string, folderLines: string,
  specLines: string): string {
  return `// Generation action: ${name}. Templates resolve in layers - project
// src/gen/${name}.ts (code override), project tm/lambda fragments, then
// @voxgig/build defaults. See: voxgig-system template list|eject|diff.

const Fs = require('fs')
const Path = require('path')

const { EnvLambda } = require('@voxgig/build')

${folderLines}
const tm = Path.join(__dirname, '..', 'tm', 'lambda')

module.exports = async function(model, build) {
  Fs.mkdirSync(folder, { recursive: true })

  // Layer 1: compiled project override (src/gen -> dist/gen).
  const custom = Path.join(__dirname, '..', 'src', 'gen', '${name}.ts')
  if (Fs.existsSync(custom)) {
    let mod = null
    try {
      mod = require('../dist/gen/${name}.js')
    }
    catch (e) {
      if ('MODULE_NOT_FOUND' !== e.code) {
        throw e
      }
      console.log('${name}: src/gen/${name}.ts exists but is not ' +
        'compiled - using the default template for this pass; ' +
        'run: npm run build && npm run model-build')
    }
    if (mod) {
      const gen = mod.${generator} || mod.${name} || mod.default
      return gen(model, {
${specLines}
    tm,
  })
    }
  }

  await EnvLambda.${generator}(model, {
${specLines}
    tm,
  })
}
`
}


function BuildPart(_spec: Spec) {

  Folder({ name: 'build' }, () => {

    File({ name: 'srv_yml.js' }, () => {
      Content(action('srv_yml', 'srv_yml',
        "const folder = Path.join(__dirname, '..', 'gen', 'env', 'aws')",
        '    folder,'))
    })

    File({ name: 'srv_handler.js' }, () => {
      Content(action('srv_handler', 'srv_handler',
        "const folder = Path.join(__dirname, '..', 'src', 'handler', 'lambda')",
        `    folder,
    start: 'lambda',
    env: {
      folder: Path.join('..', '..', 'env', 'lambda'),
    },
    lang: 'ts',`))
    })

    File({ name: 'res_yml.js' }, () => {
      Content(action('res_yml', 'resources_yml',
        "const folder = Path.join(__dirname, '..', 'gen', 'env', 'aws')",
        `    folder,
    filename: 'res.yml',
    custom: null,`))
    })

    File({ name: 'env_gen.js' }, () => {
      Content(`// Generation action: env_gen. Generates deployment artifacts under
// gen/env/<name>/ and (once) runtime entries under src/env/ for each
// environment declared in the model (main: env:). Templates resolve in
// layers - project src/gen/env_gen.ts, project tm/env fragments, then
// @voxgig/build defaults. See: voxgig-system template list|eject|diff.

const Fs = require('fs')
const Path = require('path')

const { EnvGen } = require('@voxgig/build')

const folder = Path.join(__dirname, '..', 'gen', 'env')
const tm = Path.join(__dirname, '..', 'tm', 'env')
const src = Path.join(__dirname, '..', 'src', 'env')
const root = Path.join(__dirname, '..', '..')

module.exports = async function(model, build) {
  Fs.mkdirSync(folder, { recursive: true })

  const custom = Path.join(__dirname, '..', 'src', 'gen', 'env_gen.ts')
  if (Fs.existsSync(custom)) {
    let mod = null
    try {
      mod = require('../dist/gen/env_gen.js')
    }
    catch (e) {
      if ('MODULE_NOT_FOUND' !== e.code) {
        throw e
      }
      console.log('env_gen: src/gen/env_gen.ts exists but is not ' +
        'compiled - using the default template for this pass; ' +
        'run: npm run build && npm run model-build')
    }
    if (mod) {
      const gen = mod.env_gen || mod.default
      return gen(model, { folder, tm, src, root })
    }
  }

  await EnvGen.env_gen(model, { folder, tm, src, root })
}
`)
    })

    File({ name: 'doc_gen.js' }, () => {
      Content(`// Generation action: doc_gen. Regenerates the model-derived docs on
// every model-build: docs/reference/{entities,messages,system-map}.md
// (mermaid ER / message-flow / architecture diagrams) and a README.md
// per implemented service under src/srv/. All AUTO-GENERATED - never
// hand-edit those files.

const Path = require('path')

const { Docs } = require('@voxgig/build')

const root = Path.join(__dirname, '..', '..')

module.exports = async function(model, build) {
  await Docs.doc_gen(model, { root })
}
`)
    })
  })

  // The project template folder: fragments ejected here shadow the
  // package defaults.
  Folder({ name: 'tm' }, () => {
    Folder({ name: 'lambda' }, () => {
      File({ name: 'README.md' }, () => {
        Content(`# Project generation templates

Fragments in this folder shadow the defaults shipped by \`@voxgig/build\`
(\`tm/lambda/*.frag\`). Generation templates resolve in layers - first
hit wins:

1. \`../src/gen/<name>.ts\` - compiled generator override (deep custom)
2. \`./<name>.frag\` - project fragment (text-level custom, no compile)
3. \`@voxgig/build\` defaults

Workflow:

\`\`\`bash
npx voxgig-system template list            # what exists, who provides it
npx voxgig-system template eject srv.yml.frag
# edit the fragment ($$slot$$ placeholders), then:
npm run model-build
npx voxgig-system template diff            # your copies vs the package
\`\`\`

For structural changes, eject the generator source instead:

\`\`\`bash
npx voxgig-system template eject srv_yml --code
# edit src/gen/srv_yml.ts, then:
npm run build && npm run model-build
\`\`\`

\`.ejected.json\` records what was ejected from which package version so
\`template diff\` can flag upstream changes after upgrades.
`)
      })
    })
  })
}


export {
  BuildPart,
}

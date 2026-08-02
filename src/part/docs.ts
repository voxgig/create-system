/* Copyright © 2026 Voxgig Ltd, MIT License. */

// Project documentation (Diátaxis: tutorial / how-to / reference /
// explanation) plus the AGENTS.md agent guide. These document the
// GENERATED project (the app the user owns), not the Voxgig tooling.
// The web environment (@voxgig/build EnvWeb) adds web-specific docs
// alongside these when activated.

import { File, Content, Folder } from 'jostraca'

import type { Spec } from '../scaffold'


function DocsPart(spec: Spec) {
  const { name } = spec

  File({ name: 'AGENTS.md' }, () => {
    Content(`# Agent guide: ${name}

A Voxgig system project: a Seneca microservices backend driven by a
model (\`backend/model/*.aontu\` -> \`model.json\`). See [docs/](docs/)
for concepts; this file is operational guidance. The web app (if
generated) has its own guide at \`web/AGENTS.md\`.

## Commands (run in backend/)

\`\`\`bash
npm run build         # model-build (compile model + codegen) + tsc
npm run model-build   # just compile the model + run generation
npm test              # unit tests (in-memory store, no externals)
npm run local         # boot the backend locally
\`\`\`

Change the model? Always \`npm run model-build\` before expecting any
generated artifact or the web UI to reflect it.

## Layout

- \`backend/model/\` - the model sources: \`ent.aontu\` (entities),
  \`srv.aontu\` (services), \`msg.aontu\` (messages), \`env.aontu\`
  (environments), \`theme.aontu\` (design theme), \`conf.aontu\` (config).
- \`backend/src/srv/<srv>/\` - service actions; a model message maps to
  the file named after its LAST pattern pair (\`save:item\` ->
  \`save_item.ts\`).
- \`backend/src/env/\` - runtime entries (shared/local/lambda/web).
- \`web/\` - the generated SPA (developer-owned, create-once).

## Conventions and gotchas

- Prefer \`npx voxgig-system add entity|srv|msg|field|env ...\` over
  hand-editing model files - it appends jsonic blocks and preserves
  formatting. Aontu comments are \`#\` only; quote values containing
  \`-\`, \`/\`, or \`#\`.
- In generated files, \`##\` (jsonic) / \`////\` (TS) are prose; a single
  \`#\` / \`//\` marks disabled example code.
- Relationship fields: \`kind: String\` plus a \`ref: 'zone/name'\`
  attribute (usually also \`valid: Skip\`). \`kind: 'Ref'\` is invalid.
- Only declare a model message when its action file exists - boot fails
  otherwise.
- Generated deployment artifacts (\`backend/gen/\`) are regenerated every
  model-build: never hand-edit. Application code (\`src/\`, \`web/\`) is
  create-once: yours to edit freely.
`)
  })

  Folder({ name: 'docs' }, () => {

    File({ name: 'tutorial.md' }, () => {
      Content(`# Tutorial: getting started with ${name}

*Diátaxis: tutorial - hands-on first steps in this project.*

## 1. Install and verify

\`\`\`bash
cd backend
npm install
npm run build
npm test          # green out of the box
npm run local     # boot the (empty) backend
\`\`\`

## 2. First entity

\`\`\`bash
npx voxgig-system add entity app/thing
npx voxgig-system add field app/thing title 'done:Boolean'
npm run model-build
\`\`\`

The entity is now part of the model (\`backend/model/model.json\`) and
usable through the Seneca entity layer. (Alternatively, uncomment the
worked \`thing\` example in \`model/*.aontu\` and \`src/srv/\` - a single
\`#\` / \`//\` marks disabled example code.)

## 3. A service and a message

\`\`\`bash
npx voxgig-system add srv thing
npx voxgig-system add msg thing.get.info
npm run model-build
\`\`\`

Create \`backend/src/srv/thing/get_info.ts\` with an action function -
the message \`aim:thing,get:info\` maps to it by name. Then
\`npm run build && npm test\`.

## 4. The web app

\`\`\`bash
npx voxgig-system add env web
npm run model-build
npm run build
npm run web
\`\`\`

This generates a complete model-driven web app under \`web/\` (public
site, login, entity admin UI, settings, light/dark theme) - see the
web how-to guides in this docs folder once generated.
`)
    })

    Folder({ name: 'how-to' }, () => {
      File({ name: 'add-an-entity.md' }, () => {
        Content(`# How to add an entity

*Diátaxis: how-to guide.*

\`\`\`bash
cd backend
npx voxgig-system add entity shop/product
npx voxgig-system add field shop/product title 'price:Number' 'note:{kind:String,valid:Skip}'
npm run model-build
\`\`\`

Field forms: \`name\` | \`name:Kind\` | \`name:{...def}\`.

## Add a relationship

A relationship field stores the target entity's id: keep
\`kind: String\` and add a \`ref\` attribute naming the target:

\`\`\`bash
npx voxgig-system add field shop/order 'product_id:{kind:String,ref:"shop/product",valid:Skip}'
\`\`\`

The web app derives pickers, links, and drill-down navigation from
\`ref\` fields automatically.

## Verify

\`\`\`bash
npm run build && npm test
\`\`\`

If the web env is active, reload the app - the new entity appears in
the menu with a working list/detail/form; no code needed.
`)
      })
    })

    Folder({ name: 'reference' }, () => {
      File({ name: 'model.md' }, () => {
        Content(`# Reference: the model

*Diátaxis: reference - the model source files in \`backend/model/\`.*

| File | Holds |
|---|---|
| \`model.aontu\` | Root: imports, entity shape, build config |
| \`ent.aontu\` | Entities (\`<zone>: <name>: { field: ... }\`) |
| \`srv.aontu\` | Services (which messages each service answers) |
| \`msg.aontu\` | Messages (\`aim: <srv>: <verb>: <noun>: {}\` + params) |
| \`env.aontu\` | Target environments (local/aws/web/...) |
| \`theme.aontu\` | Design theme: named modes of design tokens |
| \`conf.aontu\` | Core config: name, auth token, ports |
| \`.model-config/\` | Generation actions run by model-build |

\`npm run model-build\` unifies these (aontu) into \`model/model.json\`,
then runs the generation actions.

## Conventions

- Comments are \`#\` (jsonic); \`##\` is prose, single \`#\` is disabled
  example code. Quote values containing \`-\`, \`/\`, or \`#\`.
- Entity fields: \`kind\` (String/Number/Boolean), \`label\`, \`valid\`
  (gubu expression; \`Skip\` = optional).
- Relationship: \`kind: String\` + \`ref: 'zone/name'\` (+ usually
  \`valid: Skip\`).
- Custom entity view (web app): \`ux: { view: 'custom' }\` on the entity.
- Messages map to action files by the LAST pattern pair:
  \`thing.save.item\` -> \`src/srv/thing/save_item.ts\`.
- Message params are closed by default; \`'$$': 'Open'\` opens an object
  to additional properties.
`)
      })
    })

    Folder({ name: 'explanation' }, () => {
      File({ name: 'architecture.md' }, () => {
        Content(`# Explanation: architecture

*Diátaxis: explanation - how ${name} fits together.*

## Model-driven

The model (\`backend/model/*.aontu\`) is the single source of truth:
entities, services, messages, environments, and the design theme. It
compiles (aontu unification) to \`model.json\`, which drives entity
validation, code generation (\`@voxgig/build\`), message wiring
(\`@voxgig/system\`), and - if the web env is active - the web UI at
runtime. Change the model, run \`model-build\`, and every derived layer
follows.

## Messages, not calls

The backend is a [Seneca](https://senecajs.org) system: services
communicate by pattern-matched messages (\`aim:thing,get:info\`), not
imports. \`MakeSrv\` wires each model-declared message to its action
file by naming convention. Locally all services run in one process
(\`npm run local\`); deployed, the same messages travel over transport
(e.g. one Lambda per service) - service code is identical in both.

## Ownership of generated code

Two rules keep generation and hand-editing from fighting:

- \`backend/gen/\` (deployment artifacts) is regenerated every build -
  never edit.
- Application code (\`src/\`, \`web/\`, seeds, custom views) is
  create-once - generated as a starting point, then yours; re-running
  generation never overwrites it. (Exceptions: \`web/src/views.js\` and
  \`web/src/theme.css\` are pure functions of the model and regenerate.)
`)
      })
    })
  })
}


export {
  DocsPart,
}

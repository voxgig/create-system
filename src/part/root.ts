/* Copyright © 2026 Voxgig Ltd, MIT License. */

// Project-root files: README.md and .gitignore.

import { File, Content } from 'jostraca'

import type { Spec } from '../scaffold'


function RootPart(spec: Spec) {
  const { name } = spec

  File({ name: 'README.md' }, () => {
    Content(`# ${name}

A Voxgig system project (backend only), created by
\`npm create @voxgig/system\`. A [Seneca](https://senecajs.org)
microservices backend with a model-driven entity layer
(\`@voxgig/model\` + \`@voxgig/system\`), per-user data isolation via the
Seneca \`user\` + \`owner\` plugins, and jostraca-generated Lambda
deployment templates (\`@voxgig/build\`).

The project starts empty: the structure is in place, but there are no
entities, services, or messages yet - only commented examples. Open
\`backend/model/\` and uncomment the examples to add your first ones.

## Layout

\`\`\`
${name}/
  backend/
    model/      voxgig-model sources (.aontu) -> compiled model.json
    build/      model-build generation actions (Lambda templates)
    src/
      env/shared/basic.ts   core Seneca setup (entity + user + owner)
      env/local/local.ts    local runner (in-memory store)
      env/lambda/lambda.ts  Lambda bootstrap for generated handlers
      srv/                  services (empty - see the commented example)
    test/unit/  unit tests
\`\`\`

## Build, test, run

\`\`\`bash
cd backend
npm install
npm run build    # voxgig-model (compile model + generate) + tsc
npm test         # unit tests, in-memory store, no external services
npm run local    # boot the backend locally
\`\`\`

## Adding your first feature

1. \`backend/model/ent.aontu\` - uncomment the example entity.
2. \`backend/model/msg.aontu\` - uncomment the example messages.
3. \`backend/model/srv.aontu\` - uncomment the example service.
4. \`backend/src/srv/\` - uncomment the example service implementation.
5. \`npm run build && npm test\`

The model compiles to \`model/model.json\`, which drives entity validation
and code generation. \`npm run model\` watches the model sources.
`)
  })

  File({ name: '.gitignore' }, () => {
    Content(`node_modules
dist
dist-test
*.log
*.tsbuildinfo
.DS_Store

# jostraca build metadata (written during model-build generation)
**/.jostraca/

# voxgig-model: model-config.aontu is the hand-authored source (build actions);
# model-config.json is compiled from it by model-build.
**/.model-config/model-config.json
`)
  })
}


export {
  RootPart,
}

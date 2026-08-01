/* Copyright © 2026 Voxgig Ltd, MIT License. */

// backend/src/env/: the Seneca environments - shared plugin setup (basic),
// the local runner, and the Lambda bootstrap used by generated handlers.

import { File, Content, Folder } from 'jostraca'

import type { Spec } from '../scaffold'


function EnvPart(spec: Spec) {
  const { name } = spec

  const STAGE_VAR = name.toUpperCase().replace(/-/g, '_') + '_STAGE'

  Folder({ name: 'src' }, () => {
    Folder({ name: 'env' }, () => {

      Folder({ name: 'shared' }, () => {
        File({ name: 'basic.ts' }, () => {
          Content(`
import { v4 } from 'uuid'

import { entity } from '@voxgig/util'

import Model from '../../../model/model.json'


// Core seneca setup shared by the local runner, the lambda bootstrap, and
// (optionally) tests.
//
// \`user\` provides user records and the signed-in principal. Access control
// is done EXPLICITLY in the service actions: the generic \`ent\` service scopes
// by project membership, and a service can scope by owner_id from the
// principal. @seneca/owner is intentionally NOT used — it annotated every
// entity (including sys/user, which broke self-service password changes) and
// its owner-only filter is incompatible with shared, membership-based data.
const base = {
  seneca: {
    timeout: 5 * 60 * 1000,
    legacy: false,
    log: {
      logger: 'flat',
      level: 'warn',
    },
  },
  options: {
    promisify: {},
    entity: {
      generate_id: () => v4().split('-').join(''),
      ent: entity(Model),
    },
    entity_util: {
      when: {
        active: true,
        human: 'y',
      },
    },
    user: {
      fields: {
        standard: ['id', 'handle', 'email', 'name', 'active'],
      },
    },
    reload: {},
  },
}


function basic(seneca: any, options?: any) {
  options = options || {}
  const deep = seneca.util.deep

  seneca
    .use('promisify', deep(base.options.promisify, options.promisify))
    .use('entity', deep(base.options.entity, options.entity))
    .use('entity-util', deep(base.options.entity_util, options.entity_util))
    .use('user', deep(base.options.user, options.user))
    .use('reload', deep(base.options.reload, options.reload))

  return seneca
}


export {
  basic,
  base,
}
`)
        })
      })

      Folder({ name: 'local' }, () => {
        File({ name: 'local.ts' }, () => {
          Content(`
// Local runner: boots a single in-process Seneca instance with the core
// plugins and any services loaded from dist/srv. Uses the default
// in-memory entity store, so it runs with no external services.

import Seneca from 'seneca'
import { Local } from '@voxgig/system'

import { basic, base } from '../shared/basic'

import Pkg from '../../../package.json'
import Model from '../../../model/model.json'


run()


async function run() {
  const { deep } = Seneca.util

  const seneca = Seneca(deep(base.seneca, { tag: '${name}-local' }))

  seneca.context.model = Model
  seneca.context.env = 'local'
  seneca.context.stage = 'local'
  seneca.context.srvname = 'all'
  seneca.context.pkg = Pkg

  seneca.test()

  basic(seneca)

  seneca.use(Local, {
    srv: {
      folder: __dirname + '/../../../dist/srv',
    },
  })

  await seneca.ready()

  console.log('${name.toUpperCase()}-BACKEND STARTED', { version: Pkg.version })
}
`)
        })
      })

      Folder({ name: 'lambda' }, () => {
        File({ name: 'lambda.ts' }, () => {
          Content(`
// Lambda environment bootstrap. The generated handlers
// (src/handler/lambda/<srv>.ts) call getSeneca() to obtain a ready Seneca
// instance wired for the AWS Lambda + API Gateway path.
//
// Uses the default in-memory entity store - swapping in a real store
// (e.g. dynamo-store) is a deployment concern.

import Seneca from 'seneca'
import { Live } from '@voxgig/system'

import { basic, base } from '../shared/basic'

import Pkg from '../../../package.json'
import Model from '../../../model/model.json'


const STAGE = process.env.${STAGE_VAR} || 'local'

const Main = Model.main as any

let seneca: any = null


async function getSeneca(srvname: string, complete: Function): Promise<any> {
  const { deep } = Seneca.util

  if (null == seneca) {
    const srv = Main.srv[srvname]

    seneca = Seneca(deep(base.seneca, {
      tag: srvname + '-${name}-' + STAGE + '@' + Pkg.version,
      timeout: srv.env.lambda.timeout * 60 * 1000,
    })).test()

    seneca.context.model = Model
    seneca.context.srvname = srvname
    seneca.context.stage = STAGE
    seneca.context.env = 'lambda'
    seneca.context.pkg = Pkg

    basic(seneca, { reload: { active: false } })

    seneca
      .use('gateway')
      .use('gateway-lambda', {
        auth: {
          token: {
            name: '${name}-auth',
          },
        },
      })
      .use('gateway-auth', {
        spec: {
          lambda_cookie: {
            active: true,
            token: {
              name: '${name}-auth',
            },
            user: {
              auth: true,
              require: srv.user?.required ?? true,
            },
          },
        },
      })

    seneca.use(Live, {
      srv: {
        name: srvname,
        folder: __dirname + '/../../srv',
      },
    })

    // Call ready() exactly once - a second ready() on an already-ready
    // instance never resolves under seneca 4.0.0-rc4.
    await seneca.ready()

    if (complete) {
      await complete(seneca)
    }
  }

  return seneca
}


export {
  getSeneca,
}
`)
        })
      })
    })
  })
}


export {
  EnvPart,
}

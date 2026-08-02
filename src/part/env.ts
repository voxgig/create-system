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


// Core seneca setup shared by the local runner and (optionally) tests.
//
// \`user\` provides user records; @seneca/gateway-auth resolves the
// signed-in principal and puts it on the message meta. Access control is
// enforced by @seneca/owner at the ENTITY layer (see the \`owner\` options
// below), not re-implemented in each action:
//   - \`owner_id\` + \`project_id\` are the two ownership axes;
//   - the \`member\` role scopes to project_id, so project membership grants
//     access to the whole project's data;
//   - \`ignore\` keeps the sys zone unscoped, which is what a blanket
//     \`annotate: ['sys:entity']\` got wrong before (it scoped sys/user too
//     and broke self-service password changes).
// The aim:web proxies resolve the caller's project and put the owner axes
// on custom.sysowner - see src/srv/ent/access.ts (ownerOf).
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

    // Access control, enforced by @seneca/owner at the entity layer rather
    // than by hand in each action. Two ownership axes:
    //
    //   owner_id   the creating user (from the gateway principal)
    //   project_id the project the row belongs to (the TENANT axis)
    //
    // The \`member\` role scopes to project_id, which relaxes the axes more
    // specific than it (owner_id) and keeps project_id enforced: every
    // member of a project sees ALL of that project's rows, whoever created
    // them. That is exactly the collaboration semantic this app wants, and
    // it is enforced on load/list/save/remove alike - so a row cannot be
    // read, moved or overwritten from outside its project.
    //
    // \`ignore\` keeps the sys zone out of it. sys/user must stay unscoped
    // (self-service password changes, member pickers); blanket-annotating
    // \`sys:entity\` without this is why owner was previously removed.
    owner: {
      ownerprop: 'sysowner',
      fields: ['owner_id', 'project_id'],
      annotate: ['sys:entity'],
      ignore: ['sys:entity,base:sys'],
      rolesys: true,
      roles: {
        member: { scope: 'project_id', grants: [{ entity: '*' }] },
        // Entities with no ref to proj/project are not project data, so
        // they scope by the owner alone: no \`scope\`, and project_id is
        // switched off so it is neither injected nor queried.
        user: {
          grants: [{
            entity: '*',
            spec: {
              read: { project_id: false },
              write: { project_id: false },
              inject: { project_id: false },
            },
          }],
        },
        // Internal bookkeeping (seeding, membership rows, resolving which
        // project a row belongs to before its owner is known). Never
        // reachable from a request: the aim:web proxies only ever mint a
        // \`member\` owner from the gateway principal.
        system: { scope: '*', grants: [{ entity: '*' }] },
      },
    },
  },
}


function basic(seneca: any, options?: any) {
  options = options || {}
  const deep = seneca.util.deep

  seneca
    .use('promisify', deep(base.options.promisify, options.promisify))
    .use('entity', deep(base.options.entity, options.entity))
    // entity-util \`when\` maintains t_c/t_m (+ human t_ch/t_mh) on every
    // save - actions must NOT set them by hand.
    .use('entity-util', deep(base.options.entity_util, options.entity_util))
    .use('user', deep(base.options.user, options.user))
    .use('owner', deep(base.options.owner, options.owner))
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

  // Dev REPL (@seneca/repl): poke the running system with messages -
  //   npx seneca-repl telnet://localhost:<port.repl>
  // Disable with REPL=false; override the port with REPL_PORT.
  if ('false' !== process.env.REPL) {
    seneca.use('repl', {
      port: parseInt(process.env.REPL_PORT || '', 10) ||
        (Model as any).main.conf.port.repl,
    })
  }

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

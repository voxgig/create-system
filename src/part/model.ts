/* Copyright © 2026 Voxgig Ltd, MIT License. */

// backend/model/: the voxgig-model sources. Structurally complete but
// empty - entities, messages, and services appear only as commented
// examples for the user to uncomment and adapt.

import { File, Content, Folder } from 'jostraca'

import type { Spec } from '../scaffold'


function ModelPart(spec: Spec) {
  const { name } = spec

  Folder({ name: 'model' }, () => {

    File({ name: 'model.aontu' }, () => {
      Content(`
@"@voxgig/model/model/sys.aontu"

voxgig: build: version: '2'


## Entity shape.
main: shape: ent: {
  id: {
    field: 'id'
  }
  field: &: {
    kind: *'String' | string
  }
  field: {
    id: kind: *'String' | string
  }
}


main: msg: @"msg.aontu"          # Seneca Messages
main: srv: @"srv.aontu"          # Services
main: conf: @"conf.aontu"        # Configuration
main: ent: @"ent.aontu"          # Entities
main: env: @"env.aontu"          # Target environments


main: srv: &: options: {
  debug: true
}
`)
    })

    File({ name: 'ent.aontu' }, () => {
      Content(`
sys: &: $.main.shape.ent


## Base system entities (used by the user/owner plugins).

sys: user: {
  field: {}
  valid: '$$': 'Open'
}

sys: login: {
  field: {}
  valid: '$$': 'Open'
}


## Example application entity. Uncomment (and the zone shape line) to add
## your first entity; the owner_id field gives per-user isolation via the
## @seneca/owner plugin (see src/env/shared/basic.ts).

# app: &: $.main.shape.ent
#
# app: thing: {
#   field: {
#     id: {
#       label: 'ID'
#       kind: String
#     }
#     title: {
#       label: 'Title'
#       kind: String
#       valid: 'Min(1).Max(999)'
#     }
#     owner_id: {
#       label: 'Owner'
#       kind: String
#     }
#     t_c: {
#       label: 'Created'
#       kind: Number
#       valid: Skip
#     }
#     t_m: {
#       label: 'Modified'
#       kind: Number
#       valid: Skip
#     }
#   }
#   valid: '$$': 'Open'
# }
`)
    })

    File({ name: 'msg.aontu' }, () => {
      Content(`
## Seneca message patterns.

aim: {}


## Example service messages. Uncomment to add messages for the example
## 'thing' service. Each message maps by convention to an action file in
## src/srv/thing/ (save:item -> save_item.ts); add a message only when its
## action file exists.

# aim: thing: {
#   get: info: {}
#   save: item: {}
# }


## Gateway (web) routing to web_ action files.

# aim: req: {
#   get: info: {}
#   on: thing: {
#     save: item: { '$': { file: './web_save_item' }}
#   }
# }
`)
    })

    File({ name: 'srv.aontu' }, () => {
      Content(`
&: $.sys.shape.srv.std_ts


## Example service definition. Uncomment to add the example 'thing'
## service (see also msg.aontu and src/srv/).

# thing: {
#   in: {
#     aim: thing: {}
#     aim: req: on: thing: '$': allow: true
#   }
#   user: required: true
#   api: web: path: { area: 'private/', suffix: '' }
#   env: lambda: active: true
# }
`)
    })

    File({ name: 'env.aontu' }, () => {
      Content(`
## Target environments. Each active environment generates deployment
## artifacts under gen/env/<name>/ and (once) a runtime entry under
## src/env/. Add more with: npx voxgig-system add env <name|spec>
## Kinds: local, basic, docker, vm, aws, azure, cloudflare.

local: { active: true }

# basic: { active: true }
# docker: { active: true }
# vm: { active: true }
# aws: { active: true, region: 'us-east-1', stage: 'dev' }
# azure: { active: true }
# cloudflare: { active: true }

## The web frontend (experimental SPA on a Seneca bus):
# web: { active: true }
`)
    })

    File({ name: 'conf.aontu' }, () => {
      Content(`
core: name: '${name}'
core: short: '${name}'
core: token: '${name}-auth'

port: &: number

port: {
  backend: 50500
  frontend: 50501
  repl: 50502
}
`)
    })

    Folder({ name: '.model-config' }, () => {
      File({ name: 'model-config.aontu' }, () => {
        Content(`
@"@voxgig/model/model/.model-config/model-config.aontu"

## Code-generation actions. Each loads a plain-JS script under build/ that
## runs during model-build and emits the Lambda deployment templates.
## order.action sets their execution order.

sys: model: action: {
  srv_yml: {
    load: 'build/srv_yml'
  }
  srv_handler: {
    load: 'build/srv_handler'
  }
  res_yml: {
    load: 'build/res_yml'
  }
  env_gen: {
    load: 'build/env_gen'
  }
}

sys: model: order: action: 'srv_yml,srv_handler,res_yml,env_gen'
`)
      })
    })
  })
}


export {
  ModelPart,
}

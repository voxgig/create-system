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
main: theme: @"theme.aontu"      # Design theme (UI)
main: api: @"api.aontu"          # REST API (strict JSON)


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
#       ## Server-managed: @seneca/owner injects it AFTER validation runs,
#       ## so without Skip every create fails as 'owner_id is required'.
#       valid: Skip
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

    File({ name: 'theme.aontu' }, () => {
      Content(`
## Design theme (UI), controlled by the model. Each mode is a set of design
## tokens (colors, fonts, radius, effects) emitted as CSS variables
## (--vg-<token>) by @voxgig/build into web/src/theme.css. Override tokens
## per project in web/src/custom.css; add modes via the \`theme:modes\` hook.

mode: 'light'          # default mode

modes: {
  light: {
    primary:       '#1f6feb'
    'primary-dark': '#1a5fd0'
    bg:            '#f5f7fa'
    surface:       '#ffffff'
    text:          '#1c2733'
    muted:         '#8b949e'
    border:        '#e3e8ee'
    'topbar-bg':   '#0d1b2a'
    'topbar-fg':   '#e6edf3'
    'accent-bg':   '#e7f0ff'
    font:          '15px/1.5 system-ui, sans-serif'
    radius:        '6px'
    'shadow-card': '0 6px 24px rgba(13,27,42,.10)'
  }

  dark: {
    primary:       '#58a6ff'
    'primary-dark': '#388bfd'
    bg:            '#0d1117'
    surface:       '#161b22'
    text:          '#e6edf3'
    muted:         '#8b949e'
    border:        '#30363d'
    'topbar-bg':   '#010409'
    'topbar-fg':   '#e6edf3'
    'accent-bg':   '#1f6feb44'
    font:          '15px/1.5 system-ui, sans-serif'
    radius:        '6px'
    'shadow-card': '0 6px 24px rgba(0,0,0,.55)'
  }
}
`)
    })

    File({ name: 'api.aontu' }, () => {
      Content(`
## REST API (strict JSON), served by the api service at
## <prefix>/<version>/<zone>/<name>[/<id>] (e.g. /api/v1/shop/product/p01).
## Uniform semantic paths + methods (list/load/create/update/remove) so an
## SDK can be generated (sdkgen), and an OpenAPI spec is generated from the
## entity field definitions on every model-build (gen/api/openapi.json).
##
## Authentication: API access keys (Authorization: Bearer <key>), created
## and revoked per user in the web app (Settings & security), stored
## hashed as sys/apikey entities. The api service itself is declared by
## 'voxgig-system add env web'.
##
## Exposure: application entities are exposed by default; the sys zone is
## never exposed. Configure per entity under ent:.

active: true

prefix: '/api'
version: 'v1'

## Per-entity config (all application entities active by default):
# ent: {
#   'shop/product': { active: false }   # hide one entity from the API
# }
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
  doc_gen: {
    load: 'build/doc_gen'
  }
  api_gen: {
    load: 'build/api_gen'
  }
}

sys: model: order: action: 'srv_yml,srv_handler,res_yml,env_gen,doc_gen,api_gen'
`)
      })
    })
  })
}


export {
  ModelPart,
}

/* Copyright © 2026 Voxgig Ltd, MIT License. */

// backend/src/srv/: services. Empty apart from a fully commented example
// service - uncomment (with the model examples) to add your first one.
// The comment-only files still compile, which keeps dist/srv present for
// the service loaders.

import { File, Content, Folder } from 'jostraca'

import type { Spec } from '../scaffold'


function SrvPart(_spec: Spec) {

  Folder({ name: 'src' }, () => {
    Folder({ name: 'srv' }, () => {

      Folder({ name: 'thing' }, () => {

        File({ name: 'thing-srv.ts' }, () => {
          Content(`//// Example service entry. Uncomment (with the model examples in
//// backend/model/) to enable the 'thing' service. MakeSrv auto-loads one
//// action file per message: save:item -> ./save_item, and web routes load
//// the web_ files (see model/msg.aontu).

// import { MakeSrv } from '@voxgig/system'
//
// module.exports = MakeSrv('thing', require)
`)
        })

        File({ name: 'get_info.ts' }, () => {
          Content(`//// Example action: service health/info.

// module.exports = function make_get_info() {
//   return async function get_info(this: any, _msg: any) {
//     return { ok: true, srv: 'thing' }
//   }
// }
`)
        })

        File({ name: 'save_item.ts' }, () => {
          Content(`//// Example action: create or update a 'thing' item.
////
//// Note what is NOT here: @seneca/owner fills owner_id from the acting
//// principal and scopes the query (once something puts that principal on
//// custom.sysowner - the generic entity service that comes with
//// \`voxgig-system add env web\` does; a bare scaffold has no request layer
//// yet, so owner stays inert until then), and @seneca/entity-util maintains
//// t_c/t_m. An action that sets either by hand fights the plugins - and
//// hand-rolled timestamps lose t_c on update.
////
//// owner_id is dropped from the incoming data on purpose: a row the
//// client loaded carries it, and owner rejects a write whose payload
//// disagrees with the acting owner.

// module.exports = function make_save_item() {
//   return async function save_item(this: any, msg: any) {
//     const seneca = this
//
//     const data = Object.assign({}, msg.item)
//     delete data.owner_id
//
//     const item = await seneca.entity('app/thing').data$(data).save$()
//
//     return { ok: !!item, item }
//   }
// }
`)
        })

        File({ name: 'web_save_item.ts' }, () => {
          Content(`//// Example gateway wrapper: forwards a web request to the internal
//// aim:thing,save:item message.

// module.exports = function make_web_save_item() {
//   return async function web_save_item(this: any, msg: any) {
//     const res = await this.post({ aim: 'thing', save: 'item', item: msg.item })
//     return res.ok ? { ok: true, item: res.item } : { ok: false }
//   }
// }
`)
        })
      })
    })
  })
}


export {
  SrvPart,
}

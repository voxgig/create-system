/* Copyright © 2026 Voxgig Ltd, MIT License. */

import { test, describe } from 'node:test'
import { expect } from '@hapi/code'

import Fs from 'node:fs'
import Os from 'node:os'
import Path from 'node:path'

// Loaded from the compiled output (dist-test/ -> dist/): run
// `npm run build` before `npm test`.
const { scaffold } = require('../dist/scaffold.js')


const EXPECTED_FILES = [
  'README.md',
  '.gitignore',
  'backend/package.json',
  'backend/tsconfig.json',
  'backend/src/tsconfig.json',
  'backend/test/tsconfig.json',
  'backend/build/srv_yml.js',
  'backend/build/srv_handler.js',
  'backend/build/res_yml.js',
  'backend/model/model.aontu',
  'backend/model/ent.aontu',
  'backend/model/msg.aontu',
  'backend/model/srv.aontu',
  'backend/model/conf.aontu',
  'backend/model/.model-config/model-config.aontu',
  'backend/src/env/shared/basic.ts',
  'backend/src/env/local/local.ts',
  'backend/src/env/lambda/lambda.ts',
  'backend/src/srv/thing/thing-srv.ts',
  'backend/src/srv/thing/get_info.ts',
  'backend/src/srv/thing/save_item.ts',
  'backend/src/srv/thing/web_save_item.ts',
  'backend/test/unit/boot.test.ts',
]


describe('create-system', () => {

  test('scaffolds-the-empty-project', async () => {
    const out = Fs.mkdtempSync(Path.join(Os.tmpdir(), 'create-system-'))

    await scaffold({ name: 'my-app', folder: out })

    const root = Path.join(out, 'my-app')

    for (const rel of EXPECTED_FILES) {
      expect(
        Fs.existsSync(Path.join(root, rel)),
        'missing: ' + rel
      ).equal(true)
    }

    // Parameterized by name.
    const conf = Fs.readFileSync(Path.join(root, 'backend/model/conf.aontu'), 'utf8')
    expect(conf).contains("core: name: 'my-app'")
    expect(conf).contains("core: token: 'my-app-auth'")

    const pkg = JSON.parse(
      Fs.readFileSync(Path.join(root, 'backend/package.json'), 'utf8'))
    expect(pkg.name).equal('my-app-backend')
    expect(pkg.devDependencies['@voxgig/build']).exist()

    const lambda = Fs.readFileSync(
      Path.join(root, 'backend/src/env/lambda/lambda.ts'), 'utf8')
    expect(lambda).contains("name: 'my-app-auth'")
    expect(lambda).contains('MY_APP_STAGE')

    // Empty of implementation: no active entities/services beyond sys,
    // examples present but commented.
    const ent = Fs.readFileSync(Path.join(root, 'backend/model/ent.aontu'), 'utf8')
    expect(ent).contains('sys: user:')
    expect(ent).contains('# app: thing: {')

    const srv = Fs.readFileSync(Path.join(root, 'backend/model/srv.aontu'), 'utf8')
    expect(srv).contains('# thing: {')
    expect(srv.split('\n').filter(
      (l: string) => /^[a-z]/.test(l) && !l.startsWith('&')).length).equal(0)
  })


  test('example-service-files-are-fully-commented', async () => {
    const out = Fs.mkdtempSync(Path.join(Os.tmpdir(), 'create-system-'))
    await scaffold({ name: 'demo', folder: out })

    const dir = Path.join(out, 'demo', 'backend', 'src', 'srv', 'thing')
    for (const f of Fs.readdirSync(dir)) {
      const lines = Fs.readFileSync(Path.join(dir, f), 'utf8').split('\n')
      for (const line of lines) {
        expect(
          '' === line.trim() || line.trim().startsWith('//'),
          f + ': uncommented line: ' + line
        ).equal(true)
      }
    }
  })

})

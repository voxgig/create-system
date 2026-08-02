/* Copyright © 2026 Voxgig Ltd, MIT License. */

// backend/package.json and the tsconfig triple (root composite,
// src, test). Package versions mirror a known-good working system.

import { File, Content, Folder } from 'jostraca'

import type { Spec } from '../scaffold'


function BackendPart(spec: Spec) {
  const { name } = spec

  File({ name: 'package.json' }, () => {
    Content(JSON.stringify({
      name: name + '-backend',
      version: '0.0.1',
      description: name + ' backend',
      main: 'index.js',
      scripts: {
        test: 'node --enable-source-maps --test-force-exit --test "dist-test/unit/**/*.test.js"',
        'test-some': 'node --enable-source-maps --test-force-exit --test-name-pattern="$npm_config_pattern" --test "dist-test/unit/**/*.test.js"',
        model: 'voxgig-model model/model.aontu --watch',
        'model-build': 'voxgig-model model/model.aontu',
        watch: 'tsc --build src test -w',
        build: 'npm run model-build && tsc --build src && tsc --build test',
        clean: 'rm -rf dist dist-test node_modules yarn.lock package-lock.json',
        reset: 'npm run clean && npm install && npm run build && npm test',
        local: 'node dist/env/local/local.js --seneca.log.warn',
        'local-debug': 'node dist/env/local/local.js --seneca.log.debug',
        web: 'node dist/env/web/web.js',
      },
      author: '',
      license: 'UNLICENSED',
      dependencies: {
        '@seneca/entity-util': '3.2.0',
        '@seneca/gateway': '1.3.0',
        '@seneca/gateway-auth': '1.1.0',
        '@seneca/gateway-express': '1.0.0',
        '@seneca/gateway-lambda': '1.1.0',
        '@seneca/owner': '6.3.0',
        '@seneca/reload': '0.5.0',
        '@seneca/repl': '9.1.0',
        '@seneca/user': '6.4.0',
        '@voxgig/model': '9.3.0',
        '@voxgig/system': '1.7.0',
        '@voxgig/util': '^0.5.4',
        'cookie-parser': '1.4.7',
        express: '5.2.1',
        seneca: '4.0.0-rc4',
        'seneca-entity': '28.1.0',
        'seneca-promisify': '3.7.2',
        uuid: '^11.1.1',
      },
      devDependencies: {
        '@hapi/code': '^9.0.3',
        '@tsconfig/node16': '16.1.8',
        '@types/cookie-parser': '1.4.10',
        '@types/express': '5.0.6',
        '@types/node': '^26.1.1',
        '@voxgig/build': '4.11.0',
        typescript: '5.9.3',
      },
    }, null, 2) + '\n')
  })

  File({ name: 'tsconfig.json' }, () => {
    Content(JSON.stringify({
      compilerOptions: {
        outDir: '.',
        rootDir: '.',
        resolveJsonModule: true,
        composite: true,
      },
      files: [
        'package.json',
        'model/model.json',
      ],
    }, null, 2) + '\n')
  })

  Folder({ name: 'src' }, () => {
    File({ name: 'tsconfig.json' }, () => {
      Content(JSON.stringify({
        extends: '@tsconfig/node16/tsconfig.json',
        compilerOptions: {
          esModuleInterop: true,
          module: 'node16',
          noEmitOnError: true,
          outDir: '../dist',
          rootDir: '.',
          resolveJsonModule: true,
          sourceMap: true,
          strict: true,
          target: 'ES2021',
        },
        references: [
          { path: '../' },
        ],
      }, null, 2) + '\n')
    })
  })

  Folder({ name: 'test' }, () => {
    File({ name: 'tsconfig.json' }, () => {
      Content(JSON.stringify({
        extends: '@tsconfig/node16/tsconfig.json',
        compilerOptions: {
          esModuleInterop: true,
          module: 'node16',
          noEmitOnError: true,
          outDir: '../dist-test',
          rootDir: '.',
          resolveJsonModule: true,
          sourceMap: true,
          strict: true,
          target: 'ES2021',
        },
        references: [
          { path: '../' },
        ],
      }, null, 2) + '\n')
    })
  })
}


export {
  BackendPart,
}

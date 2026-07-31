# @voxgig/create-system

Create an empty Voxgig system project:

```bash
npm create @voxgig/system my-app
```

(npm resolves `npm create @voxgig/system` to this package,
`@voxgig/create-system`.)

The generated project is a [Seneca](https://senecajs.org) microservices
backend with a model-driven entity layer (`@voxgig/model` +
`@voxgig/system`), per-user data isolation via the Seneca `user` + `owner`
plugins, and jostraca-generated Lambda deployment templates
(`@voxgig/build`). The scaffold itself is generated with
[jostraca](https://github.com/jostraca/jostraca) components — see
`src/part/*` for the template parts.

The project starts **empty**: the full structure is in place (model,
environments, generation actions, tests), but there are no entities,
services, or messages — only commented examples.

## Generated structure

```
my-app/
  README.md .gitignore
  backend/
    package.json tsconfig.json
    build/            model-build generation actions (@voxgig/build EnvLambda)
    model/            voxgig-model sources; empty, with commented examples
    src/env/shared/   core Seneca setup (entity + user + owner)
    src/env/local/    local runner (in-memory store)
    src/env/lambda/   Lambda bootstrap for generated handlers
    src/srv/          services; commented example ('thing')
    test/unit/        starter boot tests
```

After creation:

```bash
cd my-app/backend
npm install
npm run build   # compile model + generate + tsc
npm test        # starter tests (green out of the box)
npm run local   # boot the empty backend
```

## Comment convention in generated files

In the generated model and service files, `##` (jsonic) and `////` (TS)
mark prose comments; a single `#` / `//` marks **disabled example code**.
Uncommenting one comment level of an example block yields working code —
the example `thing` entity/service/messages build, generate a Lambda
handler, and answer messages once uncommented.

## Develop

```bash
npm install
npm run build
npm test
```

`src/create.ts` is the CLI; `src/scaffold.ts` composes the jostraca
component parts in `src/part/`.

## License

MIT. Copyright (c) Voxgig Ltd.

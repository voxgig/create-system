# Reference: generated project structure

*Reference — what `npm create @voxgig/system my-app` produces.*

```
my-app/
  README.md  .gitignore  AGENTS.md
  docs/               project documentation (tutorial, how-to,
                      reference, explanation)
  backend/
    package.json tsconfig.json
    build/            model-build generation actions (@voxgig/build)
    model/            voxgig-model sources; empty, with commented examples
      model.aontu       root: imports + shapes + build config
      ent.aontu         entities (sys/user + sys/login; commented example)
      srv.aontu         services (commented example)
      msg.aontu         messages (commented example)
      env.aontu         target environments (local active)
      theme.aontu       design theme: light + dark token modes
      api.aontu         REST API config (prefix, version, exposure)
      conf.aontu        core config (name, ports)
      .model-config/    generation action wiring
    src/env/shared/   core Seneca setup (entity + user)
    src/env/local/    local runner (in-memory store)
    src/env/lambda/   Lambda bootstrap for generated handlers
    src/srv/          services; commented example ('thing')
    test/unit/        starter boot tests
```

Activating the web environment (`voxgig-system add env web` +
`npm run model-build`) additionally generates `web/` (the SPA, with its
own agent guide), `backend/src/env/web/`, `backend/src/srv/auth/`,
`backend/src/srv/ent/`, and web-specific docs under `docs/` — see
`@voxgig/build`'s EnvWeb reference.

## Comment convention in generated files

`##` (jsonic) and `////` (TS) mark prose comments; a single `#` / `//`
marks **disabled example code**. Uncommenting one comment level of an
example block yields working code.

## npm scripts (backend)

| Script | Does |
|---|---|
| `npm run model-build` | Compile the model + run generation actions |
| `npm run build` | model-build + `tsc` (src + test) |
| `npm test` | unit tests (in-memory, no external services) |
| `npm run local` | boot the backend locally |
| `npm run web` | boot the web runner (after `add env web`) |

The local dev runners (`local`, `web`) also start a Seneca REPL on
`conf.port.repl` (default 50502; `REPL=false` disables) — connect with
`npx seneca-repl telnet://localhost:50502`.

## The REST API

With the web env active, the project serves a strict-JSON REST API at
`main.api.prefix` (`/api/v1/<zone>/<name>[/<id>]`), authenticated by API
access keys (created in the web app's Settings & security). Model-build
regenerates `backend/gen/api/openapi.json` (schemas from entity fields)
and the request-validation shapes (`src/srv/api/valid_gen.ts`). See the
generated project's `docs/how-to/use-the-api.md`.

## Generated documentation

Model-build regenerates model-derived docs on every run (`@voxgig/build`
`Docs.doc_gen`): `docs/reference/entities.md` (mermaid ER diagram),
`docs/reference/messages.md` (message flows), `docs/reference/system-map.md`
(architecture + dependencies), and a `README.md` per implemented service
under `backend/src/srv/<srv>/`. These are AUTO-GENERATED — never
hand-edit. The web env additionally generates a create-once doc sidecar
per frontend component (`web/src/cmp/<name>.md`).

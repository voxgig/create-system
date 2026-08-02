# Reference: generated project structure

*Diátaxis: reference — what `npm create @voxgig/system my-app` produces.*

```
my-app/
  README.md  .gitignore  AGENTS.md
  docs/               project documentation (Diátaxis; tutorial, how-to,
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
own `web/AGENTS.md`), `backend/src/env/web/`, `backend/src/srv/auth/`,
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

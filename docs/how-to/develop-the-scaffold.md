# How to develop the scaffold

*A how-to guide — for contributors changing what
`@voxgig/create-system` generates.*

## Build and test

```bash
npm install
npm run build     # tsc --build src test -> dist/
npm test          # node:test (test/*.test.ts compiled to dist-test/)
```

## Change the generated project

- `src/create.ts` — the CLI entry.
- `src/scaffold.ts` — composes the jostraca component parts.
- `src/part/*.ts` — one part per area: `model.ts` (model sources incl.
  `theme.aontu`), `backend.ts` (package.json deps), `env.ts` (runtime env
  entries), `build.ts` (generation actions), `srv.ts`, `test.ts`,
  `root.ts`, `docs.ts` (project docs and the agent guide).

Parts express files as jostraca `File`/`Content` calls with template
literals — edit the literal, rebuild, and verify by scaffolding a fresh
project:

```bash
node dist/create.js demo   # in a scratch directory
```

## Keep the pairings in sync

- The scaffolded model must compile against the current `@voxgig/model`,
  and the dependency pins in `src/part/backend.ts` must match what the
  generated code needs (a missing dep = fresh project fails `tsc`).
- The default `theme.aontu` tokens mirror `@voxgig/build`'s EnvWeb
  defaults; change both together.
- After changing scaffold output, run a fresh end-to-end check: create a
  project, `npm install` (or overlay local packages), `npm run build`,
  `npm test`.

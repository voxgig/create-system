# Agent guide: @voxgig/create-system

Scaffolder for Voxgig system projects (`npm create @voxgig/system`).
Concepts: [README.md](README.md) + [docs/](docs/); this file is
operational guidance.

## Commands

```bash
npm run build   # tsc --build src test
npm test        # node:test over dist-test/
node dist/create.js <name>   # scaffold a project (run in a scratch dir)
```

## Layout

- `src/create.ts` CLI → `src/scaffold.ts` composes jostraca parts in
  `src/part/`: `model.ts` (model sources incl. `theme.aontu`),
  `backend.ts` (deps/scripts), `env.ts`, `build.ts`, `srv.ts`, `test.ts`,
  `top.ts`, `docs.ts` (project docs + AGENTS.md).

## Hard rules

- **Rebuild before testing or committing** — tests run the compiled
  `dist/`; a stale build silently tests old scaffold output. (`dist/` is
  not committed here, but the npm package ships it.)
- **Verify scaffold changes end-to-end**: scaffold a fresh project in a
  scratch dir, overlay local `@voxgig/build`/`@voxgig/system` into its
  `node_modules` if unpublished versions are needed, then
  `npm run build` + `npm test` in the project. A missing dependency pin
  in `src/part/backend.ts` = fresh project fails `tsc`.
- **Keep pairings in sync**: the default `theme.aontu` mirrors
  `@voxgig/build` EnvWeb's default tokens; the dep pins in `backend.ts`
  must match the generated code's imports; the model must compile against
  current `@voxgig/model`.
- Generated-file comment convention: `##`/`////` = prose, single
  `#`/`//` = disabled example code. Preserve it when editing parts.

## Model gotchas

- Aontu import semantics: `main: theme: @"theme.aontu"` places the file's
  top-level content AT `main.theme` — imported files must not re-wrap
  their own path.
- Aontu/jsonic comments are `#` only; quote values containing `-`, `/`,
  `#`.

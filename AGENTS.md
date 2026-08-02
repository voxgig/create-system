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
- **Check every pin in `src/part/backend.ts` with `npm view <pkg>
  versions`, never against a local checkout.** A scaffolded project's
  `npm install` is the first thing a new user runs.
  **Two pins are deliberately ahead of npm** and a fresh scaffold does
  not install until they are released. Both are pinned to the version
  that will work, so the scaffold starts working the moment each is
  published — no further change here:
  - `@voxgig/build` `4.11.0` (npm has `4.4.0`). 4.4.0 is not a usable
    fallback: it installs, then the model build dies with
    `Cannot read properties of undefined (reading 'doc_gen')`. Verified
    by scaffolding a fresh project against each.
  - `@seneca/owner` `6.3.0` (npm's latest is `6.2.0`, and `main` carries
    the `rolesys`/`roles` system under that SAME number, so it needs a
    bump as well as a release). Do NOT drop back to `6.2.0` to make the
    install succeed — that is the one genuinely dangerous option here,
    because it installs fine and then fatally rejects the scaffolded
    `basic.ts` options at runtime (`Plugin Owner: option value is not
    valid`). A failing install is the better failure.

  `metsitaba/todo-app` works around both with committed tarballs under
  `backend/vendor/`; a generator cannot do that for arbitrary new
  projects.
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

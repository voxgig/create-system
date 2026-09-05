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
  `root.ts`, `docs.ts` (project docs + AGENTS.md).
- `docs/` the reader-facing pages (one per kind), `STYLE-GUIDE.md` the
  rules they follow, `tools/check_prose.py` + `.vale.ini` + `.vale/` the
  gate, `.github/workflows/docs.yml` the CI job that runs it. `ci/` holds
  the dormant build workflow.

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

## Prose follows STYLE-GUIDE.md

[`STYLE-GUIDE.md`](STYLE-GUIDE.md) is normative for the reader-facing pages:
the root `README.md` and every page under `docs/`. Two gates enforce it and
both run in CI (`.github/workflows/docs.yml`):

| Gate | Checks |
|---|---|
| `vale --minAlertLevel=error $(python3 tools/check_prose.py --files)` | Google's rules plus the banned list, at the levels in `.vale.ini` |
| `python3 tools/check_prose.py` | the banned list across line wraps, em-dash spacing and ration, first person, no emoji, no citations of a working document, resolving relative links, a complete page set |

`npm run scan-prose` runs the second locally (no install needed); run
Vale by hand where it is installed (`vale sync` once, then the command
above). Neither is chained into `npm test`, which runs on a platform
matrix. The banned list is
`.vale/styles/config/vocabularies/CreateSystem/reject.txt`, read by both
gates. The page set is the configuration block at the top of
`tools/check_prose.py`; a new documentation page must be reachable from it
or neither gate reads it.

Three things trip agents most often: a page must not name or link
`AGENTS.md` or `CLAUDE.md` (state the fact instead — and the generated
project's own `AGENTS.md` is "the agent guide" in prose, since the gate
cannot tell the two apart); the em dash is spaced (` — `) and rationed to
one aside per line; and a word Vale's dictionary does not know goes into
`accept.txt` one entry at a time, never as a suffix pattern.

# Coverage report

Measured 2026-08-02 on branch `claude/todo-app-review-docs-j12w1c`
(`npm run test-cov`).

## Headline

| | lines | branches | functions |
|---|---|---|---|
| **measured** | **99.88%** | **96.12%** | **100.00%** |
| gate | *none* | *none* | *none* |

4 tests, all passing.

**Do not read this as near-perfect coverage.** It is the least meaningful
number of the three repos, for two reasons.

## 1. The CLI entry point is not counted

Node reports only files it actually loaded. `dist/create.js` — the CLI
entry, the thing a user runs — is loaded by no test, so it is **absent
from the table entirely** rather than counted as 0%.

The package emits 10 `.js` files; 9 appear. The reported figure covers
the scaffold-generation modules, not the program.

| Counted | Not counted |
|---|---|
| `scaffold.js`, `part/{backend,build,docs,env,model,root,srv,test}.js` | `create.js` (CLI entry) |

`dist-test/create.test.js` is also in the denominator, which inflates
things further — the test file's own 100% lines is counted alongside the
source it tests.

## 2. It measures what the generator writes, not whether it works

All four tests assert on generated **text**. None installs a scaffolded
project, or builds it, or runs its tests. So 99.88% coverage coexisted
with these, all real and all shipped:

- `@voxgig/build` pinned to **4.10.0, a version that never existed on
  npm** — a fresh scaffold could not install at all.
- `@seneca/owner` pinned to 6.2.0, which installs and then **fatally
  rejects** the scaffolded `basic.ts` at runtime.
- The example entity's `owner_id` missing `valid: Skip`, so every create
  in a scaffolded project failed as `owner_id is required`.
- `@voxgig/model` 9.2.4 emitting `path: "/api/undefinedapiundefined"`.

Every one of those is invisible to line coverage, because the lines that
produce them ran fine. They emit the wrong *string*.

## Per-file

| File | lines | branches | functions |
|---|---|---|---|
| `part/backend.js` | 100.00 | 100.00 | 100.00 |
| `part/build.js` | 100.00 | 100.00 | 100.00 |
| `part/docs.js` | 100.00 | 100.00 | 100.00 |
| `part/env.js` | 100.00 | 100.00 | 100.00 |
| `part/model.js` | 100.00 | 100.00 | 100.00 |
| `part/root.js` | 100.00 | 100.00 | 100.00 |
| `part/srv.js` | 100.00 | 100.00 | 100.00 |
| `part/test.js` | 100.00 | 100.00 | 100.00 |
| `scaffold.js` | 97.65 | 85.71 | 100.00 |
| `create.js` | — | — | — |

The `part/*` modules are template literals; 100% means "the template was
emitted once", not that the template is correct.

## What would actually help

Not a coverage threshold — that would lock in the illusion above. In
rough order of value:

1. **A job that scaffolds a project and runs `npm install && npm run
   build && npm test` inside it.** This is the check that catches every
   defect listed above. It cannot pass until `@voxgig/build` 4.11.0 and
   `@seneca/owner` 6.3.0 are published, since the scaffold pins them.
2. **Cover `dist/create.js`** — argument parsing and the failure paths a
   user hits first.
3. Only then consider a gate, set with an explicit include so unloaded
   files count as zero rather than vanishing.

See `ci/README.md`.

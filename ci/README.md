# CI workflow notes

The workflow itself is [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).
It ran nowhere while it lived in this folder, because GitHub only runs
workflows under `.github/workflows/`. This folder keeps the notes that
outlived the move.

## What runs

`npm ci` → `npm run build` → `npm run test-cov`, on every push and pull
request. Coverage is reported and uploaded as an `lcov` artifact, and is
**not** gated, unlike `@voxgig/build` and the reference app.

## Before adding a coverage threshold

The headline figure is misleading. Node only reports files it actually
loaded, so `dist/create.js` — the CLI entry point, which no test loads —
is **absent from the table entirely** rather than counted as 0%. The
reported figure covers the files the scaffold tests exercise, not every
file the package ships.

A threshold set from that number would lock in the illusion. Either cover
the CLI entry first, or set the gate with an explicit include covering
every emitted file, so unloaded ones count as zero.

## Not covered by this workflow

**That a generated scaffold actually installs and builds.** The suite
checks what the generator *writes*, not that the result works. Verifying
that means scaffolding a project and running `npm install && npm run build
&& npm test` inside it — which cannot pass until `@voxgig/build` 4.11.0
and `@seneca/owner` 6.3.0 are published, since the scaffold pins them.

Note the distinction those pins draw: they are strings this package
**emits into a scaffold**, not dependencies of this package, so their
absence from npm does not affect the jobs that run today.

Worth adding as a job once they are released. It is the check that would
have caught the pins being wrong in the first place: `@voxgig/build` was
pinned to 4.10.0, a version that never existed on npm.

## Actions are not pinned here

`ci.yml` uses floating major tags (`actions/checkout@v4`,
`actions/setup-node@v4`, `actions/upload-artifact@v4`), while `docs.yml`
and `publish.yml` pin every action to a full-length commit SHA. That
difference is not deliberate — it is what the file carried while it was
dormant and nothing ran it. Pinning it to match the sibling workflows is
worth doing; the majors are behind those files too, which use v7.

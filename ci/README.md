# CI workflow (dormant)

GitHub only runs workflows found under `.github/workflows/`. This lives in
`ci/`, so it is **inert** until deliberately activated.

## Activate

```bash
mkdir -p .github/workflows
git mv ci/ci.yml .github/workflows/ci.yml
git commit -m 'ci: activate workflow'
```

## What runs

`npm ci` → `npm run build` → `npm test`, on every push and pull request.

Coverage is reported and uploaded as an `lcov` artifact but is **not**
gated, unlike `@voxgig/build` and the reference app.

## Will it pass today?

Yes. This package's own dependencies (`jostraca`, and dev-only
TypeScript tooling) are all published.

Note the distinction: the pins this package **emits into a scaffold** —
`@voxgig/build` 4.11.0 and `@seneca/owner` 6.3.0 — are not on npm yet, but
they are strings in a template, not dependencies of this package. They do
not affect this workflow.

## Before adding a coverage threshold

The headline figure is misleading. Node only reports files it actually
loaded, so `dist/create.js` — the CLI entry point, which no test loads —
is **absent from the table entirely** rather than counted as 0%. The
reported ~99.9% covers the nine files the scaffold tests exercise, not the
ten the package ships.

A threshold set from that number would lock in the illusion. Either cover
the CLI entry first, or set the gate with an explicit include covering
every emitted file, so unloaded ones count as zero.

## Not covered by this workflow

**That a generated scaffold actually installs and builds.** The suite
checks what the generator *writes*, not that the result works. Verifying
that means scaffolding a project and running `npm install && npm run build
&& npm test` inside it — which cannot pass until `@voxgig/build` 4.11.0
and `@seneca/owner` 6.3.0 are published, since the scaffold pins them.

Worth adding as a job once they are released. It is the check that would
have caught the pins being wrong in the first place: `@voxgig/build` was
pinned to 4.10.0, a version that never existed on npm.

# Apply note: activate the build workflow

One patch, carrying one commit that moves `ci/ci.yml` into
`.github/workflows/` and corrects everything that described it as dormant.

```sh
git am < patch/0001-ci-activate-the-build-workflow.patch
```

Then delete this folder, in the same commit if you can. Once applied the
file only duplicates the history it just created, and a patch that has
drifted from `main` is worse than no patch. Check whether it has already
landed with:

```sh
git apply --check patch/0001-ci-activate-the-build-workflow.patch
```

## Why it arrives this way

An agent session cannot write `.github/workflows/`. The push is refused:

```
refusing to allow an OAuth App to create or update workflow
`.github/workflows/ci.yml` without `workflow` scope
```

Splitting the change so the pushable half lands alone would be worse than
waiting. That half deletes `ci/ci.yml` and updates `AGENTS.md`,
`STYLE-GUIDE.md` and `tools/check_prose.py` to say the workflow builds on
every push, while no workflow exists to do it.

This folder follows the same convention as `voxgig/struct`, which documents
it in that repository's `AGENTS.md`. Nothing here documents it yet; it is a
delivery vehicle, not repository content.

## What it does

Activates CI. `npm ci` → `npm run build` → `npm run test-cov`, on every
push and pull request, with coverage uploaded as an `lcov` artifact and
deliberately not gated. Before the move, `publish.yml` was the only thing
that ever compiled this package, so a broken commit was caught at release
time.

Verified before hand-off with the commands the job itself runs: `npm ci`
clean, `npm run build` clean, `npm run test-cov` exits 0 with 4 of 4 tests
passing at 98.39% line coverage, and `coverage.lcov` produced.

## What else it touches, and why

Seven statements across six files asserted the workflow was dormant, and
activating it makes every one of them false:

| File | The claim |
| --- | --- |
| `.github/workflows/ci.yml` | its own header, `DORMANT` |
| `.github/workflows/publish.yml` | called itself the only automated build and test, and named the old `ci/ci.yml` path |
| `ci/README.md` | framed entirely around activating it |
| `AGENTS.md` | "`ci/` holds the dormant build workflow" |
| `STYLE-GUIDE.md` | twice: the `ci/COVERAGE.md` row, and that `ci/README.md` "describes a workflow that does not run" |
| `tools/check_prose.py` | the comment explaining why `EXTRA_PAGES` is empty rested on `ci/README.md` documenting a dormant workflow |

`publish.yml` keeps its own build and test. That is not redundancy: nothing
there reads `ci.yml`'s result, so a dispatch releases the ref it is given
whether that commit's CI is green, red, or still queued.

## One thing left alone

`ci.yml` pins no actions. It uses floating major tags
(`actions/checkout@v4`, `actions/setup-node@v4`,
`actions/upload-artifact@v4`) where `docs.yml` and `publish.yml` pin every
action to a full-length commit SHA, at v7. That is what the file carried
while it was dormant and nothing ran it, rather than a decision. Changing
it under an activation commit would mix two concerns, so it is recorded in
`ci/README.md` as a follow-up instead.

# Apply note: pin every action so CI can start

CI is currently red on `main`. The workflow activated in 46e919d cannot
run at all, and this patch is the fix.

```sh
git am < patch/0001-ci-pin-every-action-so-the-workflow-can-start-at-all.patch
```

Then delete this folder, in the same commit if you can. Check whether it has
already landed with:

```sh
git apply --check patch/0001-ci-pin-every-action-so-the-workflow-can-start-at-all.patch
```

## What is broken

The first run of `.github/workflows/ci.yml` after activation failed in
seven seconds, having reached no step:

```
The actions actions/checkout@v4, actions/setup-node@v4, and
actions/upload-artifact@v4 are not allowed in voxgig/create-system
because all actions must be pinned to a full-length commit SHA.
```

This repository requires SHA pinning and GitHub enforces it when the
workflow loads. The floating tags `ci.yml` carried while it was dormant
were therefore not the cosmetic difference from `docs.yml` and
`publish.yml` that the activation commit called them — they were the reason
the workflow could not start.

Partial pinning would not have helped: the policy rejects the workflow if
any action in it is unpinned, so all three had to be resolved.

## What the patch changes

| Action | Pin | Where the SHA comes from |
| --- | --- | --- |
| `actions/checkout` | `3d3c42e5…` (v7) | the pin `docs.yml` and `publish.yml` already run |
| `actions/setup-node` | `820762786…` (v7) | the same |
| `actions/upload-artifact` | `ea165f8d…` (v4) | the commit the action's own `v4` tag names |

checkout and setup-node reuse this repository's existing trusted pins,
which also moves both off the v4 majors the dormant file named.
`upload-artifact` has no precedent here, so it is pinned to the version the
file already declared rather than upgraded.

`ci/README.md` replaces its "actions are not pinned here" note with why
they must be, quoting the failure, so whoever adds an action next knows a
SHA is required before it will run.

## Why it arrives as a patch

An agent session cannot write `.github/workflows/`:

```
refusing to allow an OAuth App to create or update workflow
`.github/workflows/ci.yml` without `workflow` scope
```

Splitting it is not useful either. The `ci/README.md` half is pushable, but
alone it would describe pinning that had not happened while CI stayed red.

## Note on what verification could and could not show

The activation was verified locally with the commands the job runs — `npm
ci`, `npm run build`, `npm run test-cov`, 4 of 4 tests passing at 98.39%
line coverage — and all of that was accurate. None of it could surface this
failure, because the pinning policy is applied before any step executes.
A workflow's npm steps passing locally says nothing about whether GitHub
will let the workflow start.

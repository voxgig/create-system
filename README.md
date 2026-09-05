# @voxgig/create-system

Create an empty Voxgig system project:

```bash
npm create @voxgig/system my-app
```

(npm resolves `npm create @voxgig/system` to this package,
`@voxgig/create-system`.)

The generated project is a [Seneca](https://senecajs.org) microservices
backend with a model-driven entity layer (`@voxgig/model` +
`@voxgig/system`), user accounts via the Seneca `user` plugin, a default
design theme (light + dark), and jostraca-generated deployment templates
(`@voxgig/build`). Activating the `web` environment
(`voxgig-system add env web`) generates a complete model-driven
enterprise web app on top. The scaffold itself is generated with
[jostraca](https://github.com/jostraca/jostraca) components — see
`src/part/*` for the template parts.

The project starts **empty**: the full structure is in place (model,
environments, generation actions, tests), but there are no entities,
services, or messages — only commented examples.

## Documentation

Four pages, one of each kind:

- [Create and grow a project](docs/tutorial.md). The tutorial, from
  nothing to a running model-driven web app.
- [Develop the scaffold](docs/how-to/develop-the-scaffold.md). A how-to
  for contributors changing what this package generates.
- [Generated project structure](docs/reference/generated-structure.md).
  The reference for what `npm create @voxgig/system` produces.
- [Scaffold design](docs/explanation/scaffold-design.md). The explanation
  of why the scaffold is shaped this way.

The generated project ships its own `docs/` and its own agent guide,
covering the project rather than this scaffolder.

Contributing to the scaffold itself is a short loop: rebuild (`npm run
build`) before testing, because the tests run the compiled `dist/`, and
verify a change by scaffolding a fresh project in a scratch directory.
The documentation follows [the style guide](STYLE-GUIDE.md).

## After creation

```bash
cd my-app/backend
npm install
npm run build   # compile model + generate + tsc
npm test        # starter tests (green out of the box)
npm run local   # boot the empty backend
```

## License

MIT. Copyright (c) Voxgig Ltd.

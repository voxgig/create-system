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

Organised by the [Diátaxis](https://diataxis.fr) framework:

- **Tutorial**: [Create and grow a project](docs/tutorial.md)
- **How-to**: [Develop the scaffold](docs/how-to/develop-the-scaffold.md)
- **Reference**: [Generated project structure](docs/reference/generated-structure.md)
- **Explanation**: [Scaffold design](docs/explanation/scaffold-design.md)

Working on this repo with an AI agent? See [AGENTS.md](AGENTS.md).

The generated project ships its own Diátaxis `docs/` and `AGENTS.md`,
covering the project (not this scaffolder).

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

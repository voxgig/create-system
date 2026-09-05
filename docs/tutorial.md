# Tutorial: create and grow a project

*A tutorial — from nothing to a running model-driven web app.*

## 1. Create

```bash
npm create @voxgig/system my-app
cd my-app/backend
npm install
npm test          # starter tests, green out of the box
npm run local     # boot the (empty) backend
```

## 2. Uncomment the example

The scaffold ships a complete worked example, disabled by comments. In
generated files, `##` (jsonic) and `////` (TS) are prose; a single `#` /
`//` is **disabled example code**. Uncomment one comment level of the
`thing` example in `model/ent.aontu`, `model/srv.aontu`, `model/msg.aontu`
and `src/srv/` — then:

```bash
npm run build
npm test
```

The example entity/service/messages compile, generate a Lambda handler,
and answer messages.

## 3. Add your own model

```bash
npx voxgig-system add entity shop/product
npx voxgig-system add field shop/product title 'price:Number'
npm run model-build
```

## 4. Generate the web app

```bash
npx voxgig-system add env web
npm run model-build
npm run build
npm run web
```

You now have the full enterprise SPA (public site, login, app shell,
generic CRUD for your entities, settings, light/dark theme). It is
model-driven at runtime: add another entity, `model-build`, reload.

From here, the *generated project's own* `docs/` folder takes over — it
documents the app you now own, including customisation hooks, custom
entity views, and theming.

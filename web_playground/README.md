# Valdi Widgets web playground

Demos of the Valdi Widgets components running in a browser through the Valdi web renderer. The build uses the
open-source web tooling that ships with Valdi:

- `valdi_web_package` (`@valdi//bzl/valdi:valdi_web_package.bzl`) compiles the demos and every module they import
  into one npm package, `valdi_widgets_web_npm`.
- `valdi_web_playground` (`@valdi//tools/valdi_web_devtools:valdi_web_playground.bzl`) bundles that package with
  webpack and adds dev-server, analysis and test targets.
- `valdi-web-devtools` provides the webpack config (`createWebpackConfig`, `createHmrConfig`), the runtime setup and
  the Puppeteer test helpers.

The demo components live in [`valdi_modules/widgets_demos`](../valdi_modules/widgets_demos). They are ordinary Valdi
components, compiled by the Valdi compiler. `DemoRegistry.ts` lists them; the page shell in `playground/main.ts` lists
the registry in a sidebar and mounts the selected demo at `#/<id>`.

## Commands

| Command | What it does |
|---|---|
| `bazel run //web_playground:dev` | webpack-dev-server in development mode, with source maps and HMR for `playground/` files. Open http://localhost:3030. |
| `bazel build //web_playground:playground_bundle_debug` | Development-mode bundle (not minified, full source maps) in `bazel-bin/web_playground/dist_debug/`. |
| `bazel run //web_playground:serve_debug` | Serves the debug bundle at http://localhost:3030. |
| `bazel build //web_playground:playground_bundle` | Production bundle in `bazel-bin/web_playground/dist/`. |
| `bazel run //web_playground:serve` | Serves the production bundle at http://localhost:3030. |
| `bazel test //web_playground:integration_test` | Opens every demo in headless Chrome and checks that it renders without errors. |
| `bazel run //web_playground:analyze` | Bundle treemap (webpack-bundle-analyzer). |
| `bazel build //web_playground:stats` | `stats.json` for the production bundle. |

`serve`, `serve_debug` and `dev` read the port from `PORT`, for example `PORT=8080 bazel run //web_playground:dev`.

`:dev` symlinks the Bazel-managed `node_modules` into `web_playground/` so webpack can watch the workspace files.
Edits under `playground/` reload in the browser. Edits to `valdi_modules/` (widgets or demos) need the Valdi compiler,
so restart `:dev` (or rebuild a bundle) to pick them up.

## Adding a demo

1. Add a component under `valdi_modules/widgets_demos/src/demos/`, wrapping its content in `DemoPage`.
2. Add an entry to `WIDGET_DEMOS` in `valdi_modules/widgets_demos/src/DemoRegistry.ts`.
3. Add the text the demo is expected to render to `EXPECTED_TEXT` in `tests/widgets.integration.test.js`.

## npm dependencies

`package.json` holds the peer dependencies of `valdi-web-devtools` (webpack, ts-loader, Puppeteer, …) and
`pnpm-lock.yaml` pins them for the `@valdi_widgets_npm` repository declared in `MODULE.bazel`. After changing
`package.json`, regenerate the lockfile with pnpm 9 against the public registry:

```bash
cd web_playground
npx pnpm@9 install --lockfile-only --ignore-scripts --registry=https://registry.npmjs.org/
```

## Known issues

- `bazel build //web_playground/...` fails with an action conflict on `playground/index.html`. The
  `valdi_web_playground` macro gives the raw `index.html` to both `:serve` and `:integration_test`, and the test's
  `requires-network` tag gives its copy action a different key. Build or test targets by name until the macro is fixed.
- Text inputs render in a serif font: the web renderer sets the input's `font-family` to the Valdi font name
  (`system`, `system-bold`) without the `sans-serif` fallback that labels get.
- Polyglot custom views (pickers, `EmojiLabel`) are centered and take the web renderer's default minimum height.

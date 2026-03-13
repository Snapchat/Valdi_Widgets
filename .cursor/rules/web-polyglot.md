# Web Polyglot Entry Rules

**Applies to**: `**/web/**/*.ts` files in Valdi modules (web polyglot implementations).

## Overview

Web polyglot entry files export view factories that are auto-registered with the `WebViewClassRegistry` at bundle time. Any file in `web_deps` that exports a `webPolyglotViews` record is automatically discovered by `RegisterNativeModules.js` — no extra BUILD configuration or manual module loader interaction is needed.

## Export Convention

Export a `webPolyglotViews` record mapping class names to factory functions:

```typescript
export const webPolyglotViews: Record<string, (container: HTMLElement) => void> = {
  MyCustomViewClass: createMyViewFactory(),
};
```

Each key must match the `webClass` attribute used in `<custom-view webClass="MyCustomViewClass">`.

## Factory Function Pattern

A factory receives an `HTMLElement` container and populates it with DOM content:

```typescript
function createMyViewFactory(): (container: HTMLElement) => void {
  return (container: HTMLElement) => {
    // Build DOM content inside container
    const element = document.createElement('div');
    container.appendChild(element);
  };
}
```

## BUILD.bazel Wiring

The `web/` directory is compiled by `ts_project` (not the Valdi compiler) and wired in via `web_deps`:

```python
ts_project(
    name = "my_module_web",
    srcs = glob(["web/**/*.ts", "web/**/*.d.ts"]),
    tsconfig = "web/tsconfig.json",
)

valdi_module(
    name = "my_module",
    web_deps = [":my_module_web"],
    ...
)
```

That's it — any file in the `ts_project` that exports `webPolyglotViews` will be auto-registered.

## Key Constraints

- Web entry files are standard TypeScript compiled by `tsc`, not the Valdi compiler
- Do NOT use Valdi imports (`valdi_core/`, `valdi_tsx/`) in `web/` files — they run in the browser, not the Valdi runtime
- Do NOT manually call `globalThis.moduleLoader.resolveRequire()` — the build system handles registration
- The `tsconfig.json` in `web/` should target `DOM` + `ES2020` with `module: "commonjs"`

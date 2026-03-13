# Web Polyglot Entry Rules

**Applies to**: `**/web/**/*.js` files in Valdi modules (web polyglot implementations).

## Overview

Web polyglot entry files export view factories that are auto-registered with the `WebViewClassRegistry` at bundle time. Any file in `web_deps` that exports a `webPolyglotViews` object is automatically discovered by `RegisterNativeModules.js` — no extra BUILD configuration or manual module loader interaction is needed.

## CRITICAL: Use plain `.js`, NOT TypeScript

**Do not use `ts_project` for `web_deps`.** The Valdi compiler's exec-platform build hits a TS5055 error ("Cannot write file … because it would overwrite input file") when `ts_project` is used in `web_deps`. Write web polyglot files as plain JavaScript (`.js`).

## Export Convention

Export a `webPolyglotViews` object mapping class names to factory functions:

```javascript
exports.webPolyglotViews = {
  MyCustomViewClass: function(container) {
    // Build DOM content inside container
    const el = document.createElement('div');
    container.appendChild(el);
  },
};
```

Each key must match the `webClass` attribute used in `<custom-view webClass="MyCustomViewClass">`.

## BUILD.bazel Wiring

Use a plain `filegroup` — **not** `ts_project`:

```python
# CORRECT — plain JS filegroup
filegroup(
    name = "my_module_web",
    srcs = ["web/src/MyModuleWeb.js"],
    visibility = ["//visibility:public"],
)

valdi_module(
    name = "my_module",
    web_deps = [":my_module_web"],
    ...
)
```

```python
# WRONG — ts_project causes TS5055 on exec-platform
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
ts_project(name = "my_module_web", ...)  # ❌
```

## Key Constraints

- Write web entry files as **plain JavaScript** (CommonJS `exports.webPolyglotViews = {...}`)
- Do NOT use Valdi imports (`valdi_core/`, `valdi_tsx/`) in web files — they run in the browser, not the Valdi runtime
- Do NOT self-register by calling `registerWebPolyglotViewClassOrThrow` — registration is handled by the generated `RegisterNativeModules.js`
- Web factories are currently **mount-time only** — attribute updates after mount are not dispatched to web factories (Valdi framework limitation; tracked in plans)

## Example

See `valdi_modules/widgets/web/src/WidgetsWeb.js` for a working implementation.

# Bazel Build System Rules

**Applies to**: `BUILD.bazel`, `*.bzl` files, `WORKSPACE`

## Key Commands

```bash
# Build macOS app
bazel build //valdi_modules/playground:app_macos

# Run tests
bazel test //valdi_modules/widgets:test //valdi_modules/navigation:test //valdi_modules/valdi_standalone_ui:test

# Build specific module
bazel build //valdi_modules/widgets:widgets

# Build for web
bazel build --config=web //valdi_modules/playground:playground_export_npm
```

## Valdi Dependency

- Valdi is loaded via `git_repository` in WORKSPACE pointing at the bleeding edge of `github.com/Snapchat/Valdi` (update the `commit` SHA to pick up new changes).
- For local development: use `local_repository(name = "valdi", path = "/path/to/Valdi")` in WORKSPACE.
- Valdi build rules live in `@valdi//bzl/valdi/`.

## Valdi Module

```python
load("@valdi//bzl/valdi:valdi_module.bzl", "valdi_module")

valdi_module(
    name = "my_module",
    srcs = glob(["src/**/*.ts", "src/**/*.tsx"]) + ["tsconfig.json"],
    deps = [
        "@valdi//src/valdi_modules/src/valdi/valdi_core",
        "@valdi//src/valdi_modules/src/valdi/valdi_tsx",
    ],
    visibility = ["//visibility:public"],
)
```

## Per-Component Filegroups (widgets pattern)

All component filegroups must live in the **same BUILD.bazel package** as the `valdi_module` — never in sub-packages. The Valdi compiler treats Bazel packages as module boundaries, so sub-packages break cross-component imports.

```python
filegroup(
    name = "button",
    srcs = glob(["src/components/button/**/*.ts", "src/components/button/**/*.tsx"]),
    visibility = ["//visibility:public"],
)

valdi_module(
    name = "my_module",
    srcs = [":button", ":pickers", ...] + glob(["src/*.ts"]) + ["tsconfig.json"],
    ...
)
```

## Polyglot Module (Native + Web)

```python
load("@valdi//bzl/valdi:valdi_module.bzl", "valdi_module")
load("@valdi//bzl/valdi:valdi_android_library.bzl", "valdi_android_library")

# Android: attribute binders, annotated with @RegisterAttributesBinder
valdi_android_library(
    name = "my_module_android",
    srcs = glob(["android/*.kt"]),  # flat android/ dir, no deep nesting
    deps = ["@valdi//valdi:valdi_java"],
)

# iOS: native view implementations
objc_library(
    name = "my_module_ios",
    srcs = glob(["ios/**/*.m"]),
    hdrs = glob(["ios/**/*.h"]),
    sdk_frameworks = ["UIKit"],
    deps = ["@valdi//valdi:valdi_ios"],
)

# Web: plain JS filegroup (NOT ts_project — ts_project causes TS5055 on exec-platform)
# File must export `webPolyglotViews` for auto-registration.
filegroup(
    name = "my_module_web",
    srcs = ["web/src/MyModuleWeb.js"],
)

valdi_module(
    name = "my_module",
    srcs = glob(["src/**/*.ts", "src/**/*.tsx"]) + ["tsconfig.json"],
    android_deps = [":my_module_android"],
    ios_deps = [":my_module_ios"],
    web_deps = [":my_module_web"],
    deps = [...],
)
```

See `valdi_modules/widgets/` for a full working example. See `.cursor/rules/polyglot-module.md` and `.cursor/rules/web-polyglot.md` for details.

## Conventions

- `BUILD.bazel` not `BUILD`
- `.bzl` for Starlark macros
- Use `@valdi//...` for all Valdi module deps
- Be explicit about dependencies; don't rely on transitive deps implicitly
- Use `visibility = ["//visibility:public"]` for modules consumed by others

## Configuration

- `.bazelrc` – Build flags and configurations
- `WORKSPACE` – External repository setup

## More Information

- Bazel docs: https://bazel.build
- Valdi: https://github.com/Snapchat/Valdi

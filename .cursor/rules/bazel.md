# Bazel Build System Rules

**Applies to**: `BUILD.bazel`, `*.bzl` files, `WORKSPACE`

## Overview

Valdi Widgets uses Bazel as its build system, with Valdi as an external dependency (`@valdi//...`).

## Key Commands

```bash
# Build macOS app
bazel build //valdi_modules/playground:app_macos

# Run tests
bazel test //valdi_modules/widgets:test //valdi_modules/navigation:test //valdi_modules/valdi_standalone_ui:test

# Build specific module
bazel build //valdi_modules/widgets:widgets
```

## Valdi Dependency

- Valdi is loaded via `http_archive` in WORKSPACE (release tag, e.g. `beta-0.0.2`).
- Valdi build rules live in `@valdi//bzl/valdi/`.
- Custom rules: `valdi_module`, `valdi_application` (from Valdi).

## Conventions

### File Naming

- `BUILD.bazel` not `BUILD` (explicit extension)
- `.bzl` for Starlark macros and rules

### Targets

- Use descriptive target names
- One main target per BUILD file usually matches directory name

### Dependencies

- Be explicit about dependencies
- Use `@valdi//...` for Valdi module deps (e.g. `@valdi//src/valdi_modules/src/valdi/valdi_core`)
- Use visibility to control access

## Configuration

- `.bazelrc` – Build flags and configurations
- `WORKSPACE` – Workspace and repository configuration

## More Information

- Bazel docs: https://bazel.build
- Valdi: https://github.com/Snapchat/Valdi

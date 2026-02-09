# Valdi Widgets

UI widgets, styles, and patterns for apps built with [Valdi](https://github.com/Snapchat/Valdi). This repo depends on Valdi via Bazel and provides reusable components (buttons, cells, navigation, sheets, inputs, etc.) and a playground app.

## Repo structure

| Path | Description |
|------|-------------|
| `valdi_modules/widgets/` | Widget components (buttons, cells, inputs, pickers, scroll, tabs, etc.) |
| `valdi_modules/navigation/` | Navigation APIs and page components |
| `valdi_modules/navigation_internal/` | Internal navigation support |
| `valdi_modules/valdi_standalone_ui/` | Standalone UI (modals, split view, etc.) |
| `valdi_modules/playground/` | Example app (playground) |
| `scripts/` | Helper scripts to build and run the playground |
| `.cursor/rules/` | Cursor/IDE rules for Valdi (TypeScript, Bazel, testing) |
| `docs/` | Additional documentation |

The Valdi framework (compiler, runtimes) is pulled in as an external dependency in `WORKSPACE` (e.g. `beta-0.0.2`).

## Using Valdi Widgets in your Valdi app

Add to your project’s `WORKSPACE`:

```python
http_archive(
    name = "valdi_widgets",
    strip_prefix = "Valdi_Widgets-<TAG>",  # e.g. Valdi_Widgets-beta-0.0.1
    url = "https://github.com/Snapchat/Valdi_Widgets/archive/refs/tags/<TAG>.tar.gz",
)
```

In your module’s `BUILD.bazel`, add to `valdi_module` `deps`:

```python
"@valdi_widgets//valdi_modules/widgets",
# and optionally:
# "@valdi_widgets//valdi_modules/navigation",
# "@valdi_widgets//valdi_modules/valdi_standalone_ui",
```

Import in TypeScript:

```typescript
import { CoreButton } from 'widgets/src/components/button/CoreButton';
```

## Development

### Requirements

- [Bazel](https://bazel.build/) (or Bazelisk); see `.bazelversion`
- Valdi is fetched automatically via `WORKSPACE` (`http_archive`)

### Run tests

All tests (Bazel):

```bash
bazel test //valdi_modules/widgets:test //valdi_modules/navigation:test //valdi_modules/valdi_standalone_ui:test //valdi_modules/navigation_internal:test //valdi_modules/playground:test
```

### Run the playground

- **macOS:** `./scripts/bazel_macos_run.sh` — builds and runs the macOS app
- **iOS Simulator:** `./scripts/bazel_ios_install.sh` — builds and installs the iOS app on the booted simulator
- **Android:** `./scripts/bazel_android_install.sh` — builds the APK and installs via adb
- **Hot reload:** `./scripts/bazel_hotreload.sh` — builds and runs the hot-reload runner

### CI

Tests run on GitHub Actions (`.github/workflows/test.yml`) on:

- Pull requests and pushes to `main`
- Publishing a release or pre-release

## Documentation

- **[AGENTS.md](AGENTS.md)** — Guide for AI assistants (Valdi patterns, anti-React, build/test)
- **[.cursor/rules/](.cursor/rules/README.md)** — Cursor rules (TypeScript/TSX, Bazel, testing)
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — How to contribute
- **Valdi framework** — [Valdi](https://github.com/Snapchat/Valdi), [Valdi docs](https://github.com/Snapchat/Valdi/tree/main/docs)

## License

See [LICENSE.md](LICENSE.md). Code of conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

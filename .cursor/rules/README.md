# Cursor Rules for Valdi Widgets

Context-specific rules for AI assistants in this repo. Valdi Widgets is TypeScript/TSX + Bazel; it depends on [Valdi](https://github.com/Snapchat/Valdi) via `WORKSPACE`.

## How Cursor Rules Work

Rules load based on what you're editing:

- `valdi_modules/**/*.ts`, `valdi_modules/**/*.tsx` → **typescript-tsx.md**
- `**/BUILD.bazel`, `**/*.bzl`, `WORKSPACE` → **bazel.md**
- `**/test/**/*.ts`, `**/*Test.ts` → **testing.md**
- `**/*.tsx` using `<custom-view>` → **custom-view.md**
- `**/android/`, `**/ios/`, `**/web/` platform dirs → **polyglot-module.md**
- `**/web/**/*.ts` in modules → **web-polyglot.md**

## Rules

| File | Applies To | Description |
|------|-----------|-------------|
| `typescript-tsx.md` | `valdi_modules/**/*.ts`, `**/*.tsx` | Valdi component patterns, anti-React warnings, styling, events |
| `bazel.md` | `**/BUILD.bazel`, `**/*.bzl`, `WORKSPACE` | Bazel conventions, valdi_module, polyglot targets |
| `testing.md` | `**/test/**/*.ts`, `**/*Test.ts` | Testing (Jasmine), `*Test.ts` naming |
| `polyglot-module.md` | `**/BUILD.bazel`, `android/`, `ios/`, `web/` dirs | Polyglot module structure, native deps, BUILD patterns |
| `custom-view.md` | `**/*.tsx` using `<custom-view>` | `<custom-view>` element, class attributes, platform resolution |
| `web-polyglot.md` | `**/web/**/*.ts` in modules | Web polyglot entry, `webPolyglotViews` export |

## More

- Valdi: https://github.com/Snapchat/Valdi
- Repo README: `/README.md`
- AGENTS.md: `/AGENTS.md`

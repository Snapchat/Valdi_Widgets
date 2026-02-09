# Cursor Rules for Valdi Widgets

Context-specific rules for AI assistants in this repo. Valdi Widgets is TypeScript/TSX + Bazel; it depends on [Valdi](https://github.com/Snapchat/Valdi) via `WORKSPACE`.

## How Cursor Rules Work

Rules load based on what you're editing:

- `valdi_modules/**/*.ts`, `valdi_modules/**/*.tsx` → **typescript-tsx.md**
- `**/BUILD.bazel`, `**/*.bzl`, `WORKSPACE` → **bazel.md**
- `**/test/**/*.ts`, `**/*.spec.ts` → **testing.md**

## Rules

| File | Applies To | Description |
|------|-----------|-------------|
| `typescript-tsx.md` | `valdi_modules/**/*.ts`, `valdi_modules/**/*.tsx` | Valdi component patterns, anti-React warnings |
| `bazel.md` | `**/BUILD.bazel`, `**/*.bzl`, `WORKSPACE` | Bazel conventions |
| `testing.md` | `**/test/**/*.ts`, `**/*.spec.ts` | Testing (Jasmine) |

## More

- Valdi: https://github.com/Snapchat/Valdi
- Repo README: `/README.md`

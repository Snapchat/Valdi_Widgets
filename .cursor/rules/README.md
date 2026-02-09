# Cursor Rules for Valdi Widgets

This directory contains context-specific rules for AI coding assistants (like Cursor). Rules are copied from the [Valdi](https://github.com/Snapchat/Valdi) repository and apply to this repo (Valdi Widgets) and its dependency on Valdi.

## How Cursor Rules Work

Cursor automatically loads rules from this directory based on the files you're working on:

- Working in `valdi_modules/**/*.ts`, `valdi_modules/**/*.tsx` → `typescript-tsx.md` rules apply
- Working in `**/BUILD.bazel`, `*.bzl` → `bazel.md` rules apply
- Working in `**/test/**/*.ts`, `**/*.spec.ts` → `testing.md` rules apply

## Available Rules

| File | Applies To | Description |
|------|-----------|-------------|
| `typescript-tsx.md` | `valdi_modules/**/*.ts`, `valdi_modules/**/*.tsx` | Valdi component patterns, anti-React hallucination warnings |
| `bazel.md` | `**/BUILD.bazel`, `**/*.bzl`, `WORKSPACE` | Bazel build system conventions |
| `testing.md` | `**/test/**/*.ts`, `**/*.spec.ts` | Testing framework and patterns |
| `android.md` | Android runtime (in Valdi dependency) | Kotlin/Java Android runtime patterns |
| `ios.md` | iOS runtime (in Valdi dependency) | Objective-C/C++ iOS runtime patterns |
| `cpp-runtime.md` | C++ runtime (in Valdi dependency) | C++ runtime and layout engine conventions |
| `compiler.md` | Compiler (in Valdi dependency) | Swift compiler implementation guidelines |

## Valdi Widgets vs Valdi

Valdi Widgets is a separate repo that depends on Valdi via `WORKSPACE` (`http_archive`). The rules for `android`, `ios`, `cpp-runtime`, and `compiler` describe the upstream Valdi codebase; they are included for reference when working with BUILD files or understanding the ecosystem.

## More Information

- Valdi framework: https://github.com/Snapchat/Valdi
- Valdi Widgets README: `/README.md`

# Valdi Compiler Rules

**Applies to**: Swift compiler in Valdi (in Valdi dependency: `/compiler/compiler/`)

## Overview

The Valdi compiler (in the Valdi repo) transforms TypeScript/TSX into `.valdimodule` files. Valdi Widgets does not contain compiler code; this rule is for context when working with build or module output.

## Key Concepts

1. **Compiler (Swift)** – Produces `.valdimodule` from TS/TSX
2. **Companion (TypeScript/Node)** – TypeScript compilation, type checking, debugging

## Building (in Valdi repo)

```bash
cd compiler/compiler
./scripts/update_compiler.sh ../../bin/compiler
```

## More Information

- Valdi: https://github.com/Snapchat/Valdi
- Compiler in Valdi: `/compiler/compiler/`

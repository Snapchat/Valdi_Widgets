# Android Runtime Rules

**Applies to**: Kotlin/Java files in Android runtime (in Valdi dependency: `@valdi//valdi/...`)

## Overview

The Valdi Android runtime bridges TypeScript/Valdi components to native Android views. It lives in the Valdi repo; Valdi Widgets consumes it via `@valdi//...` when building Android targets.

## Key Concepts

- Valdi components map to Android Views
- JNI bridge to C++ runtime
- Use Kotlin conventions; 4-space indentation

## Building / Testing (Valdi)

```bash
# In Valdi repo
bazel test //valdi:test_java
bazel build //valdi:valdi_android
```

## More Information

- Valdi: https://github.com/Snapchat/Valdi
- Framework docs in Valdi: `AGENTS.md`

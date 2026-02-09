# iOS Runtime Rules

**Applies to**: Objective-C/C++ files in iOS runtime (in Valdi dependency: `@valdi//valdi/...`)

## Overview

The Valdi iOS runtime bridges TypeScript/Valdi components to native UIKit views. It lives in the Valdi repo; Valdi Widgets consumes it via `@valdi//...` when building iOS targets.

## Key Concepts

- Valdi components map to UIViews
- Objective-C++ bridge to C++ runtime
- Use Apple Objective-C conventions; 4-space indentation

## Building / Testing (Valdi)

```bash
# In Valdi repo
bazel test //valdi:valdi_ios_objc_test //valdi:valdi_ios_swift_test
bazel build //valdi:valdi_ios
```

## More Information

- Valdi: https://github.com/Snapchat/Valdi
- Framework docs in Valdi: `AGENTS.md`

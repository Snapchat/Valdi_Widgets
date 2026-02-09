# C++ Runtime Rules

**Applies to**: C++ files in Valdi runtime (in Valdi dependency: `@valdi//valdi/`, `@valdi//valdi_core/`, etc.)

## Overview

Valdi's runtime and layout engine are implemented in C++ in the Valdi repo. Valdi Widgets does not contain C++ runtime code; this rule is for context when editing BUILD files or understanding the dependency.

## Key Concepts

- Layout uses Yoga (Flexbox)
- Cross-platform: iOS, Android, macOS
- Performance-critical; avoid unnecessary allocations in hot paths

## More Information

- Valdi: https://github.com/Snapchat/Valdi
- Runtime in Valdi: `/valdi/`, `/valdi_core/`

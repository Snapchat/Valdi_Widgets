# Copilot Instructions

## valdi-tsx

# Valdi TypeScript/TSX Component Rules

**Applies to**: TypeScript and TSX files in `/src/valdi_modules/`, `/apps/`, `/modules/`, `/npm_modules/`

## 🚨 CRITICAL: Valdi is NOT React!

**AI assistants frequently suggest React patterns that DON'T EXIST in Valdi.** Despite using TSX/JSX syntax, Valdi compiles to native code.

### Most Common Mistakes

```typescript
// ❌ NEVER use React hooks (don't exist!)
const [count, setCount] = useState(0);  // ❌
useEffect(() => { ... }, []);           // ❌

// ❌ NEVER use functional components (don't exist!)
const MyComponent = () => <view />;     // ❌

// ❌ Common hallucinations
this.props.title;           // Should be: this.viewModel.title
this.markNeedsRender();     // Doesn't exist! Use setState()
onMount() { }               // Should be: onCreate()
return <view />;            // onRender() returns void!
```

> **📖 Full list**: See `/AGENTS.md` → "AI Anti-Hallucination" section for comprehensive examples

### ✅ Correct Valdi Patterns

```typescript
import { StatefulComponent } from 'valdi_core/src/Component';

class MyComponent extends StatefulComponent<ViewModel, State> {
  state = { count: 0 };
  
  onCreate() { }                           // Component created
  onViewModelUpdate(prev: ViewModel) { }   // Props changed
  onDestroy() { }                          // Before removal
  
  handleClick = () => {
    this.setState({ count: this.state.count + 1 });  // Auto re-renders
  };
  
  onRender() {  // Returns void, not JSX!
    <button title={`Count: ${this.state.count}`} onPress={this.handleClick} />;
  }
}
```

## Quick Reference

| What | React | Valdi |
|------|-------|-------|
| **Component** | Function or class | Class only (Component or StatefulComponent) |
| **State** | `useState(0)` | `state = { count: 0 }` + `setState()` |
| **Props** | `this.props.title` | `this.viewModel.title` |
| **Mount** | `useEffect(() => {}, [])` | `onCreate()` |
| **Update** | `useEffect(() => {}, [dep])` | `onViewModelUpdate(prev)` |
| **Unmount** | `useEffect(() => () => {}, [])` | `onDestroy()` |
| **Re-render** | `setCount(...)` | `this.setState(...)` |
| **Return** | `return <view />` | `<view />;` (statement) |

## Provider Pattern (Dependency Injection)

```typescript
// ✅ CORRECT - Create provider
import { createProviderComponentWithKeyName } from 'valdi_core/src/provider/createProvider';
const MyServiceProvider = createProviderComponentWithKeyName<MyService>('MyServiceProvider');

// ✅ CORRECT - Provide value
<MyServiceProvider value={myService}>
  <App />
</MyServiceProvider>

// ✅ CORRECT - Consume with HOC
import { withProviders, ProvidersValuesViewModel } from 'valdi_core/src/provider/withProviders';

interface MyViewModel extends ProvidersValuesViewModel<[MyService]> {}

class MyComponent extends Component<MyViewModel> {
  onRender() {
    const [service] = this.viewModel.providersValues;
  }
}

const MyComponentWithProvider = withProviders(MyServiceProvider)(MyComponent);
```

## Event Handling

```typescript
// ✅ CORRECT - Use onTap for interactive elements
<view onTap={this.handleClick}>
  <label value="Click me" />
</view>

<button title="Press me" onPress={this.handleAction} />

// ❌ WRONG - No global keyboard events
window.addEventListener('keydown', ...);  // Doesn't work!
document.addEventListener('click', ...);  // Doesn't work!

// ✅ CORRECT - For text input, use TextField callbacks
<textfield 
  value={this.state.text}
  onChange={this.handleTextChange}
  onEditEnd={this.handleSubmit}
/>
```

**Important**: Valdi doesn't support `addEventListener`, `keydown`, or other global DOM events. Use element-specific callbacks like `onTap`, `onPress`, `onChange`, etc.

## Timers and Scheduling

```typescript
// ✅ CORRECT - Use component's setTimeoutDisposable
class MyComponent extends StatefulComponent<ViewModel, State> {
  onCreate() {
    // Timer auto-cancels when component destroys
    this.setTimeoutDisposable(() => {
      console.log('Delayed action');
    }, 1000);
  }
  
  // ✅ CORRECT - Recurring task pattern (use recursive setTimeout)
  private scheduleLoop() {
    this.setTimeoutDisposable(() => {
      this.doSomething();
      this.scheduleLoop();  // Schedule next iteration
    }, 100);
  }
}

// ❌ WRONG - Don't use setInterval directly
setInterval(() => { ... }, 100);  // Won't auto-cleanup!

// ❌ WRONG - Don't use setTimeout directly
setTimeout(() => { ... }, 100);  // Won't auto-cleanup!
```

**Important**: Always use `this.setTimeoutDisposable()` in components. It automatically cleans up when the component is destroyed, preventing memory leaks.

## Styling

### Basic Style Usage

```typescript
import { Style } from 'valdi_core/src/Style';
import { View, Label } from 'valdi_tsx/src/NativeTemplateElements';
import { systemBoldFont } from 'valdi_core/src/SystemFont';

// ✅ CORRECT - Type-safe styles
const styles = {
  // Style<View> can only be used on <view> elements
  container: new Style<View>({
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  
  // Style<Label> can only be used on <label> elements
  // Label uses font (string) NOT fontSize. Format: 'FontName Size [scaling] [maxSize]'
  title: new Style<Label>({
    color: '#000',
    font: 'system 20',         // size via font string, NOT fontSize!
    // font: systemBoldFont(20),  // or use SystemFont helper
  }),
};

// Use in render
onRender() {
  <view style={styles.container}>
    <label style={styles.title} value="Hello" />
  </view>;
}
```

### Style Composition

```typescript
// ✅ CORRECT - Merge multiple styles
const combined = Style.merge(styles.base, styles.primary);

// ✅ CORRECT - Extend a style with overrides
const largeButton = styles.button.extend({
  width: 200,
  height: 60,
});

// ✅ CORRECT - Dynamic styling with extend
<view style={styles.container.extend({
  backgroundColor: isActive ? 'blue' : 'gray',
})} />

// ❌ WRONG - Can't merge incompatible types
Style.merge(styles.viewStyle, styles.labelStyle);  // Type error!
```

### Spacing: Padding & Margin

```typescript
// ✅ CORRECT - Valdi spacing syntax
new Style<View>({
  // Single value - all sides
  padding: 10,
  margin: 5,
  
  // String shorthand - vertical horizontal
  padding: '10 20',    // 10pt top/bottom, 20pt left/right
  margin: '5 10',
  
  // Individual sides
  paddingTop: 5,
  paddingRight: 10,
  paddingBottom: 5,
  paddingLeft: 10,
  
  // Percentages (relative to parent)
  padding: '5%',       // 5% of parent width/height
  marginLeft: '10%',   // 10% of parent width
})

// ❌ WRONG - These don't exist in Valdi
new Style<View>({
  gap: 10,                  // ❌ Use margin on children
  paddingHorizontal: 20,    // ❌ Use padding: '0 20'
  paddingVertical: 10,      // ❌ Use padding: '10 0'
  paddingInline: 15,        // ❌ Doesn't exist
})
```

### Layout: Flexbox (Yoga)

```typescript
// ✅ CORRECT - Valdi uses Yoga flexbox
new Style<View>({
  // Container properties
  flexDirection: 'row',          // 'row' | 'column' | 'row-reverse' | 'column-reverse'
  justifyContent: 'center',      // 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'
  alignItems: 'center',          // 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'
  alignContent: 'flex-start',    // For multi-line flex containers
  flexWrap: 'wrap',              // 'wrap' | 'nowrap' | 'wrap-reverse'
  
  // Child properties
  flexGrow: 1,                   // Grow to fill space (NOTE: use flexGrow, not flex)
  flexShrink: 1,                 // How much to shrink
  flexBasis: 100,                // Base size before flex
  alignSelf: 'center',           // Override parent's alignItems
})

// ❌ WRONG - These don't exist
new Style<View>({
  display: 'grid',               // ❌ Only 'flex' supported
  gridTemplateColumns: '1fr 1fr', // ❌ No CSS Grid
  flex: 1,                       // ❌ Use flexGrow: 1 instead!
})
```

### Position & Size

```typescript
// ✅ CORRECT - Positioning
new Style<View>({
  // Size
  width: 200,           // Points
  width: '50%',         // Percentage of parent
  width: 'auto',        // Auto-size
  height: 100,
  minWidth: 50,
  maxWidth: 500,
  aspectRatio: 16/9,    // Width:height ratio
  
  // Position
  position: 'relative', // 'relative' | 'absolute'
  top: 10,
  right: 10,
  bottom: 10,
  left: 10,
})
```

### Common Properties

```typescript
// ✅ CORRECT - Frequently used properties
new Style<View>({
  backgroundColor: '#fff',
  opacity: 0.8,
  
  // Borders
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#ccc',
  borderTopWidth: 2,
  
  // Shadow
  boxShadow: '0 2 4 rgba(0, 0, 0, 0.1)',
  
  // Overflow — only 'visible' | 'scroll' (NOT 'hidden'!)
  overflow: 'scroll',   // 'visible' | 'scroll'
})
```

### Type Safety

```typescript
// ✅ CORRECT - Style types match element types
const viewStyle = new Style<View>({ backgroundColor: 'red' });
const labelStyle = new Style<Label>({ color: 'blue' });

<view style={viewStyle} />      // ✅ Works
<label style={labelStyle} />    // ✅ Works

// ❌ WRONG - Type mismatch
<label style={viewStyle} />     // ❌ Type error!
<view style={labelStyle} />     // ❌ Type error!

// ✅ CORRECT - Layout styles work on any layout element
const layoutStyle = new Style<Layout>({ padding: 10 });
<view style={layoutStyle} />    // ✅ view extends Layout
<label style={layoutStyle} />   // ✅ label extends Layout
```

> **📖 Complete reference**: See `/docs/api/api-style-attributes.md` for all 1290+ style properties
> 
> **📖 Best practices**: See `/docs/docs/core-styling.md` for styling patterns and examples

## Common Mistakes to Avoid

1. **Returning JSX from onRender()** - It returns void, JSX is a statement
2. **Forgetting setState()** - Direct mutation won't trigger re-render
3. **Using this.props** - Should be this.viewModel
4. **Wrong lifecycle names** - onCreate/onViewModelUpdate/onDestroy (not mount/update/unmount)
5. **Suggesting scheduleRender()** - Deprecated, use StatefulComponent + setState()
6. **Using addEventListener** - Use element callbacks like onTap, onPress, onChange
7. **Using setInterval/setTimeout directly** - Use this.setTimeoutDisposable()
8. **Using CSS properties that don't exist** - No gap, paddingHorizontal, paddingVertical
9. **Using `flex: 1`** - `flex` doesn't exist on `View`; use `flexGrow: 1` instead
10. **Using `fontSize` on Label** - Labels use `font: 'system 20'` (string), not `fontSize`
11. **Using `overflow: 'hidden'`** - `View` only accepts `'visible' | 'scroll'`; remove overflow or use 'scroll'

## Platform Detection

Use `Device` for platform-conditional rendering:

```typescript
import { Device } from 'valdi_core/src/Device';

class MyComponent extends Component<MyViewModel> {
  onRender(): void {
    <view>
      {Device.isIOS() && <IOSOnlyView />}
      {Device.isAndroid() && <AndroidOnlyView />}
      {Device.isMacOS() && <MacOSOnlyView />}
      {Device.isWeb() && <WebOnlyView />}
    </view>;
  }
}
```

Also use `Device.isIOS()` / `Device.isAndroid()` guards before using `<custom-view>` elements that don't have implementations on all platforms.

## Imports

```typescript
// ✅ CORRECT imports
import { Component, StatefulComponent } from 'valdi_core/src/Component';
import { Device } from 'valdi_core/src/Device';
import { systemFont } from 'valdi_core/src/SystemFont';
import { Style } from 'valdi_core/src/Style';

// ❌ WRONG - React imports don't exist
import React from 'react';  // Error!
import { useState } from 'react';  // Error!
```

## More Information

- **Full anti-hallucination guide**: `/AGENTS.md` (comprehensive React vs Valdi comparison)
- **AI tooling**: `/docs/docs/ai-tooling.md`
- **Provider pattern**: `/docs/docs/advanced-provider.md`
- **Valdi GitHub**: https://github.com/Snapchat/Valdi


## valdi-bazel

# Bazel Build System Rules

**Applies to**: `BUILD.bazel`, `*.bzl` files in `/bzl/`, `WORKSPACE`, `MODULE.bazel`

## Overview

Valdi uses Bazel as its build system. Bazel provides reproducible, incremental builds across all platforms.

## Key Commands

```bash
# Build everything
bazel build //...

# Build specific target
bazel build //apps/helloworld:helloworld

# Run tests
bazel test //...

# Clean (use sparingly - cache is valuable!)
bazel clean
```

## Important Notes

1. **Use `bazel`** for all build commands
2. **The CLI wraps Bazel** - `valdi` commands use bazel under the hood
3. **Cache is important** - Don't suggest `bazel clean` unless necessary

## Build Rules

### Valdi-Specific Rules

- `/bzl/valdi/` - Valdi build rules and macros
- Custom rules for compiling .tsx to .valdimodule
- Platform-specific build transitions

### Common Targets

```python
# Valdi application
valdi_application(
    name = "my_app",
    root_component_path = "App@my_app/src/MyApp",
    title = "My App",
    version = "1.0.0",
    deps = ["//apps/my_app/src/valdi/my_app"],
)

# Valdi module
valdi_module(
    name = "my_module",
    srcs = glob(["src/**/*.ts", "src/**/*.tsx"]),
    deps = [
        "//src/valdi_modules/src/valdi/valdi_core",
    ],
)
```

## Conventions

### File Naming

- `BUILD.bazel` not `BUILD` (explicit extension)
- `.bzl` for Starlark macros and rules

### Targets

- Use descriptive target names
- One main target per BUILD file usually matches directory name

### Dependencies

- Be explicit about dependencies
- Don't rely on transitive deps implicitly
- Use visibility to control access

## Platform Builds

```bash
# Build and install iOS app
valdi install ios

# Build and install Android app
valdi install android

# Or use bazel directly with configs
bazel build //apps/helloworld:hello_world --config=ios
bazel build //apps/helloworld:hello_world --config=android
```

## Configuration

- `.bazelrc` - Build flags and configurations
- `MODULE.bazel` - Bazel module dependencies
- `WORKSPACE` - Legacy workspace configuration (being migrated to MODULE.bazel)

## Common Issues

1. **Missing dependencies** - Add to `deps` in BUILD.bazel
2. **Cache issues** - Try `bazel clean --expunge` (last resort)
3. **Platform transitions** - Use correct config flags

## Testing

```bash
# Run all tests
bazel test //...

# Run specific test
bazel test //valdi/test:renderer_test

# Run with coverage
bazel coverage //...
```

## More Information

- Bazel docs: https://bazel.build
- Valdi build rules: `/bzl/valdi/README.md`
- Framework docs: `/AGENTS.md`


## valdi-testing

# Valdi Testing

## Component Tests (most common)

Use `valdiIt` from `valdi_test/test/JSXTestUtils` as the test wrapper. It provides a `driver` that renders components synchronously.

See **`valdi-component-tests`** skill for the full guide on:
- `elementKeyFind`, `elementTypeFind`, `componentTypeFind`, `componentGetElements`
- `tapNodeWithKey` for tap callbacks
- Discriminated union and array view model testing
- Lint rules (`jsx-no-lambda`, `explicit-function-return-type`, etc.)

## Running Tests

```bash
# Run a specific module's tests
bazel test //modules/my_module:tests

# Run with output on failure
bazel test //modules/my_module:tests --test_output=errors

# Run all tests in the repo
bazel test //...

# Filter to a specific test class
bazel test //modules/my_module:tests --test_filter=MyComponentTest
```

## Test File Location

Test files must mirror the source file hierarchy:

```
my_module/
├── src/
│   └── categories/
│       └── CollectionComponent.tsx
└── test/
    └── categories/
        └── CollectionComponentTest.spec.tsx
```

## BUILD.bazel for Tests

Add a `ts_project` or `valdi_module` test target. The test target lists test spec files in `srcs` and shares `deps` with the main module:

```python
load("//bzl/valdi:valdi_module.bzl", "valdi_module")

valdi_module(
    name = "my_module_tests",
    srcs = glob(["test/**/*.spec.tsx", "test/**/*.spec.ts"]),
    testonly = True,
    deps = [
        ":my_module",
        "//src/valdi_modules/src/valdi/valdi_test",
        "//src/valdi_modules/src/foundation/test/util",
        "//src/valdi_modules/src/valdi/valdi_tsx",
    ],
)
```

## Platform Tests

For C++, iOS, and Android platform layer tests, see the `valdi-cpp-runtime`, `valdi-ios`, and `valdi-android` skills respectively.


## valdi-ios

# iOS Runtime Rules

**Applies to**: Objective-C/C++ files in `/valdi/src/valdi/ios/` and related iOS runtime code

## Overview

The Valdi iOS runtime bridges TypeScript/Valdi components to native UIKit views. It's implemented in Objective-C, Objective-C++, and Swift.

## Code Style

- **4-space indentation** for Objective-C
- Follow Apple's Objective-C conventions
- Use modern Objective-C features (properties, blocks, etc.)

## Key Concepts

### View Rendering

- Valdi components map to UIViews
- View recycling for performance
- UIKit integration

### Platform Bridge

- Objective-C++ bridge to C++ runtime
- Memory management (ARC)
- iOS-specific APIs

## Common Patterns

### Bazel iOS Targets

```python
objc_library(
    name = "valdi_ios",
    srcs = glob(["**/*.m", "**/*.mm"]),
    hdrs = glob(["**/*.h"]),
)
```

### View Implementation

- Custom UIView subclasses
- CALayer for advanced rendering
- Metal for GPU acceleration

## Testing

```bash
# Run iOS runtime tests (Objective-C)
bazel test //valdi:valdi_ios_objc_test

# Run iOS runtime tests (Swift)
bazel test //valdi:valdi_ios_swift_test

# Run all iOS tests
bazel test //valdi:valdi_ios_objc_test //valdi:valdi_ios_swift_test
```

Test files are in `/valdi/test/ios/` and `/valdi/test/ios_swift/`

## Building

```bash
# Build iOS runtime library
bazel build //valdi:valdi_ios

# Test with hello world app
cd apps/helloworld
valdi install ios
```

## Platform-Specific Notes

1. **iOS Version** - Be mindful of minimum iOS version
2. **ARC** - Automatic Reference Counting (memory management)
3. **Auto Layout** - Valdi uses flexbox, not Auto Layout
4. **Metal** - GPU rendering for advanced graphics

## Important

- **Performance** - UIView creation and layout are critical
- **Memory** - Understand retain cycles and weak references
- **Threading** - Main thread for UI, background for heavy work
- **Lifecycle** - UIViewController lifecycle

## More Information

- Runtime source: `/valdi/src/valdi/ios/`
- Runtime tests: `/valdi/test/ios/` and `/valdi/test/ios_swift/`
- Core iOS code: `/valdi_core/src/valdi_core/ios/`
- Build config: `/valdi/BUILD.bazel`
- Framework docs: `/AGENTS.md`


## valdi-android

# Android Runtime Rules

**Applies to**: Kotlin/Java files in `/valdi/src/valdi/android/` and related Android runtime code

## Overview

The Valdi Android runtime bridges TypeScript/Valdi components to native Android views. It's implemented in Kotlin and C++ (via JNI).

## Code Style

- **4-space indentation** for Kotlin/Java
- Follow Kotlin coding conventions
- Use Kotlin features (data classes, extension functions, etc.)

## Key Concepts

### View Rendering

- Valdi components map to Android Views
- View recycling for performance
- Efficient view updates

### Platform Bridge

- JNI bridge to C++ runtime
- Kotlin/Java to native code communication
- Performance-critical paths

## Common Patterns

### Bazel Android Targets

```python
android_library(
    name = "valdi_android",
    srcs = glob(["**/*.kt", "**/*.java"]),
)
```

### View Binding

- Custom view implementations
- Attribute binding for Valdi properties
- Event handling

## Testing

```bash
# Run Android runtime tests
bazel test //valdi:test_java

# Run with coverage
bazel coverage //valdi:test_java
```

Test files are in `/valdi/test/java/`

## Building

```bash
# Build Android runtime library
bazel build //valdi:valdi_android

# Test with hello world app
valdi install android
cd apps/helloworld
valdi install android
```

## Platform-Specific Notes

1. **API Level** - Be mindful of minimum API level
2. **Android NDK** - C++ integration via NDK
3. **Permissions** - Handle runtime permissions appropriately
4. **Lifecycle** - Android Activity/Fragment lifecycle

## Important

- **Performance** - View creation and updates are critical
- **Memory** - Be careful with leaks (Activity context)
- **Threading** - UI thread vs background threads
- **Compatibility** - Support multiple Android versions

## More Information

- Runtime source: `/valdi/src/valdi/android/`
- Runtime tests: `/valdi/test/java/`
- Build config: `/valdi/BUILD.bazel`
- Framework docs: `/AGENTS.md`


## valdi-cpp-runtime

# C++ Runtime Rules

**Applies to**: C++ files in `/valdi/`, `/valdi_core/`, `/snap_drawing/`

## Overview

Valdi's runtime and layout engine are implemented in C++ for cross-platform performance. This code runs on iOS, Android, macOS, but not web.

**Note**: `/libs/` contains shared utility libraries (crypto, logging, image processing) used across the codebase, but not the core runtime itself.

## Code Style

- **4-space indentation**
- Follow existing C++ style in the codebase
- Use smart pointers appropriately
- Prefer const correctness

## Key Concepts

### Layout Engine

- Uses **Yoga** (Facebook's Flexbox implementation) for layout
- Cross-platform layout calculations
- Performance-critical code
- RTL (right-to-left) support built-in
- Yoga source: `/third-party/yoga/`

### Memory Management

- Be careful with memory ownership
- Use RAII patterns
- Consider platform-specific memory constraints (mobile)

### Platform Abstractions

- Code must work on iOS, Android, macOS
- Use platform-agnostic APIs where possible
- Platform-specific code goes in appropriate subdirectories

## Common Patterns

### Djinni Generated Code

- Some C++ code is generated from `.djinni` interface files
- **Don't modify generated code** - change the .djinni file instead
- Generated files typically in `generated-src/` directories

### Performance

- This is performance-critical code
- Profile before optimizing
- Consider cache locality
- Be mindful of allocations in hot paths

## Testing

```bash
# Run all C++ runtime tests
bazel test //valdi:test

# Run specific test suites
bazel test //valdi:test_runtime       # Runtime tests
bazel test //valdi:test_integration   # Integration tests
bazel test //valdi:test_snap_drawing  # Snap drawing tests
```

## Platform-Specific Notes

### iOS
- Objective-C++ bridge in `/valdi/src/valdi/ios/`
- Metal for GPU rendering
- UIKit view integration

### Android
- JNI bridge in `/valdi/src/valdi/android/`
- NDK integration
- Native view rendering

### macOS
- Platform-specific code in `/valdi/src/valdi/macos/`
- Desktop runtime support

### Build

```bash
# Build runtime for specific platform
bazel build //valdi:valdi_ios
bazel build //valdi:valdi_android
bazel build //valdi:valdi_macos
```

## Important

1. **Cross-platform first** - Code must work on all platforms
2. **Performance critical** - UI rendering and layout
3. **Memory efficiency** - Mobile devices have constraints
4. **Thread safety** - Consider concurrency

## More Information

- Runtime overview: `/valdi/README.md`
- Core bindings: `/valdi_core/README.md`
- Framework docs: `/AGENTS.md`


## valdi-compiler

# Valdi Compiler Rules

**Applies to**: Swift files in `/compiler/compiler/`

## Overview

The Valdi compiler consists of two parts:

1. **Compiler (Swift)**: Transforms TypeScript/TSX into `.valdimodule` files
2. **Companion (TypeScript/Node.js)**: Handles TypeScript compilation, type checking, and provides debugging support

## Key Conventions

### Code Style

- **4-space indentation** for Swift
- Follow Swift naming conventions (camelCase for methods, PascalCase for types)
- Use Swift type inference where appropriate
- Prefer `let` over `var` when possible

### Architecture

- Compiler is a multi-pass system
- AST transformation pipeline
- Type checking and validation
- Code generation for each platform

### Important Files

- `/compiler/compiler/` - Main Swift compiler implementation
- Output: `.valdimodule` files (binary format read by runtime)

## Common Patterns

### AST Traversal

```swift
// Follow existing visitor patterns
class MyASTVisitor: ASTVisitor {
    func visit(_ node: Node) -> Result {
        // Visit logic
    }
}
```

### Error Handling

```swift
// Use proper error types
enum CompilerError: Error {
    case invalidSyntax(String)
    case typeError(String)
}
```

## Testing

Tests are critical - add tests for new features and error cases. The `update_compiler.sh` script runs tests automatically.

## Build

### Using the update script (recommended):

```bash
cd compiler/compiler
./scripts/update_compiler.sh ../../bin/compiler
```

This script:
- Runs `swift test` automatically
- Builds the compiler for the correct architecture
- Copies the binary to `bin/compiler/macos/valdi_compiler` (or `linux/valdi_compiler`)
- Handles platform differences (macOS vs Linux)

### Alternative: Using Xcode

Open `compiler/compiler/Compiler/Package.swift` in Xcode, let it resolve dependencies, then build.

## Companion (TypeScript)

The companion is a TypeScript service that works alongside the Swift compiler. It handles TypeScript compilation, type checking, and provides debugging support.

### Build the companion:

```bash
cd compiler/companion
./scripts/update_companion.sh ../../bin/compiler_companion
```

This script:
- Runs `npm install`
- Runs `npm run test`
- Builds with `bazel build //compiler/companion:bundle`
- Copies output to `bin/compiler_companion`

**Note**: Once built, the companion is automatically invoked by the compiler during compilation. You don't need to run it manually - it's part of the compiler process.

## Important Notes

1. **Performance matters** - Compiler speed affects developer experience
2. **Error messages** - Make them helpful and actionable
3. **Backward compatibility** - Don't break existing .valdimodule files
4. **Cross-platform** - Consider iOS, Android, macOS targets

## More Information

- Compiler architecture: `/compiler/compiler/README.md`
- Framework docs: `/AGENTS.md`


## valdi-polyglot-module

# Polyglot Module Rules

**Applies to**: `**/BUILD.bazel` and source files in modules with platform-specific implementations (`android/`, `ios/`, `macos/`, `web/` directories).

## Module Structure

A polyglot module contains platform-native implementations alongside Valdi TSX source:

```
my_module/
  src/           # Valdi TSX components (compiled by Valdi compiler)
  android/       # Kotlin/Java native implementation
  ios/           # Objective-C native implementation
  macos/         # Objective-C native implementation (macOS desktop)
  web/           # TypeScript web implementation (compiled by ts_project, NOT Valdi compiler)
  strings/       # Localization
  module.yaml
  tsconfig.json
  BUILD.bazel
```

## BUILD.bazel Pattern

```python
ts_project(
    name = "my_module_web",
    srcs = glob(["web/**/*.ts", "web/**/*.d.ts"]),
    tsconfig = "web/tsconfig.json",
    visibility = ["//visibility:public"],
)

valdi_module(
    name = "my_module",
    srcs = glob(["src/**/*.ts", "src/**/*.tsx"]) + ["tsconfig.json"],
    android_deps = [":android_impl"],
    ios_deps = [":ios_impl"],
    macos_deps = [":macos_impl"],
    web_deps = [":my_module_web"],
    deps = [...],
)
```

- `web_deps`: makes `web/` outputs available to the web bundle. Any file in `web_deps` that exports `webPolyglotViews` is automatically registered with the `WebViewClassRegistry` at bundle time — no extra configuration needed.
- After changing `module.yaml` deps, run: `./scripts/regenerate_valdi_modules_build_bazel_files.sh`

## Web Polyglot Entry Pattern

Web entry files export view factories that are auto-registered with the `WebViewClassRegistry` at bundle time. Export a `webPolyglotViews` record mapping class names to factory functions:

```typescript
export const webPolyglotViews: Record<string, (container: HTMLElement) => void> = {
  MyCustomViewClass: createMyViewFactory(),
};
```

Each key must match the `webClass` attribute used in `<custom-view webClass="MyCustomViewClass">`.

A factory receives an `HTMLElement` container and populates it with DOM content:

```typescript
function createMyViewFactory(): (container: HTMLElement) => void {
  return (container: HTMLElement) => {
    const element = document.createElement('div');
    container.appendChild(element);
  };
}
```

### Key constraints for `web/` files
- Compiled by `tsc` via `ts_project`, **not** the Valdi compiler
- Do **NOT** use Valdi imports (`valdi_core/`, `valdi_tsx/`) — web files run in the browser, not the Valdi runtime
- Do **NOT** manually call `globalThis.moduleLoader.resolveRequire()` — build system handles registration
- The `tsconfig.json` in `web/` should target `DOM` + `ES2020` with `module: "commonjs"`

## Canonical Example

See `valdi_polyglot` module for a complete working example with all four platforms:
- `src/composer_modules/src/composer/valdi_polyglot/` (in the Snap monorepo)
- Or the equivalent path in your project

## Common Mistakes

- Putting `web/` files in `srcs` — they must go through `ts_project` + `web_deps`, not the Valdi compiler
- Missing platform `_deps` — each platform impl must be wired via `android_deps`, `ios_deps`, `macos_deps`
- Using Valdi imports in `web/` — they don't exist in the browser bundle


## valdi-custom-view

# Custom View Rules

**Applies to**: `**/*.tsx` files using `<custom-view>` elements.

## `<custom-view>` Element

`<custom-view>` renders a platform-native view inside a Valdi component. Each platform resolves the view by class name.

```typescript
<custom-view
  androidClass="com.snap.modules.my_module.MyNativeView"
  iosClass="SCMyNativeView"
  macosClass="SCMyNativeView"
  webClass="MyWebViewClassName"
  width="100%"
  height={120}
/>
```

## Class Attributes

| Attribute | Platform | Resolution |
|-----------|----------|------------|
| `androidClass` | Android | Reflection via `ReflectionViewFactory`; needs `@RegisterAttributesBinder` |
| `iosClass` | iOS | ObjC class name; must be linked via `ios_deps` |
| `macosClass` | macOS | `NSClassFromString()`; must be linked via `macos_deps` |
| `webClass` | Web | Looked up in `WebViewClassRegistry`; registered via `webPolyglotViews` export |

## Platform Discovery

- **Android**: The view class needs a single-arg `(Context)` constructor. An `@RegisterAttributesBinder`-annotated binder is discovered from assets at runtime.
- **iOS**: The ObjC class must be an `NSView`/`UIView` subclass linked into the binary.
- **macOS**: Same as iOS but with `NSView` subclass.
- **Web**: The `webClass` name is matched against the `WebViewClassRegistry`. Register by exporting `webPolyglotViews` from a web polyglot entry file (see `web-polyglot.md` rule).

## viewFactory Pattern

Instead of resolving by class name, you can pass a `ViewFactory` object directly. This is useful when the factory is provided by a parent component or constructed dynamically:

```typescript
import { ViewFactory } from 'valdi_tsx/src/ViewFactory';

interface MyViewModel {
  viewFactory?: ViewFactory;
}

class MyComponent extends Component<MyViewModel> {
  onRender(): void {
    if (this.viewModel.viewFactory) {
      <custom-view style={styles.container} viewFactory={this.viewModel.viewFactory} />;
    }
  }
}
```

`viewFactory` and `*Class` attributes are mutually exclusive — use one or the other. `viewFactory` takes precedence when both are provided.

## Common Mistakes

- Using `<custom-view>` without checking the platform — wrap in `Device.isAndroid()` / `Device.isIOS()` etc. if not all platforms are supported
- Forgetting to link native implementations — the class name string alone isn't enough; the native code must be compiled and linked via platform `_deps` in BUILD.bazel
- Wrong package name in `androidClass` — must match the Kotlin/Java package exactly


## valdi-overview

# Valdi Open Source - Cursor Rules

## ⚠️ Open Source Project

This is an open source project. Never commit secrets, API keys, or proprietary information.

## 🚨 CRITICAL: This is NOT React!

Valdi uses TSX/JSX syntax but is **fundamentally different from React**. 

**Common AI mistakes:**
- ❌ Suggesting `useState`, `useEffect`, `useContext` (don't exist!)
- ❌ Functional components (don't exist!)
- ❌ `this.props` (should be `this.viewModel`)
- ❌ `markNeedsRender()`, `onMount()`, `onUpdate()` (wrong names/don't exist!)

**Correct Valdi:**
- ✅ `class MyComponent extends StatefulComponent`
- ✅ `state = {}` + `this.setState()`
- ✅ `this.viewModel` for props
- ✅ `onCreate()`, `onViewModelUpdate()`, `onDestroy()` lifecycle

## 📦 AI Skills

Install Valdi skills for your AI tool to get context-specific guidance:

```bash
npm install -g @snap/valdi
valdi skills install
```

Skills available (`valdi skills list`):

| Skill | Coverage |
|-------|----------|
| `valdi-tsx` | TSX component patterns, lifecycle, styling |
| `valdi-setup` | Module BUILD.bazel, tsconfig, hot reload |
| `valdi-async` | CancelablePromise, HTTPClient, lifecycle safety |
| `valdi-perf` | ViewModel stability, createReusableCallback, Style interning |
| `valdi-component-tests` | elementKeyFind, tapNodeWithKey, discriminated unions |
| `valdi-ios` | Swift/ObjC platform bridging |
| `valdi-android` | Kotlin platform bridging |
| `valdi-bazel` | Build rules, platform builds |
| `valdi-compiler` | Compiler pipeline internals |
| `valdi-cpp-runtime` | C++ runtime and renderer |
| `valdi-polyglot-module` | Cross-platform polyglot APIs, web polyglot entry pattern |
| `valdi-custom-view` | Native view integration, viewFactory |

## Quick Commands

```bash
bazel build //...          # Build everything
bazel test //...           # Run all tests
valdi install ios          # Build & install iOS app
valdi hotreload            # Start hot reload
```

## More Information

- **Comprehensive guide**: `/AGENTS.md`
- **AI tooling**: `/docs/docs/ai-tooling.md`
- **Support**: `/SUPPORT.md`
- **Discord**: https://discord.gg/uJyNEeYX2U


## valdi-async

# Valdi Async & Lifecycle Safety

Async operations that complete after a component is destroyed will call `setState()`
on a dead component — the framework throws an error. The fix is always to cancel or
guard before the callback fires.

## HTTPClient: Store, Cancel, Repeat

`HTTPClient` methods return `CancelablePromise<HTTPResponse>`. Store it in a typed
field so you can cancel it in `onDestroy()` and before starting a new request in
`onViewModelUpdate()`.

```typescript
import { Component, StatefulComponent } from 'valdi_core/src/Component';
import { CancelablePromise } from 'valdi_core/src/CancelablePromise';
import { HTTPClient } from 'valdi_http/src/HTTPClient';
import { HTTPResponse } from 'valdi_http/src/HTTPTypes';

interface UserState {
  user: { name: string } | null;
  loading: boolean;
}

class UserProfile extends StatefulComponent<UserProfileViewModel, UserState> {
  state: UserState = { user: null, loading: true };

  private client = new HTTPClient('https://api.example.com');
  private request?: CancelablePromise<HTTPResponse>;

  onCreate(): void {
    this.fetchUser(this.viewModel.userId);
  }

  onViewModelUpdate(previous?: UserProfileViewModel): void {
    if (this.viewModel.userId !== previous?.userId) {
      this.request?.cancel?.();          // Cancel in-flight before starting new one
      this.fetchUser(this.viewModel.userId);
    }
  }

  onDestroy(): void {
    this.request?.cancel?.();            // Always clean up
  }

  private fetchUser(id: string): void {
    this.request = this.client.get(`/users/${id}`);
    this.request.then(response => {
      const user = JSON.parse(new TextDecoder().decode(response.body));
      this.setState({ user, loading: false });
    });
  }

  onRender(): void {
    if (this.state.loading) {
      <spinner />;
      return;
    }
    <label value={this.state.user?.name ?? ''} />;
  }
}
```

**Important:** `cancel` is an optional method on `CancelablePromise` — always use
`?.cancel?.()`, not `?.cancel()`.

## registerDisposable: Timers and Subscriptions

For anything that emits over time (timers, event emitters, observables), use
`registerDisposable()`. The framework calls `cancel()` on all registered disposables
in `onDestroy()` automatically — you don't need to override `onDestroy()` for these.

```typescript
class LiveClock extends Component<{}> {
  onCreate(): void {
    // ❌ Timer leaks if component is destroyed
    setInterval(() => this.tick(), 1000);

    // ✅ Automatically cancelled on destroy
    const id = setInterval(() => this.tick(), 1000);
    this.registerDisposable({ cancel: () => clearInterval(id) });
  }

  private tick = () => { /* ... */ };
}
```

Same pattern for any subscription-style API:

```typescript
onCreate(): void {
  const unsubscribe = eventEmitter.on('change', this.handleChange);
  this.registerDisposable({ cancel: unsubscribe });
}
```

## isDestroyed() Guard for Plain Promises

When using `async/await` or plain `Promise` chains that can't be cancelled, guard
`setState()` with `isDestroyed()` before calling it:

```typescript
private async loadData(): Promise<void> {
  const result = await someAsyncOperation();

  if (this.isDestroyed()) return;   // Component unmounted while awaiting

  this.setState({ data: result });
}
```

Prefer `CancelablePromise` + `registerDisposable` over this pattern where possible —
they make cancellation explicit and don't rely on the check being remembered.

## onViewModelUpdate: Cancel Before Restart

When a viewModel update requires fetching new data, always cancel the previous
request before starting a new one. Skipping this means two requests can be in flight
simultaneously and the earlier one can resolve last, overwriting newer data.

```typescript
onViewModelUpdate(previous?: MyViewModel): void {
  if (this.viewModel.query !== previous?.query) {
    this.searchRequest?.cancel?.();           // ← required
    this.searchRequest = this.client.get(`/search?q=${this.viewModel.query}`);
    this.searchRequest.then(response => {
      this.setState({ results: parse(response) });
    });
  }
}
```

## Observable Subscriptions

For RxJS or observable-based APIs, prefer `registerDisposable` for one-off subscriptions
or the `Subscription` class for managing multiple subscriptions as a group:

```typescript
import { Subscription } from 'rxjs';

class FeedComponent extends StatefulComponent<FeedViewModel, FeedState> {
  private subscription = new Subscription();

  onCreate(): void {
    // Add multiple subscriptions to the group
    this.subscription.add(
      this.viewModel.feedItems$.subscribe({ next: items => this.setState({ items }) })
    );
    this.subscription.add(
      this.viewModel.loading$.subscribe({ next: loading => this.setState({ loading }) })
    );
  }

  onDestroy(): void {
    this.subscription?.unsubscribe();   // Cancels all at once
  }
}
```

For a single subscription, `registerDisposable` is simpler:

```typescript
onCreate(): void {
  this.registerDisposable(
    this.viewModel.counter$.subscribe({ next: count => this.setState({ count }) })
  );
  // No onDestroy() override needed
}
```

### Preventing redundant re-renders with distinctUntilChanged

Subscribe with `distinctUntilChanged()` to skip emissions where the value hasn't
actually changed — avoids a `setState` call and a re-render for each identical value:

```typescript
import { distinctUntilChanged } from 'rxjs/operators';

this.subscription.add(
  this.viewModel.title$.pipe(distinctUntilChanged()).subscribe({
    next: title => this.setState({ title }),
  })
);
```

## setTimeoutInterruptible for Debounce / Race Conditions

When a delayed action must be cancelled if conditions change (e.g. search debounce,
retry delay), use `setTimeoutInterruptible` rather than a bare `setTimeout`:

```typescript
import { setTimeoutInterruptible } from 'valdi_core/src/SetTimeout';

// setTimeoutInterruptible returns a number (timer ID) — cancel with clearTimeout()
class SearchBar extends StatefulComponent<SearchViewModel, SearchState> {
  private debounceId?: number;

  onViewModelUpdate(previous?: SearchViewModel): void {
    if (this.viewModel.query !== previous?.query) {
      clearTimeout(this.debounceId);   // Cancel any pending debounce
      this.debounceId = setTimeoutInterruptible(() => {
        this.fetchResults(this.viewModel.query);
      }, 300);
    }
  }
}
```

## promiseToCancelablePromise

When you have a plain `Promise` (e.g. from a third-party library) that needs to participate in Valdi's cancellation system, wrap it with `promiseToCancelablePromise`:

```typescript
import { CancelablePromise, promiseToCancelablePromise } from 'valdi_core/src/CancelablePromise';

class MyComponent extends StatefulComponent<MyViewModel, MyState> {
  private request?: CancelablePromise<string>;

  onCreate(): void {
    const rawPromise: Promise<string> = thirdPartyApi.fetchData();
    this.request = promiseToCancelablePromise(rawPromise, () => {
      // optional cleanup on cancel
    });
    this.request.then(data => {
      if (this.isDestroyed()) return;
      this.setState({ data });
    });
  }

  onDestroy(): void {
    this.request?.cancel?.();
  }
}
```

Prefer `CancelablePromise` directly (e.g. `HTTPClient`) when available — `promiseToCancelablePromise` is the bridge for external APIs.

## Import Paths

```typescript
import { CancelablePromise, promiseToCancelablePromise } from 'valdi_core/src/CancelablePromise';
import { HTTPClient } from 'valdi_http/src/HTTPClient';
import { HTTPResponse } from 'valdi_http/src/HTTPTypes';
import { setTimeoutInterruptible } from 'valdi_core/src/SetTimeout';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
```


## valdi-perf

# Valdi Performance Patterns

Valdi re-renders a child component whenever its viewModel reference changes. Most
unnecessary re-renders come from creating new object/array/function references in
`onRender()`. Fix the reference — fix the re-render.

## ViewModel Identity Stability

**The #1 performance problem in Valdi apps.** Every object or array literal created
inside `onRender()` is a new reference. Child components will always re-render, even
when the actual values haven't changed.

```typescript
// ❌ New object every render — child always re-renders
onRender(): void {
  <UserRow vm={{ name: this.viewModel.user.name, age: this.viewModel.user.age }} />;
}

// ❌ New array every render
onRender(): void {
  <TabBar tabs={['Home', 'Profile', 'Settings']} />;
}

// ✅ Stable class property for constants
private tabs = ['Home', 'Profile', 'Settings'];
onRender(): void {
  <TabBar tabs={this.tabs} />;
}

// ✅ Pre-compute derived viewModels in onViewModelUpdate
private userRowVM: UserRowViewModel = { name: '', age: 0 };

onViewModelUpdate(): void {
  this.userRowVM = { name: this.viewModel.user.name, age: this.viewModel.user.age };
}

onRender(): void {
  <UserRow vm={this.userRowVM} />;
}
```

Only update the pre-computed VM when the relevant input actually changes:

```typescript
onViewModelUpdate(previous?: UserProfileViewModel): void {
  if (this.viewModel.userId !== previous?.userId) {
    this.userRowVM = buildUserRowVM(this.viewModel.user);
  }
}
```

## Navigation Callbacks

Navigation callbacks passed into child viewModels have the same identity problem:
`() => this.navigationController.push(...)` creates a new function each render.
Use a class arrow function — it is defined once and has a stable reference:

```typescript
// ❌ New function every render
onRender(): void {
  <UserCard onTap={() => this.navigationController.push(DetailPage, { id: this.viewModel.userId })} />;
}

// ✅ Class arrow function — stable reference, viewModel.userId read at tap time
private goToDetail = (): void => {
  this.navigationController.push(DetailPage, { id: this.viewModel.userId });
};

onRender(): void {
  <UserCard onTap={this.goToDetail} />;
}
```

## `<layout>` vs `<view>`

`<view>` allocates a native platform view. `<layout>` is virtual — it participates in
flexbox layout but creates no native view, which is faster and uses less memory.

```typescript
// ❌ Native view wasted on an invisible spacer
<view height={16} />

// ✅ No native view allocated
<layout height={16} />

// ❌ Wrapper with no visual properties or tap handler
<view flexDirection="column">
  <label value="A" />;
  <label value="B" />;
</view>;

// ✅ Virtual layout node
<layout flexDirection="column">
  <label value="A" />;
  <label value="B" />;
</layout>;
```

**Use `<view>` when you need:** `onTap`, `backgroundColor`, `borderRadius`, `style`,
`overflow`, `opacity`, or any visual/interactive property.
**Use `<layout>` for everything else:** spacers, invisible wrappers, structural containers.

## Keys in Lists

Keys determine element identity across re-renders. Without a key (or with an index
key), reordering or inserting items causes the wrong component instances to receive
the wrong viewModels.

```typescript
// ❌ No key — identity lost on reorder
{this.viewModel.items.forEach(item => {
  <ItemRow value={item.name} />;
})}

// ❌ Index key — breaks on insert/remove
{this.viewModel.items.forEach((item, index) => {
  <ItemRow key={String(index)} value={item.name} />;
})}

// ✅ Stable data ID
{this.viewModel.items.forEach(item => {
  <ItemRow key={item.id} value={item.name} />;
})}
```

## Render Props as Class Arrow Functions

When a parent needs to pass a render function to a child (e.g. a list row renderer),
define it as a class arrow function property so it has a stable reference:

```typescript
// ❌ New function every render — child's renderItem prop always changes
onRender(): void {
  <List renderItem={(item) => { <Row data={item} />; }} />;
}

// ✅ Stable class arrow function
private renderItem = (item: Item): void => {
  <Row data={item} />;
};

onRender(): void {
  <List renderItem={this.renderItem} />;
}
```

For loop closures that must capture a loop variable, use `createReusableCallback`
inline in `onRender()`. Valdi's diffing engine recognises `Callback` objects and
updates the internal function reference without treating it as a prop change, so the
child does not re-render:

```typescript
import { createReusableCallback } from 'valdi_core/src/utils/Callback';

// ❌ New plain function every render — child always re-renders
onRender(): void {
  {this.viewModel.sections.forEach((section, i) => {
    <Section onTap={() => this.handleTap(i)} />;
  })}
}

// ✅ Inline Callback — identity-merged by Valdi's diffing engine
onRender(): void {
  {this.viewModel.sections.forEach((section, i) => {
    <Section onTap={createReusableCallback(() => this.handleTap(i))} />;
  })}
}
```

## Style Objects at Module Level

`new Style<T>({...})` interns style objects — the same property values always produce
the same cached object. This interning only works at module initialization time.
Inside `onRender()` the cache is bypassed and a new allocation happens every render.

```typescript
// ❌ Defeats interning — new allocation every render
onRender(): void {
  const s = new Style<View>({ backgroundColor: '#fff', borderRadius: 8 });
  <view style={s} />;
}

// ✅ Interned at module level
import { View } from 'valdi_tsx/src/NativeTemplateElements';

const styles = {
  card: new Style<View>({ backgroundColor: '#fff', borderRadius: 8 }),
};

class MyCard extends Component<MyViewModel> {
  onRender(): void {
    <view style={styles.card} />;
  }
}
```

Group styles in a `const styles = {}` object after the class definition.


## valdi-component-tests

# Write Valdi Component Tests

Write unit tests for a Valdi component using standard Valdi test suite patterns.

## Steps

### 1. Read the source component

Read the component source file to understand:
- What view model properties it accepts
- Which JSX elements have `key` attributes
- What changes based on view model props vs. what's always static
- How "hidden" state is implemented (translationY, opacity, or child component prop)
- Whether the view model contains any **discriminated unions** (type/kind fields)
- Whether any props are **arrays** of items to render

### 2. Add `key` attributes to source elements (only if needed)

Add `key` attributes **only** to elements whose rendering depends on view model properties. Never add keys to static content.

Good candidates for keys:
- The outer container when `hidden` controls `translationY` or `opacity`
- An `<image>` element whose `src` comes from a view model URL prop
- An element inside a `when(condition, ...)` block (to assert presence/absence)
- A badge/overlay that toggles based on a boolean prop
- A spinner shown in a loading/saving state of a union type

Do NOT add keys to:
- Elements with hardcoded asset values (e.g., `src={SIGIcon.xSignStroke}`)
- Label elements with always-present localized strings
- Elements that are always rendered the same regardless of view model

### 3. Determine the test file path

Test files **must mirror the source file hierarchy**. For example:
- Source: `src/categories/CollectionComponent.tsx` → Test: `test/categories/CollectionComponentTest.spec.tsx`
- Source: `src/home_page/OptionPreviewView.tsx` → Test: `test/home_page/OptionPreviewViewTest.spec.tsx`
- Source: `src/MyComponent.tsx` → Test: `test/MyComponentTest.spec.tsx`

### 4. Write the test file

**Imports:**
```tsx
import { MyComponent } from 'my_module/src/MyComponent';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { componentTypeFind } from 'foundation/test/util/componentTypeFind';
import { elementKeyFind } from 'foundation/test/util/elementKeyFind';
import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
import { findNodeWithKey } from 'foundation/test/util/findNodeWithKey';
import { tapNodeWithKey } from 'foundation/test/util/tapNodeWithKey';
import 'jasmine/src/jasmine';
import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';
import { IComponentTestDriver, valdiIt } from 'valdi_test/test/JSXTestUtils';
import { ImageView, View } from 'valdi_tsx/src/NativeTemplateElements';
```

Only import what you actually use. `View` is needed when you call `getAttribute` on a non-image element (e.g., for `onTap`, `onVisibilityChanged`). `ImageView` is needed for `src` attribute access.

**Factory function pattern (always add explicit return type):**
```tsx
const makeViewModel = (): MyComponentViewModel => ({
  imageUrl: 'https://example.com/image.png',
  isVisible: true,
  onTap: fail.bind(null, 'onTap should not be called'),
});
```

Use `fail.bind` for callbacks in the factory default — tests that need to assert on a callback should declare their own spy and pass it explicitly, rather than relying on the factory.

**Render pattern:**
```tsx
const nodes = driver.render(() => {
  <MyComponent {...viewModel} />;
});
```

### 5. Test patterns by assertion type

#### Finding elements
```tsx
// Single-level: component renders native elements directly
elementKeyFind(componentGetElements(nodes[0].component!), 'my-key')[0]

// Cross-boundary: component renders a child component that renders the elements
const inner = componentTypeFind(nodes[0].component as MyComponent, InnerComponent)[0];
elementKeyFind(componentGetElements(inner), 'my-key')[0]

// Typed (for typed attribute access without casting):
elementKeyFind<View>(componentGetElements(nodes[0].component!), 'container')[0]
elementKeyFind<ImageView>(componentGetElements(nodes[0].component!), 'image')[0]

// By element type (e.g. find all Label elements):
// Can pass componentGetElements() result OR an IComponent directly:
const labels = elementTypeFind(componentGetElements(nodes[0].component!), IRenderedElementViewClass.Label);
const labels2 = elementTypeFind(nodes[0].component!, IRenderedElementViewClass.Label); // equivalent
expect(labels[0]?.getAttribute('value')).toBe('Expected text');
```

Use the generic type param to get typed `getAttribute()` results and avoid `@typescript-eslint/no-unsafe-call` errors — prefer this over casting the `getAttribute()` return value.

`elementTypeFind` is useful when elements don't have `key` attributes but you know their type (Label, Image, View, etc.). It returns all elements of that type in render order.

#### Hidden via `translationY`
```tsx
// hidden=false
expect(elementKeyFind<View>(componentGetElements(nodes[0].component!), 'container')[0]?.getAttribute('translationY')).toBe(0);

// hidden=true
expect(elementKeyFind<View>(componentGetElements(nodes[0].component!), 'container')[0]?.getAttribute('translationY')).toBe(850);
```

#### Hidden via `opacity` on native view
```tsx
// visible
expect(elementKeyFind<View>(componentGetElements(nodes[0].component!), 'my-view')[0]?.getAttribute('opacity')).toBe(1);

// hidden
expect(elementKeyFind<View>(componentGetElements(nodes[0].component!), 'my-view')[0]?.getAttribute('opacity')).toBe(0);
```

#### Hidden via `opacity` prop passed to a child Component (component boundary)
```tsx
import { CoreButton } from 'coreui/src/components/button/CoreButton';
const component = nodes[0].component as MyComponent;
const buttons = componentTypeFind(component, CoreButton);
expect(buttons[0].viewModel.opacity).toBe(1); // or 0
```

#### View model URL bound to image `src`
```tsx
expect(elementKeyFind<ImageView>(componentGetElements(nodes[0].component!), 'my-image')[0]?.getAttribute('src')).toBe('https://example.com/image.png');
```

#### Text from view model
```tsx
expect(elementKeyFind(componentGetElements(nodes[0].component!), 'my-label')[0]?.getAttribute('value')).toBe('Expected Text');
```

#### `when()`-conditional element (boolean presence)
```tsx
// condition=true → element exists
expect(elementKeyFind(componentGetElements(nodes[0].component!), 'my-element')[0]).toBeDefined();

// condition=false → element absent
expect(elementKeyFind(componentGetElements(nodes[0].component!), 'my-element')[0]).toBeUndefined();
```

#### `when()`-conditional Component (boolean presence via componentTypeFind)
```tsx
import { BadgeComponent } from 'my_module/src/BadgeComponent';
const component = nodes[0].component as MyComponent;

// condition=true
expect(componentTypeFind(component, BadgeComponent).length).toBe(1);

// condition=false
expect(componentTypeFind(component, BadgeComponent).length).toBe(0);
```

#### Callbacks not expected to be invoked

For callbacks that should never fire in a given test, use `fail.bind(null, '...')` instead of `jasmine.createSpy`. This causes the test to immediately fail with a clear message if the callback is accidentally triggered:

```tsx
<MyComponent
  onSelect={fail.bind(null, 'onSelect should not be called')}
  onLoad={onLoad}
/>
```

`fail.bind(null, 'message')` is a plain function call (not an inline lambda), so it satisfies `jsx-no-lambda`. It is assignable to any callback type since TypeScript allows functions with fewer parameters.

If the same fail callback is used across many tests in the file, extract it to a module-level const to avoid repetition:

```tsx
const failOnSelect = (): void => fail('onSelect should not be called');
```

#### Tap callback (use `tapNodeWithKey` — it's async, always `await` it)

`tapNodeWithKey(component, key, timeoutMs?, intervalMs?)` accepts `IComponent | IRenderedElement`.

```tsx
const onTap = jasmine.createSpy('onTap');
const nodes = driver.render(() => {
  <MyComponent onTap={onTap} />;
});
await tapNodeWithKey(nodes[0].component!, 'my-button');
expect(onTap).toHaveBeenCalled();
```

When you need to find a node without tapping it, use `findNodeWithKey`:
```tsx
import { findNodeWithKey } from 'foundation/test/util/findNodeWithKey';

const node = findNodeWithKey(nodes[0].component!, 'my-button')[0];
expect(node).toBeDefined();
```

When the callback receives arguments (e.g., an index), always assert the exact arguments with `toHaveBeenCalledWith`:
```tsx
const onSelect = jasmine.createSpy('onSelect');
// ... render and trigger ...
expect(onSelect).toHaveBeenCalledWith(1); // not just toHaveBeenCalled()
```

For callbacks invoked via a child component's view model (e.g., through `componentTypeFind`), call the view model method directly:
```tsx
const component = nodes[0].component as MyComponent;
componentTypeFind(component, ItemComponent)[1].viewModel.onTap();
expect(onSelect).toHaveBeenCalledWith(1);
```

#### `onTap` retrieved via `getAttribute` (non-tappable element pattern)
```tsx
// Use elementKeyFind<View> so getAttribute('onTap') is typed — no cast needed
const el = elementKeyFind<View>(componentGetElements(nodes[0].component!), 'my-element')[0];
el?.getAttribute('onTap')?.();
expect(onTap).toHaveBeenCalled();
```

#### `onVisibilityChanged` callback

`View.onVisibilityChanged` signature is `(isVisible: boolean, eventTime: EventTime)` where `EventTime = number`. Always pass both args when invoking:

```tsx
const el = elementKeyFind<View>(componentGetElements(nodes[0].component!), 'container')[0];
el?.getAttribute('onVisibilityChanged')?.(true, 0);
```

**Asserting the callback:** depends on how the component wires the handler:

- If the component **wraps** the viewModel callback (e.g., `onVisibilityChanged={(v) => vm.onVisibilityChanged(v)}`), `toHaveBeenCalledWith(true)` works:
  ```tsx
  expect(onVisibilityChanged).toHaveBeenCalledWith(true);
  ```

- If the component **directly assigns** the viewModel callback (e.g., `onVisibilityChanged={this.viewModel.onVisibilityChanged}`), the spy receives both args. If the spy is typed as `(isVisible: boolean) => void`, `toHaveBeenCalledWith(true, ...)` is a TypeScript error. Check the first arg via `calls`:
  ```tsx
  const spy = viewModel.onVisibilityChanged as jasmine.Spy;
  expect(spy).toHaveBeenCalled();
  expect(spy.calls.mostRecent().args[0]).toBe(true);
  ```
  If the spy is an untyped `jasmine.createSpy()`, you can use `toHaveBeenCalledWith(true, 0)` directly.

### 6. Discriminated union state testing

When a view model contains a discriminated union (e.g., `type: 'LOADING' | 'CONTENT' | 'ERROR'`), **test every branch**. For each state:
1. Assert which elements/components ARE rendered
2. Assert which elements/components from OTHER states are NOT rendered

```tsx
// LOADING state: spinner present, action button absent
valdiIt('Verify spinner is shown in loading state', async driver => {
  const nodes = driver.render(() => {
    <MyComponent button={{ type: ButtonType.LOADING }} />;
  });
  expect(elementKeyFind(componentGetElements(nodes[0].component!), 'loading-spinner')[0]).toBeDefined();
  expect(elementKeyFind(componentGetElements(nodes[0].component!), 'action-button')[0]).toBeUndefined();
});

// CONTENT state: action button present, no spinner
valdiIt('Verify action button is shown in content state', async driver => {
  const nodes = driver.render(() => {
    <MyComponent button={{ type: ButtonType.PURCHASE, price: '$9.99', onTap }} />;
  });
  expect(elementKeyFind(componentGetElements(nodes[0].component!), 'action-button')[0]).toBeDefined();
  expect(elementKeyFind(componentGetElements(nodes[0].component!), 'loading-spinner')[0]).toBeUndefined();
});
```

### 7. Array view model testing

When a component renders a list from an array prop, test three cases:
1. **Empty array** — assert 0 items render
2. **Single item** — assert 1 item renders
3. **Multiple items** — assert item count matches array length

Use `componentTypeFind(component, ItemComponent)` or `elementKeyFind` with indexed keys (e.g., `tile-0`, `tile-1`) to count rendered items.

```tsx
valdiIt('Verify no items render when array is empty', async driver => {
  const emptyOptions: OptionViewModel[] = [];
  const nodes = driver.render(() => {
    <MyComponent items={emptyOptions} />;
  });
  const component = nodes[0].component as MyComponent;
  expect(componentTypeFind(component, ItemComponent).length).toBe(0);
});

valdiIt('Verify item count matches array length', async driver => {
  const threeItems: OptionViewModel[] = [makeItem('a'), makeItem('b'), makeItem('c')];
  const nodes = driver.render(() => {
    <MyComponent items={threeItems} />;
  });
  const component = nodes[0].component as MyComponent;
  expect(componentTypeFind(component, ItemComponent).length).toBe(3);
});
```

Note: Extract array literals to local `const` variables before using in JSX (required by `@snapchat/valdi/jsx-no-lambda`).

### 8. Component boundary traversal

When a component's `onRender()` only renders child components (not native elements), `componentGetElements(component)` returns `[]`. You must get the child component first:

```tsx
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { componentTypeFind } from 'foundation/test/util/componentTypeFind';
import { elementKeyFind } from 'foundation/test/util/elementKeyFind';

const component = nodes[0].component as OuterComponent;
const inner = componentTypeFind(component, InnerComponent)[0];
const container = elementKeyFind<View>(componentGetElements(inner), 'container')[0];
expect(container?.getAttribute('translationY')).toBe(0);
```

### 9. Extract render and find helpers for readability

For larger test files, extract repeated render + find logic into helper functions. This keeps individual tests focused:

```tsx
// Extract rendering
const renderComponent = (driver: IComponentTestDriver, overrides?: Partial<MyComponentViewModel>) => {
  const vm = { ...makeViewModel(), ...overrides };
  return driver.render(() => { <MyComponent {...vm} />; })[0].component as MyComponent;
};

// Extract finding
const getImage = (component: MyComponent) =>
  elementKeyFind<ImageView>(componentGetElements(component), 'image')[0];

// Tests become clean:
valdiIt('Verify imageUrl is bound', async driver => {
  expect(getImage(renderComponent(driver))?.getAttribute('src')).toBe('https://example.com/image.png');
});
```

### 10. Lint rules to follow

- **`explicit-function-return-type`**: Always add explicit return types to factory functions: `const makeViewModel = (): MyViewModel => ({...})`
- **`jsx-no-lambda`**: Never assign inline array literals directly in JSX props. Extract to a local `const` first:
  ```tsx
  // WRONG
  <MyComponent items={[makeItem('a')]} />;

  // CORRECT
  const items: ItemViewModel[] = [makeItem('a')];
  <MyComponent items={items} />;
  ```
- **`no-unsafe-call`**: Use the generic type parameter on `elementKeyFind<T>` to get typed `getAttribute()` results rather than casting: `elementKeyFind<View>(...)` gives typed access to `onTap`, `onVisibilityChanged`, etc.
- **`import/order`**: Keep imports sorted alphabetically by path.

### 11. Key principle

**Only assert on things that change based on view model props.** Every test should have a clear "when X is Y, then Z" story. If the UI looks the same regardless of the prop, skip it.

For union types, a test that only verifies "the component renders without error" in a given state is not sufficient — assert the meaningful structural difference that state introduces.

## Example test file structure

```tsx
import { MyComponent } from 'my_module/src/MyComponent';
import { MyComponentViewModel } from 'my_module/src/MyComponentViewModel';
import { ChildComponent } from 'my_module/src/ChildComponent';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { componentTypeFind } from 'foundation/test/util/componentTypeFind';
import { elementKeyFind } from 'foundation/test/util/elementKeyFind';
import { tapNodeWithKey } from 'foundation/test/util/tapNodeWithKey';
import 'jasmine/src/jasmine';
import { IComponentTestDriver, valdiIt } from 'valdi_test/test/JSXTestUtils';
import { ImageView, View } from 'valdi_tsx/src/NativeTemplateElements';
// elementTypeFind + IRenderedElementViewClass for finding elements by type (no key needed):
// import { elementTypeFind } from 'foundation/test/util/elementTypeFind';
// import { IRenderedElementViewClass } from 'valdi_test/test/IRenderedElementViewClass';

const makeViewModel = (): MyComponentViewModel => ({
  imageUrl: 'https://example.com/image.png',
  isVisible: true,
  onTap: fail.bind(null, 'onTap should not be called'),
});

describe('MyComponentTest', () => {
  valdiIt('Verify visible when isVisible is true', async driver => {
    const nodes = driver.render(() => {
      <MyComponent {...makeViewModel()} />;
    });
    expect(elementKeyFind<View>(componentGetElements(nodes[0].component!), 'container')[0]?.getAttribute('opacity')).toBe(1);
  });

  valdiIt('Verify hidden when isVisible is false', async driver => {
    const nodes = driver.render(() => {
      <MyComponent {...{ ...makeViewModel(), isVisible: false }} />;
    });
    expect(elementKeyFind<View>(componentGetElements(nodes[0].component!), 'container')[0]?.getAttribute('opacity')).toBe(0);
  });

  valdiIt('Verify imageUrl is bound to image src', async driver => {
    const nodes = driver.render(() => {
      <MyComponent {...makeViewModel()} />;
    });
    expect(elementKeyFind<ImageView>(componentGetElements(nodes[0].component!), 'image')[0]?.getAttribute('src')).toBe('https://example.com/image.png');
  });

  valdiIt('Verify onTap is called when tapped', async driver => {
    const onTap = jasmine.createSpy('onTap');
    const nodes = driver.render(() => {
      <MyComponent {...{ ...makeViewModel(), onTap }} />;
    });
    await tapNodeWithKey(nodes[0].component!, 'button');
    expect(onTap).toHaveBeenCalled();
  });

  valdiIt('Verify ChildComponent is present when condition is true', async driver => {
    const nodes = driver.render(() => {
      <MyComponent {...{ ...makeViewModel(), showChild: true }} />;
    });
    const component = nodes[0].component as MyComponent;
    expect(componentTypeFind(component, ChildComponent).length).toBe(1);
  });

  valdiIt('Verify ChildComponent is absent when condition is false', async driver => {
    const nodes = driver.render(() => {
      <MyComponent {...{ ...makeViewModel(), showChild: false }} />;
    });
    const component = nodes[0].component as MyComponent;
    expect(componentTypeFind(component, ChildComponent).length).toBe(0);
  });
});
```


## valdi-setup

# Valdi Module Setup

## BUILD.bazel — valdi_module()

```python
load("//bzl/valdi:valdi_module.bzl", "valdi_module")

valdi_module(
    name = "my_module",              # Must match the directory name exactly
    srcs = glob([
        "src/**/*.ts",
        "src/**/*.tsx",
    ]) + [
        "tsconfig.json",             # tsconfig must be listed in srcs
    ],
    android_output_target = "release",
    ios_module_name = "SCCMyModule", # SCC prefix + PascalCase module name
    ios_output_target = "release",
    visibility = ["//visibility:public"],
    deps = [
        "//src/valdi_modules/src/valdi/valdi_core",
        "//src/valdi_modules/src/valdi/valdi_tsx",
        # Add as needed — see dependency table below
    ],
)
```

**Common mistakes that cause build failures:**

- `name` must equal the Bazel package directory name. The Valdi compiler derives
  module identity from this — mismatches cause a build error.
- `tsconfig.json` must be in `srcs`. It won't be picked up automatically even if
  it's in the directory.
- Missing a dep (e.g. using `HTTPClient` without `valdi_http`) produces a TypeScript
  path resolution error, not a missing import error — can be confusing.

## tsconfig.json

```json
{
    "extends": "../../../../src/valdi_modules/src/valdi/_configs/base.tsconfig.json"
}
```

Adjust the `../../../../` prefix to match how many directories deep your module is
from the repo root. The base config sets up `paths` aliases so `'valdi_core/src/...'`
imports resolve correctly.

## Dependency Table

| You're using | Add this dep |
|---|---|
| `Component`, `StatefulComponent`, `Style`, providers, `CancelablePromise` | `//src/valdi_modules/src/valdi/valdi_core` |
| JSX elements (`<view>`, `<label>`, etc.), `NativeTemplateElements` | `//src/valdi_modules/src/valdi/valdi_tsx` |
| `HTTPClient`, `HTTPResponse` | `//src/valdi_modules/src/valdi/valdi_http` |
| `PersistentStore` | `//src/valdi_modules/src/valdi/persistence` |
| Pre-built UI components (buttons, cards, etc.) | `//src/valdi_modules/src/valdi/valdi_widgets_core` |

## ios_module_name Convention

Must start with `SCC` followed by the module name in PascalCase:

| Directory name | ios_module_name |
|---|---|
| `chat_thread` | `SCCChatThread` |
| `profile_editor` | `SCCProfileEditor` |
| `story_viewer` | `SCCStoryViewer` |

This becomes the Swift module name on iOS. Conflicts with other `SCCXxx` modules in
the same app target will cause a linker error.

## New Component File Template

```typescript
import { Component } from 'valdi_core/src/Component';

interface MyComponentViewModel {
  // viewModel properties
}

export class MyComponent extends Component<MyComponentViewModel> {
  onRender(): void {
    <view>
      <label value={this.viewModel.someText} />;
    </view>;
  }
}
```

For stateful components:

```typescript
import { StatefulComponent } from 'valdi_core/src/Component';

interface MyState {
  // state properties
}

export class MyComponent extends StatefulComponent<MyComponentViewModel, MyState> {
  state: MyState = { /* initial values */ };

  onRender(): void {
    // ...
  }
}
```

## Building

```bash
bazel build //path/to/my_module:my_module
```

## Hot Reload

```bash
valdi hotreload
```

Run from your module directory. The CLI watches for file changes, recompiles, and
pushes the updated module to a connected simulator or device over USB (or network
with `--network`).

```bash
valdi hotreload --network   # Discover device over Wi-Fi instead of USB
```

If hot reload stops reflecting changes, stop with `Ctrl+C` and restart — the CLI
will clean stale build artifacts automatically.


## valdi-migrate

# Valdi Migration Assistant

Guidance for migrating code from Flutter, React, or Jetpack Compose to Valdi.

## When to use

Use this skill when converting Flutter widgets, React components, or Compose `@Composable` functions to Valdi components, or when translating framework-specific patterns (hooks, widgets, Navigator, setState, remember, LaunchedEffect, Modifier, Provider, styled-components, FlatList, LazyColumn, etc.) to Valdi equivalents.

## Critical: Never suggest these patterns

```typescript
// ❌ React hooks — DO NOT EXIST in Valdi
useState / useEffect / useContext / useMemo / useCallback / useRef

// ❌ Compose APIs — DO NOT EXIST in Valdi
@Composable annotation
remember { mutableStateOf() } / remember { }
derivedStateOf / collectAsState / LaunchedEffect / DisposableEffect
Modifier chain (Modifier.padding().background().clickable())
CompositionLocalProvider / LocalXxx.current

// ❌ Functional components — DO NOT EXIST
const MyComp = () => <view />;
function MyComp(props) { return <view />; }

// ❌ Wrong naming
this.props          // → this.viewModel
onMount/onUnmount   // → onCreate/onDestroy
markNeedsRender()   // → this.setState({})
scheduleRender()    // → deprecated, use setState

// ❌ Returning JSX — onRender() returns void
onRender() { return <view />; }   // no return statement

// ❌ Inline lambdas in JSX props — causes re-renders
<view onTap={() => this.doThing()} />   // use class arrow fn

// ❌ map() in render — does not work (JSX is side-effect, not return value)
{items.map(i => <Item key={i.id} />)}   // use forEach

// ❌ JSX as a prop value
<MyComp label={<label value="hi" />} />  // use render prop () => void

// ❌ new Style() inside onRender() — style interning requires module-level init
onRender() { const s = new Style<View>({...}); ... }  // wrong
```

## Correct patterns

```typescript
import { Component, StatefulComponent } from 'valdi_core/src/Component';

// ✅ Stateless component
class MyComp extends Component<MyViewModel> {
  onRender() {
    <view>
      <label value={this.viewModel.title} />;
    </view>;
  }
}

// ✅ Stateful component
class Counter extends StatefulComponent<MyViewModel, { count: number }> {
  state = { count: 0 };

  // Class arrow function — never inline lambda in JSX
  private handleTap = () => {
    this.setState({ count: this.state.count + 1 });
  };

  onRender() {
    <view onTap={this.handleTap}>
      <label value={`Count: ${this.state.count}`} />;
    </view>;
  }
}

// ✅ Lists — forEach, not map()
onRender() {
  <scroll>
    {this.viewModel.items.forEach(item => {
      <Row key={item.id} data={item} />;
    })}
  </scroll>;
}

// ✅ Style — created at module level, not inside onRender()
const cardStyle = new Style<View>({ backgroundColor: '#fff', borderRadius: 8 });
```

## Lifecycle mapping

| Flutter | Jetpack Compose | React | Valdi |
|---------|-----------------|-------|-------|
| `initState()` | `LaunchedEffect(Unit) { }` | `componentDidMount` / `useEffect(fn, [])` | `onCreate()` |
| `dispose()` | `DisposableEffect { onDispose { } }` | `componentWillUnmount` / `useEffect(() => fn, [])` | `onDestroy()` |
| `didUpdateWidget(old)` | `LaunchedEffect(key) { }` | `componentDidUpdate(prev)` / `useEffect(fn, [dep])` | `onViewModelUpdate(previous?)` |
| `build(context)` | `@Composable fun` recomposition | `render(): JSX.Element` | `onRender(): void` |
| `setState(() {...})` | `mutableStateOf` + state write | `this.setState({...})` | `this.setState({...})` |

## Component and element mapping

| Flutter | Jetpack Compose | React | Valdi |
|---------|-----------------|-------|-------|
| `StatelessWidget` | `@Composable fun` (stateless) | Function component | `class X extends Component<VM>` |
| `StatefulWidget` + `State` | `@Composable fun` + `remember { mutableStateOf() }` | Class component + state | `class X extends StatefulComponent<VM, State>` |
| `Container` / `SizedBox` (visual) | `Box` / `Surface` | `<div>` with styles | `<view>` |
| `SizedBox` (invisible spacer) | `Spacer` | Layout-only `<div>` | `<layout>` (no native view, faster) |
| `Text` | `Text(text)` | `<span>` / `<p>` | `<label value="...">` |
| `TextField` | `TextField` / `OutlinedTextField` | `<input>` | `<textfield>` (single-line) |
| `TextFormField` | `BasicTextField` (multi) | `<textarea>` | `<textview>` (multi-line) |
| `Image.network` | `AsyncImage` (Coil) | `<img>` | `<image src={url}>` |
| `ListView` / `FlatList` | `LazyColumn` / `LazyRow` | `<FlatList>` | `<scroll>` + `forEach` |
| `SingleChildScrollView` | `Column` + `verticalScroll` | `<ScrollView>` | `<scroll>` |
| `PageView` | `HorizontalPager` | `<ViewPager>` | `<scroll pagingEnabled={true}>` |
| `CircularProgressIndicator` | `CircularProgressIndicator` | `<ActivityIndicator>` | `<spinner>` |
| `GestureDetector` | `Modifier.clickable { }` | `onClick` / `onPress` | `onTap` on `<view>` |
| `Column` | `Column` | `flexDirection: 'column'` | `<view flexDirection="column">` (default) |
| `Row` | `Row` | `flexDirection: 'row'` | `<view flexDirection="row">` |
| `Stack` | `Box` with `align` | `position: absolute` | `<view>` + children with `position="absolute"` |
| `Modifier.padding(16.dp)` | `Modifier.padding(16.dp)` | `style={{padding:16}}` | `padding={16}` on any element |
| `Navigator.push` | `navController.navigate("route")` | `navigate()` / `router.push` | `navigationController.push(Page, vm, ctx)` |
| `Navigator.pop` | `navController.popBackStack()` | `goBack()` / `router.back` | `navigationController.pop()` |
| `showModalBottomSheet` | `ModalBottomSheet` / `Dialog` | `<Modal>` | `navigationController.present(Page, vm, ctx)` |
| `InheritedWidget` / `Provider` | `CompositionLocalProvider` | `React.Context` + `useContext` | `createProviderComponentWithKeyName<T>()` + `withProviders()` |
| `SharedPreferences` | `SharedPreferences` / `DataStore` | `AsyncStorage` / `localStorage` | `PersistentStore` (valdi persistence) |
| `http.get()` / `dio` | `viewModelScope.launch { api.get() }` | `fetch()` / `axios` | `HTTPClient.get()` (valdi_http) |
| `Lottie` | `LottieAnimation` | `<Lottie>` | `<animatedimage>` |
| `BackdropFilter` | `BlurMaskFilter` | CSS `backdrop-filter` | `<blur>` (iOS only) |

## Key import paths

```typescript
import { Component, StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { createProviderComponentWithKeyName } from 'valdi_core/src/provider/createProvider';
import { withProviders, ProvidersValuesViewModel } from 'valdi_core/src/provider/withProviders';
import { createReusableCallback } from 'valdi_core/src/utils/Callback';
import { HTTPClient } from 'valdi_http/src/HTTPClient';
import { PersistentStore } from 'persistence/src/PersistentStore';
import { Layout, View } from 'valdi_tsx/src/NativeTemplateElements';
```

## Provider pattern (replaces React Context / Flutter InheritedWidget)

```typescript
import { createProviderComponentWithKeyName } from 'valdi_core/src/provider/createProvider';
import { ProvidersValuesViewModel, withProviders } from 'valdi_core/src/provider/withProviders';

const ThemeProvider = createProviderComponentWithKeyName<ThemeService>('ThemeProvider');

// ✅ Root provides value
class AppRoot extends Component {
  private theme = new ThemeService();
  onRender() {
    <ThemeProvider value={this.theme}><App /></ThemeProvider>;
  }
}

// ✅ Consumer wraps with HOC
interface MyViewModel extends ProvidersValuesViewModel<[ThemeService]> {}
class MyComp extends Component<MyViewModel> {
  onRender() {
    const [theme] = this.viewModel.providersValues;
    <view backgroundColor={theme.primary} />;
  }
}
const MyCompWithProvider = withProviders(ThemeProvider)(MyComp);
```

## Further reading

- [Migrating from React](../../../docs/docs/start-from-react.md)
- [Migrating from Flutter](../../../docs/docs/migrate-from-flutter.md)
- [Migrating from Jetpack Compose](../../../docs/docs/migrate-from-compose.md)


## valdi-inspect

# valdi-inspect

Use this skill when you need to inspect a **live running Valdi app** — to see what components are on screen, traverse the rendered virtual node tree, capture element screenshots, or check JS heap usage.

## When to use

- User asks "what's on screen?", "what component is rendering here?", "what contexts are active?"
- You need to diagnose a layout or rendering issue in a running app
- You want to verify a component tree change after a hot-reload
- User asks about memory usage or wants a JS heap dump

## Prerequisites

The Valdi app must be **running on a connected device or emulator**. No hot-reloader required — the CLI connects directly to the app's DebuggerService.

**Port reference** — determined by how the app is built, not the OS:

| Target | Port | When |
|--------|------|------|
| iOS in-app (e.g. Snapchat) | **13592** (default) | `isStandalone = false` |
| Android in-app | **13592** (default) | `isStandalone = false` |
| macOS Valdi app | **13591** | `isStandalone = true` |
| Standalone runner / CLI runner | **13591** | `isStandalone = true` |

For **Android**, `adb forward` runs automatically. For **iOS simulator**, connect directly to `localhost`.

All commands output **JSON by default** (for AI parsing). Add `--pretty` for human-readable output.

---

## Commands

### `valdi inspect status`

Check whether the Valdi daemon is reachable and how many devices are connected.

```
valdi inspect status
valdi inspect status --pretty
```

Output: `{ connected: bool, port: number, connectedDevices: number, portName: string }`

---

### `valdi inspect devices`

List all devices connected to the Valdi daemon.

```
valdi inspect devices
valdi inspect devices --pretty
```

Output: `[{ client_id, platform, application_id }, ...]`

Use `client_id` values with `--client` in other commands. If only one device is connected, other commands auto-select it.

---

### `valdi inspect select`

Interactively choose a device and save it to `~/.valdi-inspect.json`. Subsequent commands use this device without prompting.

```
valdi inspect select
```

---

### `valdi inspect contexts`

List all active root components (contexts) on the device. A **context** is one mounted Valdi component tree — typically one per screen or overlay.

```
valdi inspect contexts
valdi inspect contexts --pretty
valdi inspect contexts --client <client_id>
```

Output: `[{ id: string, rootComponentName: string }, ...]`

The `id` is the **contextId** used by `tree` and `snapshot`. If there is only one context, commands that take a contextId will auto-select it.

---

### `valdi inspect tree [contextId]`

Get the full rendered virtual node tree for a context. If `contextId` is omitted, auto-selects the single context or prompts when there are multiple.

```
valdi inspect tree
valdi inspect tree <contextId>
valdi inspect tree <contextId> --pretty
valdi inspect tree <contextId> --max-depth <n>
```

Output: a nested tree where each node has:
- `tag`: element type (e.g. `"view"`, `"label"`, `"image"`, or a component name)
- `key`: the Valdi TSX key assigned in source
- `element.id`: numeric element ID (use this for `snapshot`)
- `element.frame`: `{ x, y, width, height }` in screen coordinates
- `element.attributes`: rendered prop values (style, value, etc.)
- `children`: array of child nodes (same shape)
- `_childrenTrimmed`: count of trimmed children when `--max-depth` is used

**Tip**: Use `--max-depth 3` or `--max-depth 4` first to get a summary, then drill in.

---

### `valdi inspect snapshot <elementId> [contextId]`

Capture a screenshot of a specific element and save it as a PNG. If `contextId` is omitted, auto-selects or prompts.

```
valdi inspect snapshot <elementId>
valdi inspect snapshot <elementId> <contextId>
valdi inspect snapshot <elementId> <contextId> --output /tmp/my-snap.png
```

Output: `{ path: "/tmp/valdi-snapshot-<elementId>.png" }`

The PNG is written to disk. Read it with the `Read` tool to view it visually.

**Getting elementId**: Use `element.id` from the `tree` output (a number, e.g. `1`, `5`, `42`).

---

### `valdi inspect heap`

Dump JS heap statistics for the connected device.

```
valdi inspect heap
valdi inspect heap --pretty
valdi inspect heap --gc
```

Options:
- `--gc`: run garbage collection before dumping (more accurate free memory reading)

Output: `{ memoryUsageBytes: number, heapDumpJSON: string }`

`heapDumpJSON` is a serialized heap snapshot in V8 format. Note: heap dumps can crash small/toy apps — this works best on full production apps.

---

## Common workflows

### "What is rendering on screen right now?"

```
valdi inspect tree --pretty
```

(contextId is auto-selected if there's only one)

### "Show me what a specific component looks like"

1. Run `valdi inspect tree --pretty` to find the node — note its `element.id`
2. Run `valdi inspect snapshot <element.id>` to capture it
3. Read the PNG with the `Read` tool

### "Diagnose a layout issue at position X,Y"

Run `valdi inspect tree --pretty` and look for `element.frame` values overlapping with the target position.

### "Check memory usage"

```
valdi inspect heap --pretty
```

### "Verify a hot-reload applied correctly"

Run `valdi inspect tree` before and after the edit, compare the JSON output.

---

## Options reference

| Option | Commands | Description |
|--------|----------|-------------|
| `--port <n>` | all | Daemon TCP port (default: 13592 mobile, 13591 standalone) |
| `--client <id>` | contexts, tree, snapshot, heap | Target a specific connected device |
| `--pretty` | devices, status, contexts, tree, heap | Human-readable output |
| `--max-depth <n>` | tree | Trim tree to N levels deep |
| `--output <path>` | snapshot | Custom PNG output path |
| `--gc` | heap | GC before heap dump |

---

## Troubleshooting

**"Valdi daemon not running on port 13592"** — Make sure the app is running. macOS Valdi apps and standalone runners use port 13591: add `--port 13591`.

**"No devices connected"** — Make sure the Valdi app is running. For Android, ensure a device or emulator is connected via `adb`.

**"Timeout waiting for device response"** — The app may be frozen or the JS runtime may be busy. Try again after a moment.

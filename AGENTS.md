# AGENTS.md - Guide for AI Coding Assistants

This document provides context and guidelines for AI coding assistants working with **Valdi Widgets**. Valdi Widgets is a library of UI components and patterns that depends on the [Valdi](https://github.com/Snapchat/Valdi) framework. The anti-hallucination and component patterns below apply to all Valdi/TSX code in this repo.

## Overview

Valdi Widgets provides reusable UI widgets, styles, and patterns for apps built with Valdi. Valdi is a cross-platform UI framework that compiles declarative TypeScript components to native views on iOS, Android, and macOS. **Valdi is NOT React** — it uses TSX/JSX syntax but compiles to native code.

### This Repo (Valdi Widgets)

- **`valdi_modules/`** – Valdi modules (widgets, navigation, valdi_standalone_ui, playground app)
- **`WORKSPACE`** – Depends on Valdi via `http_archive` (e.g. release `beta-0.0.2`)
- **Build**: Bazel; run tests with `bazel test //valdi_modules/widgets:test //valdi_modules/navigation:test //valdi_modules/valdi_standalone_ui:test`
- **Docs**: `.cursor/rules/` (Cursor rules copied from Valdi), this file

The rest of this guide describes **Valdi** patterns so AI assistants don’t suggest React or wrong APIs when editing TypeScript/TSX in `valdi_modules/`.

## 🚨 AI Anti-Hallucination: This is NOT React!

**CRITICAL**: Valdi uses TSX/JSX syntax but **is fundamentally different from React**. The most common AI error is suggesting React patterns that do not exist in Valdi.

### ❌ FORBIDDEN React Patterns (Do NOT use these)

```typescript
// ❌ WRONG - useState does not exist in Valdi
const [count, setCount] = useState(0);

// ❌ WRONG - useEffect does not exist in Valdi  
useEffect(() => { ... }, []);

// ❌ WRONG - useContext, useMemo, useCallback, useRef do not exist
const value = useContext(MyContext);

// ❌ WRONG - Functional components do not exist
function MyComponent(props) { return <view />; }
const MyComponent = () => <view />;
```

### ⚠️ COMMON AI MISTAKES

```typescript
// ❌ WRONG - markNeedsRender() does NOT exist
this.markNeedsRender();

// ❌ WRONG - scheduleRender() is DEPRECATED; use StatefulComponent + setState()
this.scheduleRender();

// ❌ WRONG - onMount/onUpdate/onUnmount do NOT exist
onMount() { }   // Use onCreate()
onUnmount() { } // Use onDestroy()

// ❌ WRONG - this.props does NOT exist
this.props.title  // Use this.viewModel.title

// ❌ WRONG - onRender() returns void, not JSX
onRender() { return <view />; }  // JSX is a statement: <view />;
```

### ✅ CORRECT Valdi Patterns

```typescript
import { StatefulComponent } from 'valdi_core/src/Component';

class MyComponent extends StatefulComponent<ViewModel, State> {
  state = { count: 0 };
  
  onCreate() { }
  onViewModelUpdate(prev: ViewModel) { }
  onDestroy() { }
  
  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
  };
  
  onRender() {
    <button title={`Count: ${this.state.count}`} onPress={this.handleClick} />;
  }
}
```

### Key Valdi Concepts

1. **State**: Use `StatefulComponent` + `setState()`, not `useState`
2. **Props**: Use `this.viewModel`, not `this.props`
3. **Lifecycle**: `onCreate()`, `onViewModelUpdate()`, `onDestroy()`
4. **onRender()**: Returns `void`; JSX is written as a statement, not `return`ed
5. **Components**: Always `class` extending `Component` or `StatefulComponent`, never functions
6. **Timers**: Use `this.setTimeoutDisposable()` in components, not raw `setTimeout`/`setInterval`

### Provider Pattern (Not useContext)

```typescript
import { createProviderComponentWithKeyName } from 'valdi_core/src/provider/createProvider';
import { withProviders, ProvidersValuesViewModel } from 'valdi_core/src/provider/withProviders';

const MyServiceProvider = createProviderComponentWithKeyName<MyService>('MyServiceProvider');

// In child: viewModel extends ProvidersValuesViewModel<[MyService]>
const [myService] = this.viewModel.providersValues;
const ChildWithProvider = withProviders(MyServiceProvider)(ChildComponent);
```

## Valdi Widgets Directory Structure

- **`valdi_modules/widgets/`** – Core widget components (buttons, cells, inputs, etc.)
- **`valdi_modules/navigation/`** – Navigation APIs
- **`valdi_modules/navigation_internal/`** – Internal navigation support
- **`valdi_modules/valdi_standalone_ui/`** – Standalone UI module
- **`valdi_modules/playground/`** – Example app and entry point
- **`.cursor/rules/`** – Cursor rules (bazel, typescript-tsx, testing, etc.)

Valdi itself (compiler, runtime, core modules) is in the `@valdi//` external repository; see Valdi’s [AGENTS.md](https://github.com/Snapchat/Valdi/blob/main/AGENTS.md) and [docs](https://github.com/Snapchat/Valdi/tree/main/docs) for full framework documentation.

## Build and Test (Valdi Widgets)

```bash
# Run tests
bazel test //valdi_modules/widgets:test //valdi_modules/navigation:test //valdi_modules/valdi_standalone_ui:test //valdi_modules/navigation_internal:test

# Build macOS app
bazel build //valdi_modules/playground:app_macos
```

## Important Conventions

- **Bazel**: Use `BUILD.bazel` and `bazel build` / `bazel test`
- **Valdi deps**: Reference `@valdi//src/valdi_modules/src/valdi/...` in BUILD files
- **TypeScript**: Follow Valdi component patterns; no React hooks or functional components
- **Tests**: Jasmine; live under `test/` in each module

## Quick Reference

| What        | React        | Valdi                          |
|------------|--------------|---------------------------------|
| Component  | Function/class | Class only                     |
| State      | `useState`   | `state` + `setState()`          |
| Props      | `this.props` | `this.viewModel`               |
| Mount      | `useEffect`  | `onCreate()`                    |
| Unmount    | `useEffect` cleanup | `onDestroy()`          |
| Render     | `return <jsx>` | `<jsx />;` (void)            |

## More Information

- Valdi: https://github.com/Snapchat/Valdi  
- Valdi Widgets README: `/README.md`  
- Cursor rules: `/.cursor/rules/README.md`  

---

*This file is adapted from Valdi’s AGENTS.md for the Valdi Widgets repo. For the full Valdi framework guide, see [Valdi AGENTS.md](https://github.com/Snapchat/Valdi/blob/main/AGENTS.md).*

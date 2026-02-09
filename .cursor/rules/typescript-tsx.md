# Valdi TypeScript/TSX Component Rules

**Applies to**: TypeScript and TSX files in `valdi_modules/**/*.ts`, `valdi_modules/**/*.tsx`

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

## Timers and Scheduling

```typescript
// ✅ CORRECT - Use component's setTimeoutDisposable
class MyComponent extends StatefulComponent<ViewModel, State> {
  onCreate() {
    this.setTimeoutDisposable(() => {
      console.log('Delayed action');
    }, 1000);
  }
  
  private scheduleLoop() {
    this.setTimeoutDisposable(() => {
      this.doSomething();
      this.scheduleLoop();
    }, 100);
  }
}

// ❌ WRONG - Don't use setInterval/setTimeout directly
setInterval(() => { ... }, 100);  // Won't auto-cleanup!
setTimeout(() => { ... }, 100);   // Won't auto-cleanup!
```

## Common Mistakes to Avoid

1. **Returning JSX from onRender()** – It returns void; JSX is a statement.
2. **Using this.props** – Use `this.viewModel`.
3. **Wrong lifecycle** – Use `onCreate` / `onViewModelUpdate` / `onDestroy`.
4. **Using setInterval/setTimeout directly** – Use `this.setTimeoutDisposable()`.

## Imports

```typescript
// ✅ CORRECT
import { Component, StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';

// ❌ WRONG - React imports don't exist
import React from 'react';
import { useState } from 'react';
```

## More Information

- Valdi: https://github.com/Snapchat/Valdi

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

// ❌ WRONG - Don't use setInterval/setTimeout directly
setInterval(() => { ... }, 100);  // Won't auto-cleanup!
setTimeout(() => { ... }, 100);   // Won't auto-cleanup!
```

## Styling

### Basic Style Usage

```typescript
import { Style } from 'valdi_core/src/Style';
import { View, Label } from 'valdi_tsx/src/NativeTemplateElements';
import { systemBoldFont } from 'valdi_core/src/SystemFont';

// ✅ CORRECT - Type-safe styles
const styles = {
  container: new Style<View>({
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  title: new Style<Label>({
    color: '#000',
    font: systemBoldFont(20),
  }),
};
```

### Spacing: Padding & Margin

```typescript
new Style<View>({
  padding: 10,           // all sides
  padding: '10 20',      // vertical horizontal
  paddingTop: 5,

  // ❌ These don't exist in Valdi
  gap: 10,               // ❌ Use margin on children
  paddingHorizontal: 20, // ❌ Use padding: '0 20'
  paddingVertical: 10,   // ❌ Use padding: '10 0'
})
```

### Layout: Flexbox (Yoga)

```typescript
new Style<View>({
  flexDirection: 'row',       // 'row' | 'column' | 'row-reverse' | 'column-reverse'
  justifyContent: 'center',   // 'flex-start' | 'center' | 'flex-end' | 'space-between' | ...
  alignItems: 'center',
  flex: 1,

  // ❌ CSS Grid doesn't exist
  display: 'grid',            // ❌ Only flex supported
})
```

### Common Properties

```typescript
new Style<View>({
  backgroundColor: '#fff',
  opacity: 0.8,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#ccc',
  boxShadow: '0 2 4 rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
})
```

## Common Mistakes to Avoid

1. **Returning JSX from onRender()** – It returns void; JSX is a statement
2. **Using this.props** – Use `this.viewModel`
3. **Wrong lifecycle** – Use `onCreate` / `onViewModelUpdate` / `onDestroy`
4. **Using setInterval/setTimeout directly** – Use `this.setTimeoutDisposable()`
5. **Using addEventListener** – Use element callbacks like `onTap`, `onPress`, `onChange`
6. **Using CSS properties that don't exist** – No `gap`, `paddingHorizontal`, `paddingVertical`
7. **Suggesting scheduleRender()** – Deprecated, use `StatefulComponent` + `setState()`

## Imports

```typescript
// ✅ CORRECT
import { Component, StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { systemFont } from 'valdi_core/src/SystemFont';

// ❌ WRONG - React imports don't exist
import React from 'react';
import { useState } from 'react';
```

## More Information

- Valdi: https://github.com/Snapchat/Valdi
- Repo README: `/README.md`
- AGENTS.md: `/AGENTS.md`

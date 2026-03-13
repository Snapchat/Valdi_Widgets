# Testing Rules

**Applies to**: Test files in `**/test/**/*.ts`, `**/*Test.ts`

## Overview

Valdi Widgets uses Jasmine for TypeScript/component tests. Test files live in `test/` directories within each module and are named `*Test.ts` (e.g., `CoreButtonTest.ts`, `EmojiLabelTest.ts`).

## Test Framework

```typescript
import 'jasmine/src/jasmine';
import { Component } from 'valdi_core/src/Component';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const component = new MyComponent();
    expect(component).toBeDefined();
  });

  it('should handle state updates', () => {
    const component = new MyStatefulComponent();
    component.setState({ count: 1 });
    expect(component.state.count).toBe(1);
  });
});
```

## Running Tests

```bash
# Run all widget tests
bazel test //valdi_modules/widgets:test //valdi_modules/navigation:test //valdi_modules/valdi_standalone_ui:test //valdi_modules/navigation_internal:test

# With output on failure
bazel test //valdi_modules/...:test --test_output=errors

# Single module
bazel test //valdi_modules/widgets:test
```

## Test Conventions

- **Naming**: `*Test.ts` (e.g., `CoreButtonTest.ts`, `SliderTest.ts`)
- **Location**: `test/` subdirectory mirroring `src/` structure
- **Framework**: Jasmine (`describe`, `it`, `expect`, `beforeEach`, `afterEach`)

## Test Structure

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something specific', () => {
    // Arrange
    const component = new MyComponent();
    // Act
    component.doSomething();
    // Assert
    expect(component.result).toBe(expected);
  });
});
```

## Testing State

```typescript
it('should update state correctly', () => {
  const component = new MyStatefulComponent();
  component.setState({ count: 1 });
  expect(component.state.count).toBe(1);
});
```

## Important Testing Principles

1. **Test behavior, not implementation** – Focus on what the component does, not how
2. **Isolate tests** – Each test should be independent
3. **Use `this.setTimeoutDisposable()`** in component code; avoid raw `setTimeout`/`setInterval` in components

## More Information

- Valdi: https://github.com/Snapchat/Valdi

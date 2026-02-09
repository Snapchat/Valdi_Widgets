# Testing Rules

**Applies to**: Test files in `**/test/`, `**/*.spec.ts`, `**/*.test.ts`

## Overview

Valdi Widgets uses the same testing approach as Valdi: Jasmine for TypeScript/component tests.

## Test Framework

### Jasmine for TypeScript Tests

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

Test files use `.spec.ts` and live under `test/` in each module.

## Running Tests

```bash
# Run Valdi Widgets tests
bazel test //valdi_modules/widgets:test //valdi_modules/navigation:test //valdi_modules/valdi_standalone_ui:test //valdi_modules/navigation_internal:test

# With output
bazel test //valdi_modules/...:test --test_output=errors
```

## Test Conventions

- `*.spec.ts` or `*.test.ts` for unit tests
- `test/` directory per module
- Test file should mirror source file name

## Important

1. **Test behavior, not implementation**
2. **Isolate tests** – Each test independent
3. **Mock dependencies** when appropriate
4. **Use this.setTimeoutDisposable()** in component code; avoid raw setTimeout/setInterval in tests when testing components

## More Information

- Valdi testing: https://github.com/Snapchat/Valdi

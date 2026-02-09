# Codebase Audit: Valdi Rules (AGENTS.md & .cursor/rules)

**Date**: 2025-02-05  
**Scope**: All TypeScript/TSX in `valdi_modules/` checked against AGENTS.md and `.cursor/rules/typescript-tsx.md`.

## Summary

| Category | Status | Count |
|----------|--------|-------|
| React hooks (useState, useEffect, etc.) | ✅ None | 0 |
| this.props | ✅ None | 0 |
| Wrong lifecycle (onMount/onUnmount as lifecycle) | ✅ None | 0 |
| onRender() return JSX | ✅ None | 0 |
| React.Component / functional components | ✅ None | 0 |
| context.get() | ✅ None | 0 |
| **scheduleRender()** | ⚠️ Deprecated usage | 1 |
| **Raw setTimeout/setInterval** | ⚠️ Prefer setTimeoutDisposable | 2 |
| **Function that renders JSX** | ⚠️ Review | 1 |

---

## ✅ Passed Checks

- **No React hooks** – No `useState`, `useEffect`, `useContext`, `useMemo`, `useCallback`, `useRef`.
- **No `this.props`** – All components use `this.viewModel`.
- **No lifecycle misuse** – No components use `onMount`/`onUnmount`/`onUpdate` as Valdi lifecycle; any `onUpdate*` names are private callback methods (e.g. `onUpdateIndex`, `onUpdateScrollPos`), not lifecycle.
- **No JSX return from onRender()** – No `return <...>` in `onRender()`.
- **Class-based components** – All UI components extend `Component` or `StatefulComponent` (except one render helper; see below).
- **No React imports** – No `React.Component` or functional components used as Valdi components.
- **Correct use of setTimeoutDisposable** – Used in `DataSyncingBar.tsx` and `AnimatableVisibilityView.tsx`.

---

## ⚠️ Findings (Actionable)

### 1. Deprecated: `scheduleRender()` (AGENTS.md / typescript-tsx)

**File:** `valdi_modules/widgets/src/components/section/SectionList.tsx`  
**Line:** 346  

**Code:**
```typescript
this.renderer.batchUpdates(() => {
  for (const section of this.items.all()) {
    section.scheduleRender();
  }
});
```

**Rule:** `scheduleRender()` is deprecated; prefer `StatefulComponent` + `setState()` or viewModel-driven updates.

**Context:** `SectionListItem` already extends `StatefulComponent`. When deferred items are ready, the list tells each section to re-render. Preferred approach: drive the update via viewModel (e.g. a `refreshKey` or updated `deferredRenderer` reference) so sections re-render in `onViewModelUpdate`, or have each section subscribe to the deferred renderer and call `setState()` when new items are ready. If the framework still exposes `scheduleRender()` for this batch pattern, consider adding a short comment that it’s intentional until a viewModel-based refactor.

**Recommendation:** Either refactor to viewModel/`setState`-based refresh, or add a brief comment: `// scheduleRender() used for batch deferred-item refresh; prefer viewModel-driven update when feasible.`

---

### 2. Raw `setTimeout` (typescript-tsx: use `setTimeoutDisposable`)

**File:** `valdi_modules/widgets/src/components/animation/AnimationShimmer.tsx`  
**Line:** 162  

**Code:**
```typescript
this.animationTimeout = setTimeout(() => {
  resolve();
}, AnimationShimmer.stageDurationMs);
```

**Rule:** Use `this.setTimeoutDisposable()` so the timer is tied to component lifecycle and cleaned up on destroy.

**Context:** Used inside `stageTimeout()` which returns a `Promise`. The component also uses `clearTimeout(this.animationTimeout)` elsewhere. If the component is destroyed before the promise resolves, the timeout should be cancelled. Using `setTimeoutDisposable` and storing the disposable for cleanup in `onDestroy()` would align with the rule and avoid leaks.

**Recommendation:** Refactor to use `this.setTimeoutDisposable()` and cancel the disposable in `onDestroy()` (and clear any pending promise handling if needed).

---

### 3. Raw `setInterval` (typescript-tsx: prefer disposable timers)

**File:** `valdi_modules/widgets/src/components/animation/AnimationRotate.tsx`  
**Lines:** 29, 36  

**Code:**
```typescript
this.ticker = setInterval(() => {
  this.setStateAnimated(...);
}, revolutionMs);
// ...
onDestroy(): void {
  clearInterval(this.ticker);
}
```

**Rule:** Avoid raw `setInterval`/`setTimeout`; use component lifecycle–aware APIs (e.g. `setTimeoutDisposable` for one-shot or a repeating pattern built on it).

**Context:** Cleanup is already done in `onDestroy()`, so there’s no leak. The rule still recommends the disposable pattern for consistency and to avoid missing cleanup in future edits.

**Recommendation:** Consider a small helper or pattern using `setTimeoutDisposable` in a loop for the ticker, so all timers go through the same lifecycle mechanism. If the team prefers to keep `setInterval` here, add a short comment that cleanup is intentional in `onDestroy()`.

---

### 4. Function that renders JSX (review)

**File:** `valdi_modules/widgets/src/components/util/ComponentDefRenderer.tsx`  

**Code:**
```typescript
export function ComponentDefRenderer<Def extends ComponentDef<{}>>(
  viewModel: ComponentDefRendererViewModel<Def>,
): void {
  const componentDef = viewModel.componentDef;
  <componentDef.componentClass {...componentDef.viewModel} key={componentDef.key} />;
}
```

**Rule:** “Always use class extending Component or StatefulComponent, never functions.”

**Context:** This is a render helper (function taking viewModel and rendering JSX as a statement). It is not a React-style function component; it’s used as a Valdi render helper. Valdi may support this pattern for such helpers.

**Recommendation:** Leave as-is if Valdi’s compiler supports this. If not, consider converting to a small class that extends `Component<ComponentDefRendererViewModel<Def>>` with the same body in `onRender()`. No change required if the build and runtime accept it.

---

## Files Not Flagged

- **TabsHeader, TabsContent, SubscreenTabs, ScrollBar** – Uses of `onUpdateIndex`, `onUpdateItems`, `onUpdateTabIndex`, `onUpdateScrollPos`, etc. are **private callback names**, not Valdi lifecycle methods. No change needed.
- **NavigationController, ModalPageComponent, Playground** – `return () => { ... }` are **cleanup/teardown closures**, not `return <jsx>`. No change needed.

---

## Recommendations

1. **SectionList.tsx** – Add a comment for `scheduleRender()` or refactor to viewModel/`setState`-driven refresh.
2. **AnimationShimmer.tsx** – Switch to `setTimeoutDisposable` and dispose in `onDestroy()`.
3. **AnimationRotate.tsx** – Either switch to a `setTimeoutDisposable`-based tick loop or document that `setInterval` cleanup in `onDestroy()` is intentional.
4. **ComponentDefRenderer.tsx** – Confirm with Valdi compiler/runtime that function render helpers are supported; if not, convert to a class component.

After changes, re-run:

```bash
bazel test //valdi_modules/widgets:test //valdi_modules/navigation:test //valdi_modules/valdi_standalone_ui:test //valdi_modules/navigation_internal:test
```

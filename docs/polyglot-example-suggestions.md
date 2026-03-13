# Polyglot Example Suggestions

Two example polyglot modules to add to this repo: one that **calls down to native for a system capability** (no custom-view), and one that **uses a custom-view** for native UI.

---

## What’s already here

**Custom-view usage (in widgets):**
- **EmojiLabel** – `<custom-view>` for native text/emoji (Android: `ValdiEmojiTextView`, iOS: `SCValdiLabel`)
- **DatePicker, TimePicker, IndexPicker** – native picker views with TSX props

**“System” / Device usage (no custom-view):**
- **Device.performHapticFeedback** – haptics (PickerActionSheet, CoreToggle, PullToRefresh, etc.)
- **Device.isIOS() / isAndroid()** – platform branching
- **Device.getDisplay* / observeDisplayInsetChange** – layout, insets
- **Device.isDarkMode() / observeDarkMode()** – theme
- **runtime.setColorPalette** – theming

**Built-in elements:** `<spinner>`, `<label>`, `<view>`, etc. (Valdi/valdi_tsx).

---

## 1. “Calls down to native” only (no custom-view)

**Idea:** One TS/TSX API that uses **native system APIs** on iOS/Android and a web fallback. No `<custom-view>`; just a component and/or service that calls into the host.

### Option A: **Share** (recommended)

- **API:** e.g. `ShareButton` with `text`, `url?`, `onComplete?`, or a small `Share.copyToClipboard(text)` / `Share.share({ title, text, url })`.
- **Native:** System share sheet (iOS `UIActivityViewController`, Android `Intent.ACTION_SEND`). Requires a Valdi bridge API (e.g. `Device.share(...)` or similar) if not already present.
- **Web:** `navigator.share()` when available, otherwise `navigator.clipboard.writeText()` or a simple “Copied” feedback.
- **Why:** Very common in app UIs; clearly “needs the system”; no custom-view.

### Option B: **Clipboard**

- **API:** `Clipboard.copy(text: string)` and optionally `Clipboard.paste(): Promise<string>`.
- **Native:** System clipboard via bridge (e.g. `Device.setClipboard` / `Device.getClipboard` if Valdi exposes them).
- **Web:** `navigator.clipboard.writeText` / `readText()`.
- **Why:** Small surface; pure “system” capability; easy to demo in Playground (e.g. a button that copies a string).

### Option C: **Haptic**

- **API:** `Haptic.impact(type?: 'light'|'medium'|'heavy')` or similar.
- **Native:** Forward to `Device.performHapticFeedback(DeviceHapticFeedbackType.*)` (already used in widgets).
- **Web:** No-op or `console.log` for demo.
- **Why:** Minimal; shows “polyglot that only calls native” with no UI. Less exciting than Share/Clipboard but no bridge work if Device already has haptics.

**Recommendation:** **Share** or **Clipboard** if the Valdi/Device bridge supports it (or you’re willing to add a thin bridge); otherwise **Haptic** as a tiny “native-only call” example.

---

## 2. “Includes a custom-view”

**Idea:** A component that renders **native UI via `<custom-view>`** on iOS/Android and a **TSX fallback** on web (using existing widgets or simple layout).

### Option A: **Badge** (recommended)

- **API:** `<Badge count?: number | dot />` (or `count` for a number, no count = dot).
- **Native:** `<custom-view iosClass='...BadgeView' androidClass='...BadgeView' count={...} />` – platform badge (e.g. red dot or pill with number).
- **Web:** A small `<view>` + optional `<label>` (or reuse widgets like `SectionBadge` / tab badge styling) for dot or count.
- **Why:** Common in widget libraries; small surface; clear “custom-view + TSX fallback” split; fits tabs/settings patterns already in the repo.

### Option B: **ActivityIndicator / Spinner**

- **API:** `<Spinner size? color? />` (or same as existing `<spinner>` props).
- **Native:** `<custom-view iosClass='SCValdiSpinner' androidClass='...ProgressBar' />` for platform spinner.
- **Web:** Use built-in `<spinner>` from Valdi.
- **Why:** Standard widget; repo already uses `<spinner>` in CoreButton, FadeView, etc., so the polyglot layer would “wrap” native vs built-in spinner. Slightly redundant unless you want a single abstraction over platform vs built-in.

### Option C: **NativeLabel** (or **SystemLabel**)

- **API:** Same as `<label>` (value, font, etc.).
- **Native:** `<custom-view>` wrapping `UILabel` / `TextView` (e.g. same as EmojiLabel’s iOS class).
- **Web:** `<label {...viewModel} />`.
- **Why:** Mirrors **EmojiLabel** but as a standalone polyglot module; good if you want a second custom-view example that isn’t a picker. Less “widget-library iconic” than Badge or Spinner.

**Recommendation:** **Badge** – small, familiar, and clearly shows “custom-view on mobile, TSX on web” without duplicating pickers or EmojiLabel.

---

## Summary table

| Example type              | Suggested module | Native side              | Web fallback              |
|---------------------------|------------------|--------------------------|---------------------------|
| Calls down to native only | **Share** or **Clipboard** | System share / clipboard bridge | `navigator.share` / `clipboard` API |
| Includes custom-view      | **Badge**        | `<custom-view>` badge    | `<view>` + optional `<label>` |

Implementing **Clipboard** (or **Share** if bridge exists) + **Badge** gives two clear, small polyglot examples that match what you asked for.

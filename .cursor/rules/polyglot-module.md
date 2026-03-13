# Polyglot Modules (Valdi)

Follow the **official Valdi polyglot docs** for the native/TS contract and Bazel wiring:

**[Polyglot Modules (native-polyglot.md)](https://github.com/Snapchat/Valdi/blob/main/docs/docs/native-polyglot.md)**

Use this rule when editing or creating polyglot modules that expose a TypeScript API backed by iOS/Android (or C++) implementations in this repo.

## Official pattern (summary)

- **TypeScript API**: Declare the module in a **`.d.ts`** file with **`@ExportModule`**. The Valdi compiler generates Objective-C, Swift, and Kotlin (and C++) bindings. Example: `src/ShareNative.d.ts` with `@ExportModule` and exported functions/interfaces.
- **Bazel**: The module’s **`valdi_module()`** target uses:
  - **`android_deps`** – list of Android implementation targets (e.g. `valdi_android_library`).
  - **`ios_deps`** – list of iOS implementation targets (e.g. `objc_library` or `apple_library`).
  - **`native_deps`** – list of `cc_library` for cross-platform C++ (optional).
- **Android**: Use **`valdi_android_library`** (from `@valdi//bzl/valdi:valdi_android_library.bzl`) with `deps = [":<module>_api_kt", "@valdi//valdi:valdi_java"]`. Implement the generated Kotlin API; annotate the **factory** class with **`@RegisterValdiModule`** and implement `onLoadModule()`.
- **iOS**: Use **`objc_library`** with `deps = [":<module>_api_objc", "@valdi//valdi_core:valdi_core"]`. Implement the generated Objective-C API; in the factory implementation use **`VALDI_REGISTER_MODULE()`** and implement `onLoadModule`.
- **C++** (optional): Use **`cc_library`** with **`alwayslink = 1`** and `deps = [":<module>_cpp"]`. Bindings are hand-written; register with `RegisterModuleFactory::registerTyped<...>()`.

Reference implementation in this repo: **`valdi_modules/share/`** (ShareNative.d.ts, BUILD.bazel with `android_deps` / `ios_deps`, `valdi_android_library`, `objc_library`).

## Two patterns in this repo

### 1. "Calls down to native" (no custom-view)

- One TS API: native bridge on iOS/Android, **web APIs** on web.
- **Example:** `valdi_modules/share/` – `Share.share({ title?, text?, url? })`.
- **TS:** Branch on `Device.isIOS()` / `Device.isAndroid()`. On native, call the native module (generated from the `.d.ts`); on web, use browser APIs (e.g. `navigator.share()` or clipboard).
- **Native:** Implement the generated API (Android Kotlin factory + impl, iOS Obj-C factory + impl). No custom views.
- **Web:** Implement in e.g. `web/src/ShareWeb.ts` and wire from TS when not native. Use **`web_deps`** on `valdi_module` for web build.

### 2. "Includes a custom-view"

- A **component** that renders **`<custom-view iosClass='...' androidClass='...' />`** on iOS/Android and a **TSX fallback** on web.
- **Example:** Pickers, EmojiLabel; or standalone polyglot module (e.g. tooltip).
- **TS:** In `onRender()`, branch on platform; if native, render `<custom-view ... />`; else render TSX fallback.
- **Native:** Implement the view class; ensure the app build includes it so the runtime can instantiate by class name. Document in `android/` and `ios/` READMEs.

## Recommended structure

```
valdi_modules/<module_name>/
  BUILD.bazel          # valdi_module( android_deps, ios_deps, [native_deps], web_deps? ) per native-polyglot.md
  tsconfig.json
  src/
    index.ts
    <MainEntry>.ts     # or .tsx; may import from <Name>.d.ts
    <Name>.d.ts        # @ExportModule API for native (optional for view-only polyglot)
  android/             # valdi_android_library srcs
    src/main/java/.../...Impl.kt   # @RegisterValdiModule factory + impl
  ios/                 # objc_library srcs
    ...Impl.m          # VALDI_REGISTER_MODULE() factory + impl
  web/                 # optional; web_deps filegroup
    *.ts
```

## Importing polyglot modules (consumers)

- The Valdi compiler may **not** resolve bare module names like `'share'` or `'tooltip'`.
- Use the **path to the entry file**: e.g. `import { Share } from 'share/src/Share';` (not `from 'share'`).

## Playground integration

- Add the module to **`playground/BUILD.bazel`** in `deps`: `"//valdi_modules/<name>"`.
- Use it in a **Section** or the **Polyglot** tab. Run: `bazel build //valdi_modules/playground:app_macos && ./bazel-bin/valdi_modules/playground/app_macos_bin` or `./scripts/bazel_macos_run.sh`.

## Core rules (all polyglot code)

- Valdi is NOT React. No functional components or hooks.
- Components are class-based; `onRender()` returns void; JSX is a statement, not `return`ed.
- Prefer existing widgets as the TSX fallback for web when using a custom-view.
- For native views, use `<custom-view iosClass='...' androidClass='...' />` with the correct platform class names.

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

## Common Mistakes

- Using `<custom-view>` without checking the platform — wrap in `Device.isAndroid()` / `Device.isWeb()` etc. if not all platforms are supported
- Forgetting to link native implementations — the class name string alone isn't enough; the native code must be compiled and linked via platform `_deps` in BUILD.bazel
- Wrong package name in `androidClass` — must match the Kotlin/Java package exactly

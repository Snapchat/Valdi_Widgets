# Share module – iOS

Native iOS implementation for the polyglot Share module. Implemented in **pure Obj-C**, following the same pattern as the [Valdi HelloWorld app](https://github.com/Snapchat/Valdi/tree/main/apps/helloworld/src/ios).

- **ShareHelper.h / ShareHelper.m** – Presents `UIActivityViewController` for the system share sheet.
- **ShareNativeModuleImpl.m** – Registers the Share native module with Valdi (`VALDI_REGISTER_MODULE`) and forwards `share(options)` to `ShareHelper`.

The module is built as an `objc_library` with `deps = [":share_api_objc", "@valdi//valdi_core:valdi_core"]` and `copts = ["-I."]` so the generated API headers (via headermap) resolve correctly.

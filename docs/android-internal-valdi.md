# Android build: undefined JNI symbols (getEnv / attachJni / detachJni)

## What’s wrong

The Android build can fail at **link** with undefined symbols:

- `snap::utils::platform::attachJni(char const*)`
- `snap::utils::platform::detachJni()`
- `snap::utils::platform::getEnv()`

These are **used** by Valdi’s Android C++ code and **defined** in Valdi’s `libs/utils` (`JvmUtils.cpp`), but that implementation is wrapped in `#ifdef ANDROID_WITH_JNI`. If the build does **not** pass `-DANDROID_WITH_JNI`, the file compiles empty and the symbols are missing at link time.

## Fix 1: Use the same flags as the Valdi CLI (recommended)

The Valdi CLI uses `--copt=-DANDROID_WITH_JNI` and `--repo_env=VALDI_PLATFORM_DEPENDENCIES=android` when building Android (e.g. `valdi export android`). Use the same flags when building the Android app with Bazel directly:

```bash
bazel build //valdi_modules/playground:app_android \
  --copt=-DANDROID_WITH_JNI \
  --repo_env=VALDI_PLATFORM_DEPENDENCIES=android
```

The `scripts/bazel_android_install.sh` script already passes these flags. If you run `bazel build ...` by hand for Android, add them too.

## Fix 2: Use internal Valdi (optional)

If you need to build against the internal Valdi tree (e.g. with Snap toolchains), point **WORKSPACE** at the internal open_source root via `local_repository` so `//libs/utils` and other internal deps resolve. The install script’s flags (Fix 1) still apply.

## Fix 3: Open-source Valdi (long-term)

The published Valdi archive already includes `libs/utils` and `JvmUtils.cpp`; the only requirement is defining `ANDROID_WITH_JNI` when building for Android (Fix 1). No change is needed in the Valdi repo for the open-source archive to work.

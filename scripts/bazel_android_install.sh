#!/usr/bin/env bash

set -euo pipefail
set -x

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)"
ROOT_DIR="$SCRIPT_DIR/../"

START_ACTIVITY="com.snap.valdi.playground/.StartActivity"

pushd "$ROOT_DIR"
bazel build "//valdi_modules/playground:app_android"
adb install -r "bazel-bin/valdi_modules/playground/app_android.apk"
adb shell am start -n $START_ACTIVITY

popd

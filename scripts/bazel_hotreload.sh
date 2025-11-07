#!/usr/bin/env bash

set -euo pipefail
set -x

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)"

ROOT_DIR="$SCRIPT_DIR/../"

pushd "$ROOT_DIR"

bazel build //valdi_modules/playground:playground_hotreload
./bazel-bin/valdi_modules/playground/run_hotreloader.sh

popd

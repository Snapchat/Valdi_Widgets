#!/usr/bin/env bash

# This script builds //valdi_modules/playground using Bazel and then runs it
# on the local machine

set -o errexit  # Exit on most errors (see the manual)
set -o nounset  # Disallow expansion of unset variables
set -o pipefail # Use last non-zero exit code in a pipeline
set -o xtrace   # Print commands as they are executed

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
ROOT_DIR="$SCRIPT_DIR/../"

pushd "$ROOT_DIR"
bazel build "//valdi_modules/playground:app_macos"
./bazel-bin/valdi_modules/playground/app_macos_bin
popd

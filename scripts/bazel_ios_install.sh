#!/usr/bin/env bash

# This script builds //valdi_modules/playground:app_ios and installs it
# on the currently-booted iOS Simulator

set -o errexit  # Exit on most errors (see the manual)
set -o nounset  # Disallow expansion of unset variables
set -o pipefail # Use last non-zero exit code in a pipeline
set -o xtrace   # Print commands as they are executed

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
ROOT_DIR="$SCRIPT_DIR/../"

pushd "$ROOT_DIR"
bazel build //valdi_modules/playground:app_ios
TARGET_TEMP_DIR=`mktemp`
rm "$TARGET_TEMP_DIR"
mkdir "$TARGET_TEMP_DIR"
unzip "bazel-bin/valdi_modules/playground/app_ios.ipa" -d "$TARGET_TEMP_DIR"
xcrun simctl install booted "$TARGET_TEMP_DIR/Payload/Valdi Playground.app"
rm -r "$TARGET_TEMP_DIR"
popd
echo "Application installed on iOS Simulator"

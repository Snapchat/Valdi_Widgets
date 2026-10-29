#!/bin/bash
# Analyzes Widgets' iOS targets for iOS from a throwaway consumer module, with
# Widgets as a non-root dependency. Widgets' own test run can't catch
# repo-mapping bugs like #20: as the root module it sees repos (e.g.
# @platforms) that a downstream consumer's copy of Widgets can't.
#
# Usage: scripts/check_as_dependency.sh [extra bazel flags, e.g. --override_module=...]
set -euo pipefail

WIDGETS="$(cd "$(dirname "$0")/.." && pwd)"
CONSUMER="$(mktemp -d)"
trap 'rm -rf "$CONSUMER"' EXIT

cp "$WIDGETS/.bazelrc" "$WIDGETS/.bazelversion" "$CONSUMER/"
{
  echo 'module(name = "valdi_widgets_consumer")'
  echo
  echo 'bazel_dep(name = "valdi_widgets")'
  echo "local_path_override(module_name = \"valdi_widgets\", path = \"$WIDGETS\")"
  echo
  # Only the root module's overrides, toolchains and version pins apply, so
  # the consumer reuses Widgets' own.
  sed '/^module(/d' "$WIDGETS/MODULE.bazel"
} > "$CONSUMER/MODULE.bazel"
touch "$CONSUMER/BUILD.bazel"
cd "$CONSUMER"

IOS_TARGETS="$(bazel query 'kind("objc_library|swift_library", @valdi_widgets//valdi_modules/...)' "$@")"
echo "Analyzing $(echo "$IOS_TARGETS" | wc -l | tr -d ' ') iOS targets for iOS..."
bazel cquery "$(echo "$IOS_TARGETS" | paste -sd+ -)" \
  --config=ios \
  --platforms=@snap_platforms//os:ios_arm64 \
  "$@" > /dev/null
echo "OK"

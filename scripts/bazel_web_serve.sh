#!/usr/bin/env bash
# Build the playground web bundle and run the **webpack dev server** (Playground app in the browser).
# This does NOT serve a raw file list — it runs webpack-dev-server so http://localhost:8080 shows the app.
# Requires: Node.js, npm.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)"
ROOT_DIR="$SCRIPT_DIR/../"
WEB_TARGET="//valdi_modules/playground:playground_export_npm"
WEB_APP_DIR="$ROOT_DIR/valdi_modules/playground/web_app"
PORT="${PORT:-8080}"

pushd "$ROOT_DIR"

# If something is already on the port (e.g. old python static server), warn
if command -v lsof &>/dev/null && lsof -i ":$PORT" -sTCP:LISTEN -t &>/dev/null; then
  echo "Warning: port $PORT is in use. Stop the other process (e.g. a previous file server) so webpack-dev-server can use it."
  echo "  Example: lsof -i :$PORT -sTCP:LISTEN -t | xargs kill"
  exit 1
fi

echo "Building web bundle..."
bazel build "$WEB_TARGET"

OUT_DIR="$ROOT_DIR/bazel-bin/valdi_modules/playground/playground_export_npm"
if [[ ! -d "$OUT_DIR" ]]; then
  OUT_DIR=$(bazel info bazel-bin 2>/dev/null)/valdi_modules/playground/playground_export_npm
fi
if [[ ! -d "$OUT_DIR" ]]; then
  echo "Error: could not find built output"
  exit 1
fi

export PLAYGROUND_NPM_PATH="$OUT_DIR"
export PORT="$PORT"

if [[ ! -d "$WEB_APP_DIR/node_modules" ]]; then
  echo "Installing web_app dependencies (npm install)..."
  (cd "$WEB_APP_DIR" && npm install --registry https://registry.npmjs.org/)
fi

echo "Starting webpack-dev-server (Playground app) at http://localhost:$PORT"
cd "$WEB_APP_DIR"
if [[ -x ./node_modules/.bin/webpack ]]; then
  exec ./node_modules/.bin/webpack serve --mode development
else
  exec npx --yes webpack serve --mode development
fi

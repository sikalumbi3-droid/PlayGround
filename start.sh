#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"
PORT="${PORT:-3000}"
export PORT

run() { /usr/bin/time -p "$@"; }

run npm install --no-audit --no-fund
run rm -rf "$PROJECT_DIR/dist"
run mkdir -p "$PROJECT_DIR/dist"
run cp "$PROJECT_DIR/index.html" "$PROJECT_DIR/dist/index.html"
run cp -R "$PROJECT_DIR/src" "$PROJECT_DIR/dist/src"
if [[ -d "$PROJECT_DIR/public" ]]; then
  run cp -R "$PROJECT_DIR/public" "$PROJECT_DIR/dist/public"
fi

metadata_dir="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
run mkdir -p "$metadata_dir"
run node -e 'const fs=require("node:fs"); const [project,directory,file]=process.argv.slice(1); fs.writeFileSync(file, JSON.stringify({project,directory}));' \
  "$PROJECT_DIR" "$PROJECT_DIR/dist" "$metadata_dir/deployment-output.json"

: "${RUNTIME_DIR:?RUNTIME_DIR must point to the runtime scripts}"
cd "$PROJECT_DIR/dist"
unset OPENCODE_WEB_DIR
exec /usr/bin/time -p node "$RUNTIME_DIR/scripts/default-start.mjs"

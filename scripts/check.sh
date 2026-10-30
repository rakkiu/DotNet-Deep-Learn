#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT/client"
npm run build
npm test
if [[ -z "${PLAYWRIGHT_CHROMIUM_EXECUTABLE:-}" ]] && command -v chromium >/dev/null 2>&1; then
  export PLAYWRIGHT_CHROMIUM_EXECUTABLE="$(command -v chromium)"
fi
npm run test:e2e

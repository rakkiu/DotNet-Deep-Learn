#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT/client"
[[ -d node_modules ]] || { echo 'Run ./scripts/setup.sh first.' >&2; exit 1; }
exec npm run dev -- --port "${PORT:-5080}" --strictPort

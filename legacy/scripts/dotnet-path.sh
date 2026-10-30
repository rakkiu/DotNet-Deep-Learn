#!/usr/bin/env bash
# Source from scripts in this repository. Does not change the user's shell profile.
if command -v dotnet >/dev/null 2>&1; then
  DOTNET_CMD="$(command -v dotnet)"
elif [[ -x /workspace/tooling/dotnet/dotnet ]]; then
  DOTNET_CMD=/workspace/tooling/dotnet/dotnet
else
  DOTNET_CMD="$REPO_ROOT/.tools/dotnet/dotnet"
fi
export DOTNET_CMD DOTNET_CLI_TELEMETRY_OPTOUT=1 DOTNET_NOLOGO=1

#!/usr/bin/env bash
# Zero-auth bootstrap for create-waf-stack (no npm registry token needed).
#
#   curl -fsSL https://raw.githubusercontent.com/david-jerry/create-waf-stack/main/create.sh | bash -s my-app
#
# Clones the generator to a temp dir and runs it, forwarding all args/flags.
set -euo pipefail

REPO="https://github.com/david-jerry/create-waf-stack.git"
REF="${CREATE_WAF_REF:-main}"

command -v git >/dev/null || { echo "git is required"; exit 1; }
command -v node >/dev/null || { echo "node >= 20 is required"; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "▸ Fetching create-waf-stack ($REF)…"
git clone --depth 1 --branch "$REF" "$REPO" "$TMP/gen" >/dev/null 2>&1

node "$TMP/gen/bin/index.mjs" "$@"

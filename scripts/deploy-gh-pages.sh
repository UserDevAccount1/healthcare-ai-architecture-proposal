#!/usr/bin/env bash
# Build the static site and publish ./out to the gh-pages branch.
# Used while GitHub Actions is unavailable on the account; Pages serves the gh-pages branch.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE="$(git -C "$ROOT" remote get-url origin)"
TMP="$(mktemp -d)"
cd "$ROOT"
NEXT_TELEMETRY_DISABLED=1 npm run build
cp -r out/. "$TMP"/
touch "$TMP/.nojekyll"
cd "$TMP"
git init -q -b gh-pages
git add -A
git -c core.autocrlf=false commit -q -m "Deploy $(git -C "$ROOT" rev-parse --short HEAD)"
git push -q -f "$REMOTE" gh-pages
rm -rf "$TMP"
echo "Deployed. Pages rebuilds in about a minute."

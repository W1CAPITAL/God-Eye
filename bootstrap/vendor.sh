#!/usr/bin/env bash
set -euo pipefail
UPSTREAM='https://github.com/bilawalsidhu/gods-eye-view.git'
PIN='e28df70fdb192b771f470b80e31413f3ea6ece6b'
if [[ -f .god-eye-imported ]]; then echo 'Already imported'; exit 0; fi
TEMP="$(mktemp -d)"
trap 'rm -rf "$TEMP"' EXIT
git -C "$TEMP" init -q
git -C "$TEMP" remote add origin "$UPSTREAM"
git -C "$TEMP" fetch --depth 1 origin "$PIN"
git -C "$TEMP" checkout -q FETCH_HEAD
# Import the complete tracked original while preserving W1CAPITAL's cloud adapters.
git -C "$TEMP" archive HEAD | tar -x -C . --exclude='./.github/*' --exclude='./bootstrap/*' --exclude='./api/*' --exclude='./vercel.json' --exclude='./README-BR.md' --exclude='./src/search/brazilGeocoder.js' --exclude='./src/search/brazilGeocoder.test.mjs'
node bootstrap/patch.mjs
printf 'Upstream %s\n' "$PIN" > .god-eye-imported
git add -A
git -c user.name='github-actions[bot]' -c user.email='41898282+github-actions[bot]@users.noreply.github.com' commit -m 'feat: import Gods Eye View and optimize Brazilian address search'
git push origin HEAD:main

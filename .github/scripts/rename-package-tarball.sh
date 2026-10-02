#!/usr/bin/env bash
# Rewrites every packed tarball in the given directory so that it publishes as
# $PACKAGE_NAME from $REPOSITORY. The rename happens on the tarball rather than
# in the workspace because the example, docs and headless apps depend on the
# @shopify/react-native-skia workspace, and yarn refuses to run once it is renamed.
set -euo pipefail

DIR="$1"
: "${PACKAGE_NAME:?PACKAGE_NAME is required}"
: "${REPOSITORY:?REPOSITORY is required}"

for TARBALL in "$DIR"/*.tgz; do
  WORK="$(mktemp -d)"
  tar -xzf "$TARBALL" -C "$WORK"
  node -e "
    const fs = require('fs');
    const file = process.argv[1];
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
    pkg.name = process.env.PACKAGE_NAME;
    pkg.repository = {
      type: 'git',
      url: 'git+https://github.com/' + process.env.REPOSITORY + '.git',
      baseUrl: 'https://github.com/' + process.env.REPOSITORY,
    };
    fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
  " "$WORK/package/package.json"
  sed -i "s#@shopify/react-native-skia#${PACKAGE_NAME}#g" \
    "$WORK/package/jestSetup.js" "$WORK/package/scripts/setup-canvaskit.js"
  VERSION="$(node -p "require(process.argv[1]).version" "$WORK/package/package.json")"
  rm "$TARBALL"
  tar -czf "$DIR/${PACKAGE_NAME}-${VERSION}.tgz" -C "$WORK" package
  rm -rf "$WORK"
  echo "Wrote $DIR/${PACKAGE_NAME}-${VERSION}.tgz"
done

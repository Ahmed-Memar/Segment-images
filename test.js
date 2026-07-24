npm version 0.2.2 --no-git-tag-version





node -p "require('./package.json').version"



"scripts": {
  "sec-audit": "node node_modules/apigeelint/cli.js -f table.js -x security-lint-plugins/",
  "scan": "node bin/apigeelint-security.js scan",
  "pack:check": "npm pack --dry-run",
  "prepare": "node -e \"require.resolve('apigeelint/cli.js')\""
}




APIGEELINT_SECURITY_REF: "v0.2.2"




node -e '
const p = require("./package.json");
console.log(JSON.stringify({
  version: p.version,
  dependencies: p.dependencies,
  bundledDependencies: p.bundledDependencies,
  prepare: p.scripts.prepare
}, null, 2));
'



rm -f apigeelint-security-plugins-0.2.1.tgz




npm ci --foreground-scripts




npm run scan -- apiproxies



npm run pack:check
npm pack




tar -tf apigeelint-security-plugins-0.2.2.tgz \
  | grep "node_modules/apigeelint/package.json"




git diff --check





git status
git diff --stat




grep -R -n \
  "apigeelint-security-plugins-0.2.1\|v0.2.1" \
  README.md \
  ci/apigeelint-security.yml \
  package.json
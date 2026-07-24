grep -n "npm install" ci/apigeelint-security.yml



node -e '
const p = require("./package.json");
console.log(JSON.stringify({
  dependencies: p.dependencies,
  devDependencies: p.devDependencies,
  bundleDependencies: p.bundleDependencies,
  bundledDependencies: p.bundledDependencies,
  scripts: p.scripts
}, null, 2));
'




{
  "dependencies": {
    "apigeelint": "VERSION_ACTUELLE"
  },
  "bundleDependencies": [
    "apigeelint"
  ]
}




node -p \
  "require('./package-lock.json').packages['node_modules/apigeelint'].version"



node -e '
const p = require("./package.json");
console.log(JSON.stringify({
  dependencies: p.dependencies,
  devDependencies: p.devDependencies,
  bundleDependencies: p.bundleDependencies,
  bundledDependencies: p.bundledDependencies
}, null, 2));
'




node -p \
  "require('./package-lock.json').packages['node_modules/apigeelint'].version"



grep -n "npm install" ci/apigeelint-security.yml
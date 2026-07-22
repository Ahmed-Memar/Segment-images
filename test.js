cd "$HOME/apigeelint-offline-test"

rm -rf node_modules package-lock.json
rm -rf "$HOME/apigeelint-empty-cache"

npm install --offline \
  --cache "$HOME/apigeelint-empty-cache" \
  --no-save \
  "$HOME/apigeelint-security-plugins/apigeelint-security-plugins-0.2.1.tgz"






./node_modules/.bin/apigeelint-security scan \
  "$HOME/consumer project/mybundles"
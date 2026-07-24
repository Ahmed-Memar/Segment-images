grep -nE "npm install|ignore-scripts|foreground-scripts" \
  ci/apigeelint-security.yml



sed -n '65,80p' ci/apigeelint-security.yml




rm -rf node_modules package-lock.json
rm -rf "$HOME/apigeelint-v022-empty-cache"



rm -f apigeelint-security-plugins-0.2.1.tgz


npm install \
  --offline \
  --cache "$HOME/apigeelint-v022-empty-cache" \
  --no-save \
  --package-lock=false \
  ./apigeelint-security-plugins-0.2.2.tgz





test -x ./node_modules/.bin/apigeelint-security \
  && echo "Scanner v0.2.2 installed successfully"




./node_modules/.bin/apigeelint-security scan mybundles




ls -lh \
  apigeelint-results.json \
  apigeelint-stderr.log \
  gl-sast-report.json




git status




git check-ignore -v \
  apigeelint-security-plugins-0.2.2.tgz




git diff -- package.json



git diff -- ci/apigeelint-security.yml




git diff -- README.md




git diff --check



git add \
  README.md \
  ci/apigeelint-security.yml \
  package.json \
  package-lock.json




git status
git diff --cached --check
git diff --cached --stat



git commit -m "Fix Git-based scanner installation in v0.2.2"




git status
git log -1 --oneline




git push origin docker-runtime




git tag -l v0.2.2




git tag -a v0.2.2 \
  -m "ApigeeLint security scanner v0.2.2"





git show v0.2.2 --no-patch
git push origin v0.2.2
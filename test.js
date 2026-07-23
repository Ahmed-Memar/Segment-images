grep -R -n \
  "apigeelint-security-plugins-0.2.0\|v0.2.0" \
  README.md \
  ci/apigeelint-security.yml \
  package.json \
  package-lock.json





grep -nE \
  '^  - release$|^publish_release:|package-tarball-name\.txt|packages/generic|projects/.*/releases' \
  .gitlab-ci.yml






grep -n "^publish_release:" .gitlab-ci.yml




tail -n 120 .gitlab-ci.yml


git diff --check



git diff --stat




git status




git add \
  .gitignore \
  .gitlab-ci.yml \
  README.md \
  ci/apigeelint-security.yml \
  package.json \
  package-lock.json




git diff --cached --stat
git status



git commit -m "Prepare ApigeeLint security scanner v0.2.1"
git push origin docker-runtime





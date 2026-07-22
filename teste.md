The package must contain the CLI, scanner script, converter, custom plugins
and the bundled runtime dependencies required for offline execution.

Test proxy bundles, CI configuration files and generated reports must not be
packaged.





### Validate the package contents

```bash
npm run pack:check
```

The package must contain the CLI, scanner script, converter, custom plugins
and the bundled runtime dependencies required for offline execution.

Test proxy bundles, CI configuration files and generated reports must not be
packaged.

Verify that ApigeeLint is included in the standalone package:

```bash
npm pack
tar -tf apigeelint-security-plugins-0.2.1.tgz \
  | grep "node_modules/apigeelint/package.json"
```

Expected result:

```text
package/node_modules/apigeelint/package.json
```








To publish a new scanner version:

1. set the scanner version in `package.json`;
2. update `package-lock.json`;
3. set the default version in `ci/apigeelint-security.yml`;
4. update the README examples;
5. run the local scan and package validation commands;
6. generate the standalone package with `npm pack`;
7. verify that the package can be installed with `npm install --offline`;
8. commit and push the changes;
9. verify that the GitLab pipeline succeeds;
10. merge the branch;
11. create and push the corresponding Git tag;
12. make the generated `.tgz` package available to consumers.
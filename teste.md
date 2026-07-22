### 2. Local execution — Optional

Local execution can be used to check Apigee proxies before pushing changes.

The standalone scanner package already contains ApigeeLint and its runtime
dependencies. No npm registry or Artifactory configuration is required.

Requirements:

- Node.js 20 or later;
- Bash or Git Bash;
- the standalone scanner package:

```text
apigeelint-security-plugins-0.2.1.tgz
```

Place the `.tgz` file in the project directory containing the proxies.

Install the scanner locally:

```bash
npm install --offline --no-save \
  ./apigeelint-security-plugins-0.2.1.tgz
```

Scan every proxy under a directory:

```bash
./node_modules/.bin/apigeelint-security scan apiproxies
```

Example with another directory name:

```bash
./node_modules/.bin/apigeelint-security scan mybundles
```

Scan one specific proxy:

```bash
./node_modules/.bin/apigeelint-security scan \
  path/to/my-proxy/apiproxy
```

The scanner recursively searches the provided path for directories named
`apiproxy`.

The scan generates:

```text
apigeelint-results.json
apigeelint-stderr.log
gl-sast-report.json
```

Do not commit:

```text
node_modules/
package-lock.json
apigeelint-results.json
apigeelint-stderr.log
gl-sast-report.json
apigeelint-security-plugins-0.2.1.tgz
```
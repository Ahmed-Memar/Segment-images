node "$APIGEELINT_CLI" \



APIGEELINT_CLI="$(
  node -e "process.stdout.write(require.resolve('apigeelint/cli.js', { paths: [process.argv[1]] }))" \
    "$PACKAGE_ROOT"
)"
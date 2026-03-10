const onProxyEndpoint = function (endpoint, cb) {

  debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);

  // Check if OASValidation policy exists in the bundle
  const policies = endpoint.parent.getPolicies()
    .filter(p => p.getType() === "OASValidation");

  // If no OASValidation policy → skip plugin
  if (policies.length === 0) {
    if (typeof cb === 'function') {
      cb(null, false);
    }
    return;
  }

  let checker = new SecurityLib.PolicyChecker(
    plugin,
    'OASValidation',
    debug,
    configCheckCallback
  );

  let hasIssue = checker.check(endpoint);

  if (typeof cb === 'function') {
    cb(null, hasIssue);
  }
};










const onProxyEndpoint = function(endpoint, cb) {

  debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);

  // Check if MessageValidation policy exists
  const policies = endpoint.parent.getPolicies()
    .filter(p => p.getType() === "MessageValidation");

  // If no MessageValidation policy → skip plugin
  if (policies.length === 0) {
    if (typeof cb === 'function') {
      cb(null, false);
    }
    return;
  }

  let checker = new SecurityLib.PolicyChecker(
    plugin,
    'MessageValidation',
    debug,
    configCheckCallback
  );

  let hasIssue = checker.check(endpoint);

  if(typeof cb == 'function') {
    cb(null, hasIssue);
  }
};
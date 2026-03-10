/**
 * EX-CS004
 * Data Schema Control
 *
 * Ensure that at least one schema validation policy exists
 */

const plugin = {
  ruleId: "EX-CS004",
  name: "Data Schema Control",
  message: "API must implement schema validation (OASValidation or MessageValidation)",
  fatal: false,
  severity: 2,
  nodeType: "Bundle",
  enabled: true
};

const onBundle = (bundle, cb) => {

  const policies = bundle.getPolicies();

  let hasOAS = false;
  let hasMV = false;

  policies.forEach(p => {
    const type = p.getType();

    if (type === "OASValidation") {
      hasOAS = true;
    }

    if (type === "MessageValidation") {
      hasMV = true;
    }
  });

  if (!hasOAS && !hasMV) {
    bundle.addMessage({
      plugin,
      message:
        "Data Schema Control failed: API must implement OASValidation (REST) or MessageValidation (SOAP/XML)"
    });
  }

  cb(null, false);
};

module.exports = {
  plugin,
  onBundle
};
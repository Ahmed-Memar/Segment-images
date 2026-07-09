const stableKey = `${ruleId}|${filePath}|${line}|${text}`;
const findingId = stableUuid(stableKey);
const findingIdentifier = `${ruleId}:${crypto
  .createHash("sha256")
  .update(text)
  .digest("hex")
  .slice(0, 12)}`;





id: findingId,




identifiers: [
  {
    type: "apigeelint_finding_id",
    name: `ApigeeLint finding ${ruleId}`,
    value: findingIdentifier,
    url: "https://github.com/apigee/apigeelint",
  },
  {
    type: "apigeelint_rule_id",
    name: `ApigeeLint rule ${ruleId}`,
    value: ruleId,
    url: "https://github.com/apigee/apigeelint",
  },
],
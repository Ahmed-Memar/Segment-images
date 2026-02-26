⁷const configCheckCallback = function (policy) {
  /*
    Goal (simple):
    - Ensure OASValidation is really validating the request body schema.
    - Option A (strict): do NOT allow headers/query/cookies that are not defined in the OpenAPI spec.
  */

  let compliant = true;

  // --- Block 1: ValidateMessageBody must exist and must be "true"
  // Why: If ValidateMessageBody is missing or set to false, the policy may only check that a body exists,
  //      but it will NOT validate the body against the OpenAPI schema.
  const vmb = xpath.select('/OASValidation/Options/ValidateMessageBody', policy.getElement());
  if (vmb.length === 0) {
    compliant = false;
    policy.addMessage({
      plugin: plugin,
      line: policy.getElement().lineNumber,
      column: policy.getElement().columnNumber,
      message:
        `Missing required element "Options/ValidateMessageBody" in policy "${policy.getName()}". ` +
        `It must be set to "true" to validate request body against the OpenAPI schema.`,
    });
  } else {
    const vmbValue = (vmb[0].firstChild && vmb[0].firstChild.data ? vmb[0].firstChild.data : '')
      .trim()
      .toLowerCase();

    if (vmbValue !== 'true') {
      compliant = false;
      policy.addMessage({
        plugin: plugin,
        line: vmb[0].lineNumber,
        column: vmb[0].columnNumber,
        message:
          `Misconfigured OASValidation policy "${policy.getName()}": ` +
          `"Options/ValidateMessageBody" must be "true" (currently "${vmbValue || 'empty'}").`,
      });
    }
  }

  // --- Block 2: AllowUnspecifiedParameters must exist (Option A)
  // Why: Option A needs an explicit configuration to block unspecified parameters.
  //      If this block is missing, we cannot guarantee strict behavior.
  const aup = xpath.select('/OASValidation/Options/AllowUnspecifiedParameters', policy.getElement());
  if (aup.length === 0) {
    compliant = false;
    policy.addMessage({
      plugin: plugin,
      line: policy.getElement().lineNumber,
      column: policy.getElement().columnNumber,
      message:
        `Missing required element "Options/AllowUnspecifiedParameters" in policy "${policy.getName()}". ` +
        `Option A requires Header/Query/Cookie to be explicitly set to "false".`,
    });
    return compliant; // Nothing else to validate under this node if it does not exist
  }

  // --- Block 3: Header / Query / Cookie must exist and must be "false" (Option A)
  // Why: In strict mode (Option A), the policy must FAIL when it receives unspecified parameters.
  //      Setting these to "false" ensures that behavior for each parameter location.
  ['Header', 'Query', 'Cookie'].forEach((tag) => {
    const node = xpath.select(`/OASValidation/Options/AllowUnspecifiedParameters/${tag}`, policy.getElement());

    if (node.length === 0) {
      compliant = false;
      policy.addMessage({
        plugin: plugin,
        line: aup[0].lineNumber,
        column: aup[0].columnNumber,
        message:
          `Missing required element "Options/AllowUnspecifiedParameters/${tag}" in policy "${policy.getName()}". ` +
          `Option A requires it to be set to "false".`,
      });
      return;
    }

    const value = (node[0].firstChild && node[0].firstChild.data ? node[0].firstChild.data : '')
      .trim()
      .toLowerCase();

    if (value !== 'false') {
      compliant = false;
      policy.addMessage({
        plugin: plugin,
        line: node[0].lineNumber,
        column: node[0].columnNumber,
        message:
          `Misconfigured OASValidation policy "${policy.getName()}": ` +
          `"Options/AllowUnspecifiedParameters/${tag}" must be "false" (currently "${value || 'empty'}").`,
      });
    }
  });

  return compliant;
};







<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ProxyEndpoint name="default">
  <PreFlow name="PreFlow">
    <Request>
      <Step>
        <Name>OAS-Validation</Name>
      </Step>
    </Request>
    <Response/>
  </PreFlow>

  <Flows/>

  <PostFlow name="PostFlow">
    <Request/>
    <Response/>
  </PostFlow>

  <HTTPProxyConnection>
    <BasePath>/test</BasePath>
    <VirtualHost>default</VirtualHost>
  </HTTPProxyConnection>

  <RouteRule name="default">
    <TargetEndpoint>default</TargetEndpoint>
  </RouteRule>

</ProxyEndpoint>





## Summary

This MR implements security rule EX-CS005 for OASValidation policy.

The control enforces a strict positive security model in enterprise context.

## Security Controls Implemented

- ValidateMessageBody must exist and be set to "true"
- AllowUnspecifiedParameters must exist
- Explicit per-location enforcement required:
  - Header = false
  - Query = false
  - Cookie = false

## Rationale

Per-location enforcement was chosen instead of global AllowUnspecifiedParameters=false to:

- Improve audit clarity
- Ensure explicit configuration
- Reduce attack surface
- Prevent HTTP parameter pollution
- Align with enterprise / banking AppSec posture

## Test Cases Added

- Missing ValidateMessageBody
- Invalid ValidateMessageBody
- Missing AllowUnspecifiedParameters
- Missing per-location element
- Invalid per-location value
- Fully valid strict configuration

All scenarios were tested using apigeelint CLI.
if (!hasAccessTokenValidation) {
  const verifyJwtNames = verifyJwtPolicies.map(
    policy => policy.getName()
  );

  details.push({
    message: verifyJwtNames.length > 0
      ? `VerifyJWT policy "${verifyJwtNames.join(', ')}" is present but not compliant`
      : 'missing access token validation policy (OAuthV2 VerifyAccessToken or VerifyJWT)',
    line: flow.lineNumber,
    column: flow.columnNumber
  });
}




const steps = getFlowRequestSteps(flow);

const flowPolicies = steps
  .map(step => getPolicyFromStep(endpoint, step))
  .filter(Boolean);

const verifyJwtPolicies = flowPolicies.filter(
  policy => policy.getType() === 'VerifyJWT'
);

const hasAccessTokenValidation = steps.some(step =>
  validPolicyNames.includes(getStepName(step))
);
// Check if OAuthV2 policy is used for VerifyAccessToken
const isVerifyAccessTokenPolicy = policy => {
  const el = policy.getElement();

  // Get Operation element only (standard Apigee format)
  const operationNode = xpath.select('/OAuthV2/Operation', el)[0];

  // Extract operation value safely
  const operationValue = getNodeText(operationNode);

  // Check if operation is VerifyAccessToken
  return /^VerifyAccessToken$/i.test(operationValue);
};
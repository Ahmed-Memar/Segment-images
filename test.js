const preFlowSteps = xpath.select('/ProxyEndpoint/PreFlow/Request/Step', proxyEl);

for (let i = 0; i < preFlowSteps.length; i++) {
  const step = preFlowSteps[i];

  const conditionNode = xpath.select('Condition', step)[0];
  const nameNode = xpath.select('Name', step)[0];

  const condition = (conditionNode && conditionNode.firstChild)
    ? conditionNode.firstChild.data.trim()
    : '';

  const stepName = (nameNode && nameNode.firstChild)
    ? nameNode.firstChild.data.trim()
    : '';

  if (conditionHasRequestVerb(condition)) {
    foundVerbCheck = true;
    foundPreFlowGuard = true;

    if (isRaiseFaultPolicyName(endpoint, stepName)) {
      foundRaiseFault = true;
    }

    if (conditionLooksLikeWsdlGetException(condition)) {
      foundWsdlGetException = true;
    }
  }

  if (isFlowCalloutPolicyName(endpoint, stepName)) {
    foundSharedFlowDelegation = true;
  }
}




const getPoliciesByType = function (endpoint, type) {
  return endpoint.parent.getPolicies().filter(p => p.getType() === type);
};


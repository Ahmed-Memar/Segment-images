const flows = xpath.select('/ProxyEndpoint/Flows/Flow', proxyEl);

for (let i = 0; i < flows.length; i++) {
  const flow = flows[i];

  const conditionNode = xpath.select('Condition', flow)[0];
  const condition = (conditionNode && conditionNode.firstChild)
    ? conditionNode.firstChild.data.trim()
    : '';

  let flowHasVerbCheck = false;

  if (conditionHasRequestVerb(condition)) {
    flowHasVerbCheck = true;
    foundVerbCheck = true;
  }

  // Check RaiseFault in steps
  const stepNames = xpath.select('Request/Step/Name', flow);

  let flowHasRaiseFault = false;

  for (let j = 0; j < stepNames.length; j++) {
    const stepName = stepNames[j].firstChild
      ? stepNames[j].firstChild.data.trim()
      : '';

    if (isRaiseFaultPolicyName(endpoint, stepName)) {
      flowHasRaiseFault = true;
      foundRaiseFault = true;
    }
  }

  // ❗ IMPORTANT
  if (!(flowHasVerbCheck && flowHasRaiseFault)) {
    allFlowsProtected = false;
  }
}
Remplace checkFlowsProtection par ça


const checkFlowsProtection = endpoint => {
  const flows = getFlows(endpoint);
  const invalidFlows = [];

  for (let flow of flows) {
    const flowName = flow.getAttribute('name') || 'UnnamedFlow';
    const flowLine = flow.lineNumber;
    const flowColumn = flow.columnNumber;

    const condition = getCondition(flow);
    const stepNames = xpath.select('Request/Step/Name', flow);

    const hasVerbCheck = conditionHasRequestVerb(condition);
    let hasRaiseFault = false;

    for (let step of stepNames) {
      const stepName = step.firstChild ? step.firstChild.data.trim() : '';
      if (isRaiseFaultPolicyName(endpoint, stepName)) {
        hasRaiseFault = true;
        break;
      }
    }

    if (!(hasVerbCheck && hasRaiseFault)) {
      invalidFlows.push({
        name: flowName,
        line: flowLine,
        column: flowColumn,
        hasVerbCheck,
        hasRaiseFault
      });
    }
  }

  return invalidFlows;
};






const invalidFlows = checkFlowsProtection(endpoint);

if (invalidFlows.length > 0) {
  invalidFlows.forEach(flow => {
    let details = [];

    if (!flow.hasVerbCheck) {
      details.push('missing request.verb condition');
    }
    if (!flow.hasRaiseFault) {
      details.push('missing RaiseFault policy');
    }

    endpoint.addMessage({
      plugin,
      line: flow.line,
      column: flow.column,
      message:
        `Flow "${flow.name}" is not compliant with HTTP method control: ` +
        `${details.join(' and ')}.`
    });
  });

  return cb(null, true);
}

return cb(null, false);
const steps = getFlowRequestSteps(flow) || [];

if (!stepsUseJSON(endpoint, steps)) {
  return {
    isValid: true,
    details: []
  };
}

const jsonSteps = steps.filter(step => stepUsesJSON(endpoint, step));

// ✅ FIX HERE
const jtpPolicies = steps
  .map(step => getPolicyFromStep(endpoint, step))
  .filter(policy => policy && policy.getType() === 'JSONThreatProtection');

if (jtpPolicies.length === 0) {
  return {
    isValid: false,
    details: jsonSteps.map(step => ({
      message: `Step "${getStepName(step)}" uses JSON but no JSONThreatProtection found in this flow`,
      line: step.lineNumber,
      column: step.columnNumber
    }))
  };
}




const jsonSteps = preFlowSteps.filter(step => stepUsesJSON(endpoint, step));

endpoint.addMessage({
  plugin,
  line: endpoint.getElement().lineNumber,
  column: endpoint.getElement().columnNumber,
  message: `PreFlow is not compliant: ${jsonSteps.map(s => `"${getStepName(s)}"`).join(', ')} use JSON but no JSONThreatProtection found`
});
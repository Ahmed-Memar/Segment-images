// Find all steps using JSON
const jsonSteps = steps.filter(step => stepUsesJSON(endpoint, step));

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
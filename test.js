return steps.some(step => {
  const condition = getCondition(step);

  if (isWsdlFlow(condition)) return false;

  const stepName = getStepName(step);

  return conditionHasRequestVerb(condition) &&
         isRaiseFaultPolicyUsed(endpoint, stepName);
});





const hasRF = steps.some(step =>
  isRaiseFaultPolicyUsed(endpoint, getStepName(step))
);


debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);



const details = [];





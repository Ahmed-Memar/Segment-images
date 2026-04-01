const steps = getPreFlowRequestSteps(endpoint);


steps.forEach(step => {
    const stepName = getStepName(step);
    ...
});




const invalidFlows = findFlowsNotMatching(endpoint, (stepName) => {
    return isRequestVerbCheck(stepName) && hasRaiseFault(stepName);
});



const invalidFlows = findFlowsNotMatching(endpoint, (stepName, step, flow) => {

    const condition = getCondition(flow);

    const hasVerb = requestVerbRegex.test(condition);
    const hasRF = isRaiseFaultPolicy(stepName);

    return hasVerb && hasRF;
});




const steps = getFlowRequestSteps(flow);

steps.forEach(step => {
    const stepName = getStepName(step);
});






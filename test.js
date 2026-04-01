const invalidFlows = findFlowsNotMatching(endpoint, (steps, flow) => {

    const condition = getCondition(flow);
    const hasVerb = requestVerbRegex.test(condition);

    let hasRF = false;
    let rfPolicyName = null;
    let rfLine = null;
    let rfColumn = null;

    steps.forEach(step => {
        const stepName = getStepName(step);

        if (isRaiseFaultPolicyUsed(endpoint, stepName)) {
            hasRF = true;
            rfPolicyName = stepName;
            rfLine = step.lineNumber;
            rfColumn = step.columnNumber;
        }
    });

    let details = [];

    if (!hasVerb) {
        details.push({
            message: 'missing request.verb condition',
            line: flow.lineNumber,
            column: flow.columnNumber
        });
    }

    if (!hasRF) {
        details.push({
            message: 'missing RaiseFault policy',
            line: flow.lineNumber,
            column: flow.columnNumber
        });
    }

    return {
        isValid: hasVerb && hasRF,
        details
    };
});
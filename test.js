const invalidFlows = findFlowsNotMatching(endpoint, (steps, flow) => {

    const condition = getCondition(flow);
    const hasVerb = requestVerbRegex.test(condition);

    let hasRF = false;

    steps.forEach(step => {
        const stepName = getStepName(step);

        if (isRaiseFaultPolicyUsed(endpoint, stepName)) {
            hasRF = true;
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









if (invalidFlows.length > 0) {
    ...
    return cb(null, true);
}

return cb(null, false);
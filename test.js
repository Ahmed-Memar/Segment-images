const findFlowsNotMatching = (endpoint, matcherFn) => {
    const flows = getFlows(endpoint);
    const invalidFlows = [];

    flows.forEach(flow => {
        const flowName = flow.getAttribute('name') || 'UnnamedFlow';
        const flowLine = flow.lineNumber;
        const flowColumn = flow.columnNumber;

        const steps = getFlowRequestSteps(flow);

        const result = matcherFn(steps, flow);

        if (!result.isValid) {
            invalidFlows.push({
                name: flowName,
                line: flowLine,
                column: flowColumn,
                details: result.details
            });
        }
    });

    return invalidFlows;
};
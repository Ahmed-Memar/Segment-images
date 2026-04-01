// 1. getPreFlowRequestSteps

const getPreFlowRequestSteps = endpoint =>
    xpath.select('/ProxyEndpoint/PreFlow/Request/Step', endpoint.getElement());


2. getFlowRequestSteps

const getFlowRequestSteps = flow =>
    xpath.select('Request/Step', flow);


3. findFlowsNotMatching

const findFlowsNotMatching = (endpoint, matcherFn) => {
    const flows = getFlows(endpoint);
    const invalidFlows = [];

    flows.forEach(flow => {
        const flowName = flow.getAttribute('name') || 'UnnamedFlow';
        const flowLine = flow.lineNumber;
        const flowColumn = flow.columnNumber;

        const steps = getFlowRequestSteps(flow);

        let isValid = false;

        steps.forEach(step => {
            const stepName = getStepName(step);
            if (matcherFn(stepName, step, flow)) {
                isValid = true;
            }
        });

        if (!isValid) {
            invalidFlows.push({
                name: flowName,
                line: flowLine,
                column: flowColumn
            });
        }
    });

    return invalidFlows;
};


    getPreFlowRequestSteps,
    getFlowRequestSteps,
    findFlowsNotMatching
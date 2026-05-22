const invalidFlows = endpoint.getFlows().filter(flow => {
    const condition = flow.getCondition();
    const expression = condition ? condition.getExpression() || '' : '';

    if (!BODY_METHOD_REGEX.test(expression)) {
        return false; // ignore GET etc
    }

    let hasJSON = preFlowHasJSON;
    let hasXML = preFlowHasXML;

    const steps = getFlowRequestSteps(flow.getElement()) || [];

    steps.forEach(step => {
        if (stepUsesJSON(endpoint, step)) {
            hasJSON = true;
        }
        if (stepUsesXML(endpoint, step)) {
            hasXML = true;
        }
    });

    return !hasJSON && !hasXML;
});
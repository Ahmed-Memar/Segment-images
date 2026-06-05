const expression = getCondition(flow) || '';

// Only body request flows are validated by default
if (!BODY_METHOD_REGEX.test(expression)) {
    return {
        isValid: true,
        details: []
    };
}

const steps = getFlowRequestSteps(flow) || [];

// If the flow clearly processes XML, let XMLThreatProtection plugin handle it
const xmlSteps = steps.filter(step =>
    stepRequiresXMLProtection(
        endpoint,
        step,
        variableRegistry
    )
);

if (xmlSteps.length > 0) {
    return {
        isValid: true,
        details: []
    };
}



if (jtpPolicies.length === 0) {
    return {
        isValid: false,
        details: [{
            line: flow.lineNumber,
            column: flow.columnNumber,
            severity: 'error',
            message:
                'may process a JSON request body by default ' +
                'but no JSONThreatProtection policy is applied'
        }]
    };
}
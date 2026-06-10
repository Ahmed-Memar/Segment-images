getCondition,
getPolicyFromStep


/**
 * Check whether flow is OPTIONS-only flow.
 *
 * @param {Node} flow
 * @returns {boolean}
 */
const isOptionsFlow = flow => {
    const condition = getCondition(flow);

    return /request\.verb\s*(?:=|==)\s*["']?OPTIONS["']?/i.test(condition);
};



/**
 * Check whether flow contains only RaiseFault policies.
 *
 * @param {Object} endpoint
 * @param {Node} flow
 * @returns {boolean}
 */
const isRaiseFaultOnlyFlow = (endpoint, flow) => {
    const steps = getFlowRequestSteps(flow);

    if (steps.length === 0) {
        return false;
    }

    return steps.every(step => {
        const policy = getPolicyFromStep(endpoint, step);

        return policy && policy.getType() === 'RaiseFault';
    });
};


if (isOptionsFlow(flow)) {
    return {
        isValid: true,
        details: []
    };
}

if (isRaiseFaultOnlyFlow(endpoint, flow)) {
    return {
        isValid: true,
        details: []
    };
}
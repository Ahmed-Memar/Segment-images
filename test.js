const getPoliciesFromStepsByType = (endpoint, steps, type) =>
    steps
        .map(step => getPolicyFromStep(endpoint, step))
        .filter(p => p && p.getType() === type);


getPoliciesFromStepsByType(endpoint, steps, 'JSONThreatProtection')



getPoliciesFromStepsByType(endpoint, steps, 'XMLThreatProtection')
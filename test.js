return {
    usesJson: true,
    severity: 'error',
    message: 'uses JSON but no JSONThreatProtection policy is applied'
};

return {
    usesJson: true,
    severity: 'warning',
    message: 'uses JSON from unknown source but no JSONThreatProtection policy is applied'
};

message:
    `Flow "${flow.name}" is not compliant: ` +
    `Step "${getStepName(detail.step)}" ${detail.message}`

details: jsonSteps.map(r => ({
    step: r.step,
    line: r.step.lineNumber,
    column: r.step.columnNumber,
    severity: r.analysis.severity,
    message: r.analysis.message
}))
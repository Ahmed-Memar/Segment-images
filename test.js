details: [{
    stepName: getStepName(step),
    line: step.lineNumber,
    column: step.columnNumber,
    message: 'uses JSON but no JSONThreatProtection policy is applied'
}]

details: [{
    stepName: getStepName(step),
    line: step.lineNumber,
    column: step.columnNumber,
    message: 'uses JSON from unknown source but no JSONThreatProtection policy is applied'
}]

line: r.line,
column: r.column,
message:
    `PreFlow is not compliant: ` +
    `Step "${r.stepName}" ${r.message}`

const messages = flow.details.map(d =>
    `Step "${d.stepName}" ${d.message}`
);
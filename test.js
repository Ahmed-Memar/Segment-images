endpoint.addMessage({
    plugin: usedPlugin,
    line: r.step.lineNumber,
    column: r.step.columnNumber,
    message:
        `PreFlow is not compliant: ` +
        `Step "${getStepName(r.step)}" ${r.analysis.message}`
});
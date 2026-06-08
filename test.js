// ===== PRE-FLOW JSON DETECTION =====

const preFlowJsonSteps = preFlowSteps
    .map(step => ({
        stepName: getStepName(step),
        line: step.lineNumber,
        column: step.columnNumber,
        analysis: stepUsesJSON(
            endpoint,
            step,
            variableRegistry
        )
    }))
    .filter(r =>
        r.analysis.usesJson &&
        r.analysis.severity !== 'ignore'
    );

if (preFlowJsonSteps.length > 0) {

    hasIssue = true;

    preFlowJsonSteps.forEach(r => {

        const usedPlugin =
            r.analysis.severity === 'warning'
                ? warningPlugin
                : plugin;

        endpoint.addMessage({
            plugin: usedPlugin,
            line: r.line,
            column: r.column,
            message:
                r.analysis.severity === 'warning'
                    ? `PreFlow may require manual review: Step "${r.stepName}" uses JSON from source "${r.analysis.source}"; unable to determine automatically whether JSONThreatProtection is required`
                    : `PreFlow is not compliant: Step "${r.stepName}" uses JSON but no JSONThreatProtection policy is applied`
        });

    });

}
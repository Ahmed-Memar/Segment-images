const warningSteps = warningDetails.map(
    detail => `Step "${detail.stepName}"`
);

endpoint.addMessage({
    plugin: warningPlugin,
    line: warningDetails[0].line,
    column: warningDetails[0].column,
    message:
        `Flow "${flow.name}" may require manual review: ` +
        `${warningSteps.join(', ')} use JSON but the source origin ` +
        `could not be automatically verified`
});
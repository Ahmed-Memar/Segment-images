const warningSteps = warningDetails.map(
    detail =>
        `Step "${detail.stepName}" uses JSON from source "${detail.source}"`
);

message:
    `Flow "${flow.name}" may require manual review: ` +
    `${warningSteps.join(' AND ')}; ` +
    'it could not be determined automatically whether JSONThreatProtection is required'
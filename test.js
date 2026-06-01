message:
    r.analysis.severity === 'warning'
        ? `PreFlow may require manual review: ` +
          `Step "${r.stepName}" uses JSON from source "${r.analysis.source}"; ` +
          'unable to determine automatically whether JSONThreatProtection is required'
        : `PreFlow is not compliant: ` +
          `Step "${r.stepName}" uses JSON but no JSONThreatProtection policy is applied`
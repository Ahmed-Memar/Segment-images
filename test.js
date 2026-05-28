message: `Step "${policy.getName()}" uses JSON but no JSONThreatProtection policy is applied`



message: `Step "${policy.getName()}" uses JSON from an unknown source but no JSONThreatProtection policy is applied`




message:
    r.analysis.severity === 'warning'
        ? `Step "${getStepName(r.step)}" uses JSON from an unknown source but no JSONThreatProtection policy is applied`
        : `Step "${getStepName(r.step)}" uses JSON but no JSONThreatProtection policy is applied`
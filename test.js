message:
    r.analysis.severity === 'warning'
        ? `uses JSON but the source origin could not be automatically verified; manual verification is recommended`
        : `uses JSON but no JSONThreatProtection policy is applied`
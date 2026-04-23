const classifyJwtAlgorithm = (algorithm) => {
  const value = (algorithm || '').trim().toUpperCase();

  const approvedRegex = /^(HS|PS|ES)(256|384|512)$/;
  const legacyRegex = /^RS(256|384|512)$/;

  if (approvedRegex.test(value)) {
    return { status: 'approved', family: value.slice(0, 2), value };
  }

  if (legacyRegex.test(value)) {
    return { status: 'legacy', family: 'RS', value };
  }

  if (value === 'NONE') {
    return { status: 'forbidden', family: null, value };
  }

  return { status: 'unsupported', family: null, value };
};

  return { status: 'unsupported', family: null, value };
};











const algorithmInfo = classifyJwtAlgorithm(algorithmValue)







// Validate Algorithm
if (!algorithmValue) {
  errors.push({
    line: getNodeLine(algorithmNode, policyLine),
    column: getNodeColumn(algorithmNode, policyColumn),
    message: `VerifyJWT policy "${policyName}" must define <Algorithm>.`
  });

} else {
  const { status, value } = algorithmInfo;

  if (status === 'forbidden') {
    errors.push({
      line: getNodeLine(algorithmNode, policyLine),
      column: getNodeColumn(algorithmNode, policyColumn),
      message: `VerifyJWT policy "${policyName}" must not use Algorithm "none".`
    });

  } else if (status === 'unsupported') {
    errors.push({
      line: getNodeLine(algorithmNode, policyLine),
      column: getNodeColumn(algorithmNode, policyColumn),
      message: `VerifyJWT policy "${policyName}" uses unsupported or forbidden Algorithm "${value}".`
    });

  } else if (status === 'legacy') {
    warnings.push({
      line: getNodeLine(algorithmNode, policyLine),
      column: getNodeColumn(algorithmNode, policyColumn),
      message: `VerifyJWT policy "${policyName}" uses legacy Algorithm "${value}". Prefer PS256 or ES256.`
    });
  }
}
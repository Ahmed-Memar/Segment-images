// Classify JWT algorithm (security-based, not just family)
const classifyJwtAlgorithm = algorithm => {
  const value = (algorithm || '').trim().toUpperCase();

  const approved = [
    'HS256', 'HS384', 'HS512',
    'PS256', 'PS384', 'PS512',
    'ES256', 'ES384', 'ES512'
  ];

  const legacy = [
    'RS256', 'RS384', 'RS512'
  ];

  if (approved.includes(value)) {
    return { status: 'approved', family: value.slice(0, 2), value };
  }

  if (legacy.includes(value)) {
    return { status: 'legacy', family: value.slice(0, 2), value };
  }

  if (value === 'NONE') {
    return { status: 'forbidden', family: null, value };
  }

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
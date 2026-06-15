const verifyJwtAnalyses = getPoliciesByType(endpoint, 'VerifyJWT')
  .map(policy => {
    const result = analyzeVerifyJwtPolicy(policy);

    console.log(
      'MAP RESULT =>',
      policy.getName(),
      result === undefined ? 'UNDEFINED' : 'OK'
    );

    return result;
  });
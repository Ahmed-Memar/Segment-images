console.log(verifyJwtAnalyses);

const validVerifyJwtPolicies = verifyJwtAnalyses
    .filter(result => result && result.isValid)
    .map(result => result.policy);
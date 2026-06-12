const verifyJwtAnalyses = getPoliciesByType(endpoint, 'VerifyJWT')
    .map(policy => {
        const result = analyzeVerifyJwtPolicy(policy);

        console.log(
            'policy:',
            policy.getName(),
            'result:',
            result
        );

        return result;
    });
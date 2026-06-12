if (!algorithmValue) {
    console.log('BEFORE ERROR PUSH');

    errors.push({
        line: policyLine,
        column: policyColumn,
        message: `VerifyJWT policy "${policyName}" must define <Algorithm>.`
    });

    console.log('AFTER ERROR PUSH');
}
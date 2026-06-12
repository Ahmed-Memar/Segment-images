// HS* requires <SecretKey>, while RS*/PS*/ES* require <PublicKey>.
// Mixing both families would require incompatible key types.
if (usesHS && usesAsymmetric) {
    errors.push({
        line: getNodeLine(algorithmNode, policyLine),
        column: getNodeColumn(algorithmNode, policyColumn),
        message: `VerifyJWT policy "${policyName}" mixes symmetric (HS*) and asymmetric (RS*/PS*/ES*) algorithms, which is not supported.`
    });
}
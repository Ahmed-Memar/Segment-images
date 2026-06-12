/**
 * Classify one or more JWT algorithms.
 *
 * @param {string} algorithms
 * @returns {{values:string[], results:object[], hasError:boolean, hasWarning:boolean}}
 */
const classifyJwtAlgorithms = algorithms => {
    const values = (algorithms || '')
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);

    const results = values.map(classifyJwtAlgorithm);

    return {
        values,
        results,
        hasError: results.some(r =>
            r.status === 'forbidden' ||
            r.status === 'unsupported'
        ),
        hasWarning: results.some(r =>
            r.status === 'legacy'
        )
    };
};



const { results, hasError, hasWarning } = algorithmInfo;



const forbiddenAlgorithms = results
    .filter(r => r.status === 'forbidden')
    .map(r => r.value);

const unsupportedAlgorithms = results
    .filter(r => r.status === 'unsupported')
    .map(r => r.value);

const legacyAlgorithms = results
    .filter(r => r.status === 'legacy')
    .map(r => r.value);

if (forbiddenAlgorithms.length > 0) {
    errors.push({
        line: getNodeLine(algorithmNode, policyLine),
        column: getNodeColumn(algorithmNode, policyColumn),
        message: `VerifyJWT policy "${policyName}" must not use Algorithm "none".`
    });
}

else if (unsupportedAlgorithms.length > 0) {
    errors.push({
        line: getNodeLine(algorithmNode, policyLine),
        column: getNodeColumn(algorithmNode, policyColumn),
        message: `VerifyJWT policy "${policyName}" uses unsupported Algorithm(s): "${unsupportedAlgorithms.join(', ')}".`
    });
}

else if (legacyAlgorithms.length > 0) {
    warnings.push({
        line: getNodeLine(algorithmNode, policyLine),
        column: getNodeColumn(algorithmNode, policyColumn),
        message: `VerifyJWT policy "${policyName}" uses legacy Algorithm(s): "${legacyAlgorithms.join(', ')}". Prefer PS(256|384|512) or ES(256|384|512).`
    });
}



const families = [
    ...new Set(
        algorithmInfo.results
            .map(r => r.family)
            .filter(Boolean)
    )
];





const usesHS = families.includes('HS');
const usesAsymmetric =
    families.includes('RS') ||
    families.includes('PS') ||
    families.includes('ES');




if (usesHS)



else if (usesAsymmetric)
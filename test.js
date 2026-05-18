const ruleId = 'EX-CS007';

const plugin = {
    ruleId,
    name: 'Data Schema Control',
    message: 'API must implement schema validation (OASValidation or MessageValidation)',
    fatal: false,
    severity: 2,
    nodeType: 'Bundle',
    enabled: true,
};

const BODY_METHOD_REGEX =
    /request\.verb\s*(?:=|==)\s*["']?(POST|PUT|PATCH)["']?/i;

const onBundle = (bundle, cb) => {

    const policies = bundle.getPolicies();

    const hasOAS = policies.some(
        p => p.getType() === 'OASValidation'
    );

    const hasMV = policies.some(
        p => p.getType() === 'MessageValidation'
    );

    // Detect flows using body-based HTTP methods
    const hasBodyMethod = bundle
        .getProxyEndpoints()
        .some(pe =>
            pe.getFlows().some(flow => {
                const condition = flow.getCondition();

                if (!condition) {
                    return false;
                }

                const expression = condition.getExpression() || '';

                return BODY_METHOD_REGEX.test(expression);
            })
        );

    // SOAP/XML APIs may legitimately only use GET
    if (hasMV && !hasBodyMethod) {
        return cb(null, false);
    }

    // No schema validation at all
    if (!hasOAS && !hasMV) {

        bundle.addMessage({
            plugin,
            message:
                'Missing schema validation policy: API must implement either ' +
                'OASValidation (REST) or MessageValidation (SOAP/XML).',
        });
    }

    cb(null, false);
};

module.exports = {
    plugin,
    onBundle,
};
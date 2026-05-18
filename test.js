const ruleId = 'EX-CS007';

/**
 * Plugin definition.
 *
 * This rule ensures that APIs implement at least one schema validation policy:
 * - OASValidation for REST/OpenAPI APIs
 * - MessageValidation for SOAP/XML APIs
 */
const plugin = {
    ruleId,
    name: 'Data Schema Control',
    message: 'API must implement schema validation (OASValidation or MessageValidation)',
    fatal: false,
    severity: 2,
    nodeType: 'Bundle',
    enabled: true,
};

/**
 * Regular expression used to detect HTTP methods
 * that usually contain a request body.
 *
 * Supported methods:
 * - POST
 * - PUT
 * - PATCH
 */
const BODY_METHOD_REGEX =
    /request\.verb\s*(?:=|==)\s*["']?(POST|PUT|PATCH)["']?/i;

/**
 * Main plugin entry point executed once per bundle.
 *
 * Logic:
 * - Detect if the bundle contains OASValidation policies
 * - Detect if the bundle contains MessageValidation policies
 * - Detect if flows use body-based HTTP methods (POST/PUT/PATCH)
 * - Skip SOAP/XML-only APIs that legitimately use GET only
 * - Report an issue if no schema validation policy exists
 *
 * @param {Object} bundle - ApigeeLint bundle object
 * @param {Function} cb - Callback function
 *
 * @returns {void}
 */
const onBundle = (bundle, cb) => {

    /**
     * All policies defined in the bundle.
     *
     * @type {Array<Object>}
     */
    const policies = bundle.getPolicies();

    /**
     * True if at least one OASValidation policy exists.
     *
     * @type {boolean}
     */
    const hasOAS = policies.some(
        p => p.getType() === 'OASValidation'
    );

    /**
     * True if at least one MessageValidation policy exists.
     *
     * @type {boolean}
     */
    const hasMV = policies.some(
        p => p.getType() === 'MessageValidation'
    );

    /**
     * Detect whether at least one flow uses
     * POST, PUT, or PATCH request methods.
     *
     * This helps distinguish REST APIs from SOAP/XML APIs.
     *
     * @type {boolean}
     */
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

    /**
     * SOAP/XML APIs may legitimately use only GET requests.
     *
     * In this case:
     * - MessageValidation is sufficient
     * - OASValidation is not required
     */
    if (hasMV && !hasBodyMethod) {
        return cb(null, false);
    }

    /**
     * Report issue if no schema validation policy exists.
     */
    if (!hasOAS && !hasMV) {

        bundle.addMessage({
            plugin,
            message:
                'Missing schema validation policy: API must implement either ' +
                'OASValidation (REST) or MessageValidation (SOAP/XML).',
        });
    }

    return cb(null, false);
};

module.exports = {
    plugin,
    onBundle,
};
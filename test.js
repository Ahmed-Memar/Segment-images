/**
 * Builds a lightweight registry of internally generated variables.
 *
 * Detects:
 * - ServiceCallout response variables
 *
 * Trust levels:
 * - internal  -> IGNORE
 * - external  -> ERROR
 * - unknown   -> WARNING
 *
 * @param {Object} endpoint - Apigee endpoint
 * @returns {Object} Variable registry map
 */
const buildVariableRegistry = function (endpoint) {

    const registry = {};

    const policies = endpoint.getPolicies ? endpoint.getPolicies() : [];

    policies.forEach(policy => {

        if (policy.getType() !== 'ServiceCallout') {
            return;
        }

        const element = policy.getElement();

        const responseNode = getFirstNode(
            '/ServiceCallout/Response',
            element
        );

        if (!responseNode) {
            return;
        }

        const variableName = getNodeText(responseNode).trim();

        let trust = 'unknown';

        // ===== TargetServer -> internal =====
        const targetServerNode = getFirstNode(
            '/ServiceCallout/HTTPTargetConnection/TargetServer',
            element
        );

        if (targetServerNode) {
            trust = 'internal';
        }

        // ===== LocalTargetConnection -> internal =====
        const localTargetNode = getFirstNode(
            '/ServiceCallout/LocalTargetConnection',
            element
        );

        if (localTargetNode) {
            trust = 'internal';
        }

        // ===== URL analysis =====
        const urlNode = getFirstNode(
            '/ServiceCallout/HTTPTargetConnection/URL',
            element
        );

        if (urlNode) {

            const url = getNodeText(urlNode).trim();

            // Dynamic URL
            if (url.includes('{')) {
                trust = 'unknown';
            }

            // Internal domains
            else if (
                url.includes('.internal') ||
                url.includes('.local') ||
                url.includes('localhost')
            ) {
                trust = 'internal';
            }

            // Hardcoded external URL
            else {
                trust = 'external';
            }
        }

        registry[variableName] = {
            type: 'ServiceCallout',
            trust
        };
    });

    return registry;
};

/**
 * Classifies ExtractVariables source origin.
 *
 * Rules:
 * - request/message => ERROR
 * - response/internal => IGNORE
 * - unknown => WARNING
 * - external ServiceCallout => ERROR
 *
 * @param {string} source
 * @param {Object} registry
 *
 * @returns {Object}
 */
const classifySource = function (source, registry) {

    const normalized = source.trim();

    // ===== ERROR =====

    if (
        normalized === 'message' ||
        normalized === 'message.content' ||
        normalized === 'request' ||
        normalized.startsWith('request.')
    ) {
        return {
            usesJson: true,
            severity: 'error',
            reason: `JSON source "${normalized}" comes from client request`
        };
    }

    // ===== IGNORE =====

    if (
        normalized === 'response' ||
        normalized.startsWith('response.') ||
        normalized.startsWith('AccessEntity.') ||
        normalized.startsWith('private.') ||
        normalized.startsWith('oauthv2.')
    ) {
        return {
            usesJson: true,
            severity: 'ignore',
            reason: `JSON source "${normalized}" is internal/backend data`
        };
    }

    // ===== Registry lookup =====

    const baseVariable = normalized.split('.')[0];

    const registryEntry = registry[baseVariable];

    if (registryEntry) {

        if (registryEntry.trust === 'internal') {

            return {
                usesJson: true,
                severity: 'ignore',
                reason: `JSON source "${normalized}" comes from internal ServiceCallout`
            };
        }

        if (registryEntry.trust === 'external') {

            return {
                usesJson: true,
                severity: 'error',
                reason: `JSON source "${normalized}" comes from external ServiceCallout`
            };
        }

        return {
            usesJson: true,
            severity: 'warning',
            reason: `JSON source "${normalized}" comes from unknown ServiceCallout`
        };
    }

    // ===== Unknown =====

    return {
        usesJson: true,
        severity: 'warning',
        reason: `JSON source "${normalized}" origin cannot be determined`
    };
};

/**
 * Determines whether a given Step uses JSON processing.
 *
 * Logic:
 * - ExtractVariables with JSONPayload
 * - JSON transformation policies
 * - AssignMessage setting Content-Type application/json
 *
 * @param {Object} endpoint - Apigee endpoint object
 * @param {Node} step - XML Step node
 * @param {Object} registry - Variable registry
 *
 * @returns {Object}
 */
const stepUsesJSON = function (endpoint, step, registry) {

    const policy = getPolicyFromStep(endpoint, step);

    if (!policy) {

        return {
            usesJson: false
        };
    }

    // ===== ExtractVariables =====

    if (policy.getType() === 'ExtractVariables') {

        const jsonPayload = getFirstNode(
            '/ExtractVariables/JSONPayload',
            policy.getElement()
        );

        if (!jsonPayload) {

            return {
                usesJson: false
            };
        }

        const sourceNode = getFirstNode(
            '/ExtractVariables/Source',
            policy.getElement()
        );

        // Default source = message
        const source = sourceNode
            ? getNodeText(sourceNode).trim()
            : 'message';

        return classifySource(source, registry);
    }

    // ===== JSON transformation =====

    if (['JSONToXML'].includes(policy.getType())) {

        return {
            usesJson: true,
            severity: 'error',
            reason: `Policy "${policy.getName()}" transforms JSON`
        };
    }

    // ===== AssignMessage =====

    if (policy.getType() === 'AssignMessage') {

        const headers = xpath.select(
            '/AssignMessage/Set/Headers/Header[@name="Content-Type" or @name="content-type"]',
            policy.getElement()
        );

        const usesJson = headers.some(h =>
            getNodeText(h)
                .toLowerCase()
                .includes('application/json')
        );

        if (!usesJson) {

            return {
                usesJson: false
            };
        }

        return {
            usesJson: true,
            severity: 'warning',
            reason: `AssignMessage sets Content-Type application/json`
        };
    }

    return {
        usesJson: false
    };
};

/**
 * Main plugin entry point executed for each ProxyEndpoint.
 *
 * @param {Object} endpoint
 * @param {Function} cb
 *
 * @returns {void}
 */
const onProxyEndpoint = function (endpoint, cb) {

    debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);

    let hasIssue = false;

    const variableRegistry = buildVariableRegistry(endpoint);

    // ===== PRE-FLOW CHECK =====

    const preFlowSteps = getPreFlowRequestSteps(endpoint) || [];

    const preFlowJTP = getPoliciesFromStepsByType(
        endpoint,
        preFlowSteps,
        'JSONThreatProtection'
    );

    // Global protection already exists
    if (preFlowJTP.length > 0) {

        preFlowJTP.forEach(policy => {

            if (!configCheckCallback(policy)) {
                hasIssue = true;
            }
        });

        return cb(null, hasIssue);
    }

    const preFlowJsonSteps = preFlowSteps
        .map(step => ({
            step,
            analysis: stepUsesJSON(
                endpoint,
                step,
                variableRegistry
            )
        }))
        .filter(r =>
            r.analysis.usesJson &&
            r.analysis.severity !== 'ignore'
        );

    if (preFlowJsonSteps.length > 0) {

        hasIssue = true;

        preFlowJsonSteps.forEach(r => {

            const usedPlugin =
                r.analysis.severity === 'warning'
                    ? warningPlugin
                    : plugin;

            endpoint.addMessage({
                plugin: usedPlugin,
                line: r.step.lineNumber,
                column: r.step.columnNumber,
                message: r.analysis.reason
            });
        });
    }

    // ===== FLOW CHECK =====

    const invalidFlows = findFlowsNotMatching(endpoint, (flow) => {

        const steps = getFlowRequestSteps(flow) || [];

        const jsonSteps = steps
            .map(step => ({
                step,
                analysis: stepUsesJSON(
                    endpoint,
                    step,
                    variableRegistry
                )
            }))
            .filter(r =>
                r.analysis.usesJson &&
                r.analysis.severity !== 'ignore'
            );

        if (jsonSteps.length === 0) {

            return {
                isValid: true,
                details: []
            };
        }

        const jtpPolicies = getPoliciesFromStepsByType(
            endpoint,
            steps,
            'JSONThreatProtection'
        );

        // ===== Missing protection =====

        if (jtpPolicies.length === 0) {

            return {
                isValid: false,
                details: jsonSteps.map(r => ({
                    line: r.step.lineNumber,
                    column: r.step.columnNumber,
                    severity: r.analysis.severity,
                    message: r.analysis.reason
                }))
            };
        }

        // ===== Invalid configuration =====

        const configValid = jtpPolicies.every(policy =>
            configCheckCallback(policy)
        );

        return {
            isValid: configValid,
            details: configValid
                ? []
                : jtpPolicies.map(policy => ({
                    line: flow.lineNumber,
                    column: flow.columnNumber,
                    severity: 'error',
                    message:
                        `Policy "${policy.getName()}" ` +
                        'has invalid JSONThreatProtection configuration'
                }))
        };
    });

    // ===== REPORT =====

    if (invalidFlows.length > 0) {

        hasIssue = true;

        invalidFlows.forEach(flow => {

            flow.details.forEach(detail => {

                const usedPlugin =
                    detail.severity === 'warning'
                        ? warningPlugin
                        : plugin;

                endpoint.addMessage({
                    plugin: usedPlugin,
                    line: detail.line,
                    column: detail.column,
                    message:
                        `Flow "${flow.name}" ` +
                        `is not compliant: ${detail.message}`
                });
            });
        });
    }

    return cb(null, hasIssue);
};
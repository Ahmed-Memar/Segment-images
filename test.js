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
            severity: 'error'
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
            severity: 'ignore'
        };
    }

    // ===== Registry lookup =====

    const baseVariable = normalized.split('.')[0];

    const registryEntry = registry[baseVariable];

    if (registryEntry) {

        if (registryEntry.trust === 'internal') {

            return {
                usesJson: true,
                severity: 'ignore'
            };
        }

        if (registryEntry.trust === 'external') {

            return {
                usesJson: true,
                severity: 'error'
            };
        }

        return {
            usesJson: true,
            severity: 'warning'
        };
    }

    // ===== Unknown =====

    return {
        usesJson: true,
        severity: 'warning'
    };
};




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
            severity: 'error'
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
            severity: 'warning'
        };
    }

    return {
        usesJson: false
    };
};




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
            stepName: getStepName(step),
            line: step.lineNumber,
            column: step.columnNumber,
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
                line: r.line,
                column: r.column,
                message:
                    `PreFlow is not compliant: ` +
                    `Step "${r.stepName}" uses JSON ` +
                    `but no JSONThreatProtection policy is applied`
            });
        });
    }

    // ===== FLOW CHECK =====

    const invalidFlows = findFlowsNotMatching(endpoint, (flow) => {

        const steps = getFlowRequestSteps(flow) || [];

        const jsonSteps = steps
            .map(step => ({
                stepName: getStepName(step),
                line: step.lineNumber,
                column: step.columnNumber,
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
                    line: r.line,
                    column: r.column,
                    severity: r.analysis.severity,
                    stepName: r.stepName,
                    message:
                        `uses JSON but no ` +
                        `JSONThreatProtection policy is applied`
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
                        `has invalid JSONThreatProtection configuration`
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
                        detail.stepName
                            ? `Flow "${flow.name}" is not compliant: ` +
                              `Step "${detail.stepName}" ${detail.message}`
                            : `Flow "${flow.name}" is not compliant: ` +
                              `${detail.message}`
                });
            });
        });
    }

    return cb(null, hasIssue);
};
// --- Block 1: Ensure ValidateMessageBody is present and set to "true" ---
// The policy must validate the request body against the OpenAPI schema.

const vmbNode = SecurityLib.getFirstNode(
    '/OASValidation/Options/ValidateMessageBody',
    el
);

if (!vmbNode) {
    compliant = false;

    policy.addMessage({
        plugin: plugin,
        line: el.lineNumber,
        column: el.columnNumber,
        message:
            'Missing required element "Options/ValidateMessageBody" in policy "OAS-Validation". ' +
            'It must be set to "true" to validate request body against the OpenAPI schema.',
    });
} else {
    const vmbValue = SecurityLib.getNodeText(vmbNode)
        .toLowerCase();

    if (vmbValue !== 'true') {
        compliant = false;

        policy.addMessage({
            plugin: plugin,
            line: vmbNode.lineNumber,
            column: vmbNode.columnNumber,
            message:
                'Misconfigured OASValidation policy: ' +
                '"Options/ValidateMessageBody" must be "true" ' +
                `(currently "${vmbValue || 'empty'}").`,
        });
    }
}


// --- Block 2: Validate AllowUnspecifiedParameters ---
// Query must be "false" (error)
// Cookie should be "false" (warning)
// Header is ignored

const aupNode = SecurityLib.getFirstNode(
    '/OASValidation/Options/AllowUnspecifiedParameters',
    el
);

if (!aupNode) {
    compliant = false;

    policy.addMessage({
        plugin: plugin,
        line: el.lineNumber,
        column: el.columnNumber,
        message:
            'Missing required element "Options/AllowUnspecifiedParameters" in policy "OAS-Validation". ' +
            'Requires explicit "Query" configuration.',
    });

} else {

    ['Query', 'Cookie'].forEach((tag) => {

        const node = SecurityLib.getFirstNode(
            `/OASValidation/Options/AllowUnspecifiedParameters/${tag}`,
            el
        );

        if (!node) {

            if (tag === 'Query') {

                compliant = false;

                policy.addMessage({
                    plugin: plugin,
                    line: aupNode.lineNumber,
                    column: aupNode.columnNumber,
                    message:
                        'OASValidation missing required parameter: ' +
                        '"AllowUnspecifiedParameters/Query".',
                });

            } else if (tag === 'Cookie') {

                policy.addMessage({
                    plugin: warningPlugin,
                    line: aupNode.lineNumber,
                    column: aupNode.columnNumber,
                    message:
                        'OASValidation recommendation: ' +
                        'Missing parameter "AllowUnspecifiedParameters/Cookie".',
                });
            }

            return;
        }

        const value = SecurityLib.getNodeText(node)
            .toLowerCase();

        if (value !== 'false') {

            if (tag === 'Query') {

                compliant = false;

                policy.addMessage({
                    plugin: plugin,
                    line: node.lineNumber,
                    column: node.columnNumber,
                    message:
                        'Misconfigured OASValidation policy: ' +
                        '"Options/AllowUnspecifiedParameters/Query" must be "false". ' +
                        `(currently "${value || 'empty'}").`,
                });

            } else if (tag === 'Cookie') {

                policy.addMessage({
                    plugin: warningPlugin,
                    line: node.lineNumber,
                    column: node.columnNumber,
                    message:
                        'OASValidation recommendation: ' +
                        '"Options/AllowUnspecifiedParameters/Cookie" should be set to "false". ' +
                        `(currently "${value || 'empty'}").`,
                });
            }
        }
    });
}
const configCheckCallback = function (policy) {

    let compliant = true;
    const el = policy.getElement();

    // --- Block 1: Ensure ResourceURL exists
    // Why: Without ResourceURL the policy only checks well-formed XML/JSON.

    const resourceNode = getFirstNode('/MessageValidation/ResourceURL', el);

    if (!resourceNode) {
        compliant = false;

        policy.addMessage({
            plugin,
            line: el.lineNumber,
            column: el.columnNumber,
            message:
                `Missing required element "ResourceURL" in MessageValidation policy "${policy.getName()}". ` +
                `Schema validation requires a ResourceURL referencing an XSD or WSDL.`,
        });

        return compliant;
    }

    // --- Block 2: Ensure ResourceURL uses xsd:// or wsdl://
    // Why: Only these resource types enable schema validation.

    const resourceValue = getNodeText(resourceNode)
        .trim()
        .toLowerCase();

    if (
        !resourceValue.startsWith('xsd://') &&
        !resourceValue.startsWith('wsdl://')
    ) {
        compliant = false;

        policy.addMessage({
            plugin,
            line: resourceNode.lineNumber,
            column: resourceNode.columnNumber,
            message:
                `Invalid ResourceURL "${resourceValue}" in MessageValidation policy "${policy.getName()}". ` +
                `ResourceURL must start with "xsd://" or "wsdl://".`,
        });
    }

    // --- Block 3: Validate SOAPMessage and Element when using WSDL
    // Why: SOAP validation requires SOAPMessage version and Element target.

    if (resourceValue.startsWith('wsdl://')) {

        const soapNode = getFirstNode('/MessageValidation/SOAPMessage', el);

        if (!soapNode) {
            compliant = false;

            policy.addMessage({
                plugin,
                line: resourceNode.lineNumber,
                column: resourceNode.columnNumber,
                message:
                    `Missing required element "SOAPMessage" for WSDL validation ` +
                    `in policy "${policy.getName()}".`,
            });
        }

        const elementNode = getFirstNode('/MessageValidation/Element', el);

        if (!elementNode) {
            compliant = false;

            policy.addMessage({
                plugin,
                line: resourceNode.lineNumber,
                column: resourceNode.columnNumber,
                message:
                    `Missing required element "Element" in MessageValidation policy ` +
                    `"${policy.getName()}" when using WSDL.`,
            });
        }
    }

    // --- Block 4: Recommend explicit Source element
    // Why: Defining Source explicitly improves validation clarity.

    const sourceNode = getFirstNode('/MessageValidation/Source', el);

    if (!sourceNode) {

        policy.addMessage({
            plugin: warningPlugin,
            line: el.lineNumber,
            column: el.columnNumber,
            message:
                `MessageValidation recommendation: "Source" element should be explicitly defined ` +
                `(request or response) in policy "${policy.getName()}".`,
        });
    }

    return compliant;
};
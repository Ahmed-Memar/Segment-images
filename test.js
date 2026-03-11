// --- Block 4: Require Element when validating SOAP via WSDL
// Why: Element restricts validation to a specific SOAP operation.

if (value.startsWith('wsdl://')) {

  let element = xpath.select('/MessageValidation/Element', el);

  if (element.length === 0) {

    policy.addMessage({
      plugin: plugin,
      line: resource[0].lineNumber,
      column: resource[0].columnNumber,
      message:
        'Missing required "Element" in MessageValidation policy "' + policy.getName() +
        '" when using WSDL. Element is required to restrict validation to a specific SOAP operation.'
    });

  }
}
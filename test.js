// --- Block 3 & 4 merged: Validate SOAPMessage and Element when using WSDL
// Why: SOAP validation requires SOAPMessage to define version and Element to target operation.

if (value.startsWith('wsdl://')) {

  let soap = xpath.select('/MessageValidation/SOAPMessage', el);
  if (soap.length === 0) {
    compliant = false;

    policy.addMessage({
      plugin: plugin,
      line: resource[0].lineNumber,
      column: resource[0].columnNumber,
      message:
        `Missing required element "SOAPMessage" for WSDL validation in policy "${policy.getName()}".`,
    });
  }

  let element = xpath.select('/MessageValidation/Element', el);
  if (element.length === 0) {

    policy.addMessage({
      plugin: plugin,
      line: resource[0].lineNumber,
      column: resource[0].columnNumber,
      message:
        'Missing required "Element" in MessageValidation policy "' +
        policy.getName() +
        '" when using WSDL.',
    });
  }

}
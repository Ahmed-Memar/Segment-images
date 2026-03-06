const configCheckCallback = function (policy) {

  let compliant = true;

  // --- Block 1: Ensure ResourceURL exists
  // Why: Without ResourceURL the policy only checks well-formed XML/JSON.

  let resource = xpath.select('/MessageValidation/ResourceURL', policy.getElement());

  if (resource.length === 0) {
    compliant = false;

    policy.addMessage({
      plugin: plugin,
      line: policy.getElement().lineNumber,
      column: policy.getElement().columnNumber,
      message:
        `Missing required element "ResourceURL" in MessageValidation policy "${policy.getName()}". ` +
        `Schema validation requires a ResourceURL referencing an XSD or WSDL.`,
    });

    return compliant;
  }


  // --- Block 2: Ensure ResourceURL uses xsd:// or wsdl://
  // Why: Only these resource types enable schema validation.

  const value = (resource[0].firstChild && resource[0].firstChild.data
      ? resource[0].firstChild.data
      : '')
    .trim()
    .toLowerCase();

  if (!(value.startsWith('xsd://') || value.startsWith('wsdl://'))) {

    compliant = false;

    policy.addMessage({
      plugin: plugin,
      line: resource[0].lineNumber,
      column: resource[0].columnNumber,
      message:
        `Invalid ResourceURL "${value}" in MessageValidation policy "${policy.getName()}". ` +
        `ResourceURL must start with "xsd://" or "wsdl://".`,
    });
  }


  // --- Block 3: If wsdl:// is used, ensure SOAPMessage exists
  // Why: SOAP validation requires SOAPMessage to define the SOAP version.

  if (value.startsWith('wsdl://')) {

    let soap = xpath.select('/MessageValidation/SOAPMessage', policy.getElement());

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
  }


  // --- Block 4: Recommend Element when validating SOAP
  // Why: Element restricts validation to a specific SOAP operation.

  if (value.startsWith('wsdl://')) {

    let element = xpath.select('/MessageValidation/Element', policy.getElement());

    if (element.length === 0) {

      policy.addMessage({
        plugin: warningPlugin,
        line: resource[0].lineNumber,
        column: resource[0].columnNumber,
        message:
          `SOAP validation recommendation: ` +
          `"Element" should be defined in MessageValidation policy "${policy.getName()}" ` +
          `to restrict validation to a specific SOAP operation.`,
      });
    }
  }


  // --- Block 5: Recommend explicit Source element
  // Why: Defining Source explicitly improves validation clarity.

  let source = xpath.select('/MessageValidation/Source', policy.getElement());

  if (source.length === 0) {

    policy.addMessage({
      plugin: warningPlugin,
      line: policy.getElement().lineNumber,
      column: policy.getElement().columnNumber,
      message:
        `MessageValidation recommendation: ` +
        `"Source" element should be explicitly defined (request or response) ` +
        `in policy "${policy.getName()}".`,
    });
  }

  return compliant;
};
const configCheckCallback = function (policy) {

  const element = policy.getElement();

  // 🔴 ERROR fields (critical)
  const errorFields = [
    'ContainerDepth'
  ];

  // 🟠 WARNING fields (business dependent)
  const warningFields = [
    'ObjectEntryCount',
    'StringValueLength',
    'ArrayElementCount'
  ];

  const getFieldNodes = (field) =>
    xpath.select(`/JSONThreatProtection/${field}`, element);

  let hasError = false;

  // 🔴 Check ERROR fields
  const missingErrorFields = errorFields.filter(field => {
    return getFieldNodes(field).length === 0;
  });

  if (missingErrorFields.length > 0) {
    hasError = true;

    policy.addMessage({
      plugin: plugin,
      line: element.lineNumber,
      column: element.columnNumber,
      message: `JSONThreatProtection "${policy.getName()}" is missing required field(s): ${missingErrorFields.join(', ')}`
    });
  }

  // 🟠 Check WARNING fields
  const missingWarningFields = warningFields.filter(field => {
    return getFieldNodes(field).length === 0;
  });

  if (missingWarningFields.length > 0) {
    policy.addMessage({
      plugin: warningPlugin,
      line: element.lineNumber,
      column: element.columnNumber,
      message: `JSONThreatProtection "${policy.getName()}" is missing recommended field(s): ${missingWarningFields.join(', ')}`
    });
  }

  return !hasError;
};
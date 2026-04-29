const configCheckCallback = function (policy) {

  const requiredCritical = [
    'ContainerDepth',
    'ObjectEntryCount',
    'StringValueLength'
  ];

  const optional = [
    'ArrayElementCount',
    'ObjectEntryNameLength'
  ];

  const allFields = [...requiredCritical, ...optional];

  const element = policy.getElement();

  // Check presence of fields
  const presentFields = allFields.filter(field => {
    const nodes = xpath.select(`/JSONThreatProtection/${field}`, element);
    return nodes.length > 0;
  });

  // ❌ ERROR → no configuration at all
  if (presentFields.length === 0) {
    policy.addMessage({
      plugin: plugin,
      line: element.lineNumber,
      column: element.columnNumber,
      message: `JSONThreatProtection "${policy.getName()}" has no configuration defined`
    });
    return false;
  }

  // ⚠️ WARNING → missing critical fields
  const missingCritical = requiredCritical.filter(field => {
    const nodes = xpath.select(`/JSONThreatProtection/${field}`, element);
    return nodes.length === 0;
  });

  if (missingCritical.length > 0) {
    policy.addMessage({
      plugin: warningPlugin, // 👈 use warning severity
      line: element.lineNumber,
      column: element.columnNumber,
      message: `JSONThreatProtection "${policy.getName()}" is missing critical configuration: ${missingCritical.join(', ')}`
    });
  }

  // ✅ Considered compliant (not blocking)
  return false;
};
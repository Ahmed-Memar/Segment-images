// FAIL: no request.verb at all
if (!foundVerbCheck) {
  endpoint.addMessage({
    plugin: plugin,
    line: proxyLine,
    column: proxyColumn,
    message:
      'SOAP API does not implement explicit HTTP method control. ' +
      'No condition referencing "request.verb" was found.'
  });

  if (typeof cb === 'function') {
    cb(null, true);
  }
  return;
}

// FAIL: request.verb but no RaiseFault
if (!foundRaiseFault) {
  endpoint.addMessage({
    plugin: plugin,
    line: proxyLine,
    column: proxyColumn,
    message:
      'HTTP method check detected for SOAP API, but no RaiseFault policy was found. ' +
      'Unsupported methods may reach backend.'
  });

  if (typeof cb === 'function') {
    cb(null, true);
  }
  return;
}

// ✅ NEW LOGIC

// If PreFlow is protected → PASS
if (foundPreFlowGuard && foundRaiseFault) {
  if (typeof cb === 'function') {
    cb(null, false);
  }
  return;
}

// Otherwise → all flows must be protected
if (!allFlowsProtected) {
  endpoint.addMessage({
    plugin: plugin,
    line: proxyLine,
    column: proxyColumn,
    message:
      'HTTP method control is not consistently applied across all flows. ' +
      'Each flow must validate request.verb and reject invalid methods.'
  });

  if (typeof cb === 'function') {
    cb(null, true);
  }
  return;
}

// PASS
if (typeof cb === 'function') {
  cb(null, false);
}
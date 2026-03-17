if (!hasVerbCondition) {
  endpoint.addMessage({
    plugin: plugin,
    line: endpoint.lineNumber,
    column: endpoint.columnNumber,
    message: 'No HTTP method control detected. Proxy does not check "request.verb".'
  });
} else if (hasAssignMessage && !(hasCatchAllRaiseFault || hasGlobalRaiseFault)) {
  endpoint.addMessage({
    plugin: warningPlugin,
    line: endpoint.lineNumber,
    column: endpoint.columnNumber,
    message: 'AssignMessage used for method control without RaiseFault. AssignMessage alone may not terminate the request.'
  });
} else if (!(hasCatchAllRaiseFault || hasGlobalRaiseFault)) {
  endpoint.addMessage({
    plugin: plugin,
    line: endpoint.lineNumber,
    column: endpoint.columnNumber,
    message: 'HTTP methods may fall through to backend. Missing catch-all flow with RaiseFault.'
  });
}
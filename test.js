if (!hasVerbCondition) {

  endpoint.addMessage({
    plugin,
    message: 'No HTTP method control detected. Proxy does not check "request.verb".'
  });

} else if (!hasCatchAllRaiseFault) {

  if (hasAssignMessage) {

    endpoint.addMessage({
      plugin: warningPlugin,
      message: 'AssignMessage used without RaiseFault for method control.'
    });

  } else {

    endpoint.addMessage({
      plugin,
      message: 'HTTP methods may fall through to backend. Missing catch-all flow with RaiseFault.'
    });

  }

}
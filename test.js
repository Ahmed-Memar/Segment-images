if (node.length === 0) {

  if (tag === 'Query') {
    compliant = false;

    policy.addMessage({
      plugin: plugin,
      line: aup[0].lineNumber,
      column: aup[0].columnNumber,
      message:
        `OASValidation misconfiguration: Missing "AllowUnspecifiedParameters/Query".`,
    });

  } else if (tag === 'Cookie') {

    policy.addMessage({
      plugin: warningPlugin,
      line: aup[0].lineNumber,
      column: aup[0].columnNumber,
      message:
        `OASValidation recommendation: "AllowUnspecifiedParameters/Cookie" should be set to "false".`,
    });

  }

  return;
}
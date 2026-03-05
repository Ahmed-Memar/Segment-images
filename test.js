const aup = xpath.select('/OASValidation/Options/AllowUnspecifiedParameters', el);

if (aup.length === 0) {
  compliant = false;

  policy.addMessage({
    plugin: plugin,
    line: el.lineNumber,
    column: el.columnNumber,
    message:
      'Missing required element "Options/AllowUnspecifiedParameters" in policy "OAS-Validation". ' +
      'Strict mode requires explicit Query/Cookie configuration.',
  });

} else {

  ['Query', 'Cookie'].forEach((tag) => {

    const node = xpath.select(`/OASValidation/Options/AllowUnspecifiedParameters/${tag}`, el);

    if (node.length === 0) {
      compliant = false;

      policy.addMessage({
        plugin: plugin,
        line: aup[0].lineNumber,
        column: aup[0].columnNumber,
        message:
          `OASValidation misconfiguration: Missing "AllowUnspecifiedParameters/${tag}".`,
      });

      return;
    }

    const value = (
      node[0].firstChild && node[0].firstChild.data
        ? node[0].firstChild.data
        : ''
    )
      .trim()
      .toLowerCase();

    if (value !== 'false') {

      if (tag === 'Query') {

        compliant = false;

        policy.addMessage({
          plugin: plugin,
          line: node[0].lineNumber,
          column: node[0].columnNumber,
          message:
            'Misconfigured OASValidation policy: ' +
            '"Options/AllowUnspecifiedParameters/Query" must be "false". ' +
            'Query parameters must be explicitly documented in the OpenAPI specification ' +
            `(currently "${value || 'empty'}").`,
        });

      } else if (tag === 'Cookie') {

        policy.addMessage({
          plugin: warningPlugin,
          line: node[0].lineNumber,
          column: node[0].columnNumber,
          message:
            'OASValidation recommendation: ' +
            '"Options/AllowUnspecifiedParameters/Cookie" should be set to "false". ' +
            'Unexpected cookies may appear due to browsers or infrastructure components ' +
            `(currently "${value || 'empty'}").`,
        });

      }

    }

  });

}

return compliant;
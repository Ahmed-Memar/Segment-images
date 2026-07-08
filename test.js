// Report VerifyJWT errors and warnings directly on the related policy file
verifyJwtAnalyses.forEach(result => {
  const target = result.policy || endpoint;

  result.errors.forEach(issue => {
    hasErrors = true;

    target.addMessage({
      plugin,
      line: issue.line,
      column: issue.column,
      message: issue.message
    });
  });

  result.warnings.forEach(issue => {
    target.addMessage({
      plugin: warningPlugin,
      line: issue.line,
      column: issue.column,
      message: issue.message
    });
  });
});
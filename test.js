/**
   * Detect whether at least one flow uses
   * POST, PUT, or PATCH request methods.
   */
  const hasBodyMethod = endpoint.getFlows().some(flow => {
    const condition = flow.getCondition();

    if (!condition) {
      return false;
    }

    const expression = condition.getExpression() || '';
    return BODY_METHOD_REGEX.test(expression);
  });

  // If no body-related HTTP methods are detected, skip plugin
  if (!hasBodyMethod) {
    return cb(null, []);
  }
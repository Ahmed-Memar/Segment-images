bundle.getProxyEndpoints().forEach(pe => {
  pe.getFlows().forEach(flow => {
    const condition = flow.getCondition();

    if (condition) {
      const conditionStr = condition.getExpression() || "";
      const verbRegex = /request\.verb\s*(?:=|==)\s*['"]?(POST|PUT|PATCH)['"]?/i;

      if (verbRegex.test(conditionStr)) {
        hasBodyMethod = true;
      }
    }
  });
});
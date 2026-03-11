bundle.getProxyEndpoints().forEach(pe => {
  pe.getFlows().forEach(flow => {

    const condition = flow.getCondition() ? flow.getCondition().toString().toUpperCase() : "";

    if (
      condition.includes('"POST"') ||
      condition.includes('"PUT"') ||
      condition.includes('"PATCH"')
    ) {
      hasBodyMethod = true;
    }

  });
});
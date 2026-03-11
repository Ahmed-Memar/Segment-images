bundle.getProxyEndpoints().forEach(pe => {
  pe.getFlows().forEach(flow => {

    const condition = flow.getCondition() ? flow.getCondition().toString() : "";

    if (condition) {

      const bodyMethods = ["POST", "PUT", "PATCH"];

      bodyMethods.forEach(method => {

        if (condition.toUpperCase().includes(method)) {
          hasBodyMethod = true;
        }

      });

    }

  });
});
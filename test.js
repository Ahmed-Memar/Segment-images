const proxies = bundle.getProxyEndpoints();

proxies.forEach(proxy => {
  const flows = proxy.getFlows();

  flows.forEach(flow => {
    const cond = flow.getCondition() || "";

    if (/request\.verb\s*=\s*"(POST|PUT|PATCH)"/i.test(cond)) {
      hasBodyMethod = true;
    }
  });
});
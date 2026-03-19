const getPoliciesByType = function (endpoint, type) {
  const policies = endpoint.parent.getPolicies();

  policies.forEach(p => {
    console.log("DEBUG POLICY →", p.getName(), p.getType());
  });

  return policies.filter(p => p.getType() === type);
};


const getPoliciesByType = function (endpoint, type) {
  return endpoint.parent.getPolicies().filter(p => p.getType() === type);
};


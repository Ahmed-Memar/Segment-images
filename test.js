// ===== Generic Helpers =====

const hasPolicyType = (endpoint, type) =>
  endpoint.parent.getPolicies().some(p => p.getType() === type);

const getPoliciesByType = (endpoint, type) =>
  endpoint.parent.getPolicies().filter(p => p.getType() === type);

const getFlows = (endpoint, xpath) =>
  xpath.select('/ProxyEndpoint/Flows/Flow', endpoint.getElement());

const getCondition = (node, xpath) => {
  const condNodes = xpath.select('Condition', node);
  if (!condNodes || condNodes.length === 0) return '';
  const condNode = condNodes[0];
  return (condNode && condNode.firstChild)
    ? condNode.firstChild.data.trim()
    : '';
};

const getStepName = (node, xpath) => {
  const nameNodes = xpath.select('Name', node);
  if (!nameNodes || nameNodes.length === 0) return '';
  const nameNode = nameNodes[0];
  return (nameNode && nameNode.firstChild)
    ? nameNode.firstChild.data.trim()
    : '';
};
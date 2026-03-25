const getFlows = endpoint =>
  xpath.select('/ProxyEndpoint/Flows/Flow', endpoint.getElement());

const getCondition = node => {
  const condNodes = xpath.select('Condition', node);
  if (!condNodes || condNodes.length === 0) return '';
  const condNode = condNodes[0];
  return (condNode && condNode.firstChild)
    ? condNode.firstChild.data.trim()
    : '';
};

const getStepName = node => {
  const nameNodes = xpath.select('Name', node);
  if (!nameNodes || nameNodes.length === 0) return '';
  const nameNode = nameNodes[0];
  return (nameNode && nameNode.firstChild)
    ? nameNode.firstChild.data.trim()
    : '';
};
/**
 * Check whether an XML node contains at least one element child.
 *
 * @param {Object} node
 * @returns {boolean}
 */
const hasChildElement = node =>
  node &&
  Array.from(node.childNodes || []).some(child => child.nodeType === 1);



const hasDefaultFaultRule = endpoint => {
  const el = endpoint.getElement();
  const rootName = getEndpointRootName(endpoint);

  const defaultFaultRule =
    getFirstNode(`/${rootName}/DefaultFaultRule`, el);

  return hasChildElement(defaultFaultRule);
};



const hasNonEmptyFaultRules = endpoint => {
  const el = endpoint.getElement();
  const rootName = getEndpointRootName(endpoint);

  const faultRule =
    getFirstNode(`/${rootName}/FaultRules/FaultRule`, el);

  return hasChildElement(faultRule);
};
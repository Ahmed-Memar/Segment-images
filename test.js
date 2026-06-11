const audienceNode = getFirstNode('/VerifyJWT/Audience', el);
const audienceValue =
  getNodeText(audienceNode) ||
  (audienceNode && audienceNode.getAttribute('ref'));

const issuerNode = getFirstNode('/VerifyJWT/Issuer', el);
const issuerValue =
  getNodeText(issuerNode) ||
  (issuerNode && issuerNode.getAttribute('ref'));
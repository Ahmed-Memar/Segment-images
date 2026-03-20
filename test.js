const hasGetExceptionAnnotation = endpoint => {
  const el = endpoint.getElement();
  const desc = xpath.select('/ProxyEndpoint/Description', el)[0];

  if (!desc || !desc.firstChild) return false;

  const text = desc.firstChild.data.toLowerCase();

  return text.includes('apigeelit:allow-method:get:wsdl');
};
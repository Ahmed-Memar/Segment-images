const requestVerbRegex = /\brequest\.verb\b\s*(==|!=)\s*".+"/i;

const conditionHasRequestVerb = condition =>
  typeof condition === 'string' && requestVerbRegex.test(condition);


const wsdlRegex = /(\.wsdl\b|request\.queryparam\.(wsdl|xsd)\b)/i;

const isWsdlFlow = condition =>
  typeof condition === 'string' && wsdlRegex.test(condition);
/**
 * Check whether the endpoint defines at least one FaultRule
 * containing at least one child element.
 *
 * Invalid:
 * <FaultRules/>
 *
 * Invalid:
 * <FaultRules>
 *   <FaultRule/>
 * </FaultRules>
 *
 * Valid:
 * <FaultRules>
 *   <FaultRule>
 *     <Step>...</Step>
 *   </FaultRule>
 * </FaultRules>
 *
 * @param {Object} endpoint
 * @returns {boolean}
 */
const hasNonEmptyFaultRules = endpoint => {
  const el = endpoint.getElement();
  const rootName = getEndpointRootName(endpoint);

  const faultRule =
    getFirstNode(`/${rootName}/FaultRules/FaultRule`, el);

  return hasChildElement(faultRule);
};






/**
 * Check whether the endpoint defines a DefaultFaultRule
 * containing at least one child element.
 *
 * Invalid:
 * <DefaultFaultRule/>
 *
 * Valid:
 * <DefaultFaultRule>
 *   <Step>...</Step>
 * </DefaultFaultRule>
 *
 * @param {Object} endpoint
 * @returns {boolean}
 */
const hasDefaultFaultRule = endpoint => {
  const el = endpoint.getElement();
  const rootName = getEndpointRootName(endpoint);

  const defaultFaultRule =
    getFirstNode(`/${rootName}/DefaultFaultRule`, el);

  return hasChildElement(defaultFaultRule);
};
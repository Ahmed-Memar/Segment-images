/**
 * Returns true if the Step uses XML processing that requires XMLThreatProtection.
 *
 * @param {Object} endpoint
 * @param {Node} step
 * @param {Object<string, string>} registry
 *
 * @returns {boolean}
 */
const stepRequiresXMLProtection = function (endpoint, step, registry) {
    const analysis = stepUsesXML(endpoint, step, registry);

    return analysis.usesXML === true &&
        analysis.severity !== 'ignore';
};
/**
 * Returns true if the Step uses JSON processing.
 *
 * @param {Object} endpoint
 * @param {Node} step
 *
 * @returns {boolean}
 */
const stepHasJSON = (endpoint, step) =>
    stepUsesJSON(endpoint, step, {}).usesJson === true;

/**
 * Returns true if the Step uses XML processing.
 *
 * @param {Object} endpoint
 * @param {Node} step
 *
 * @returns {boolean}
 */
const stepHasXML = (endpoint, step) =>
    stepUsesXML(endpoint, step, {}).usesXML === true;



if (stepHasJSON(endpoint, step)) {
    preFlowHasJSON = true;
}

if (stepHasXML(endpoint, step)) {
    preFlowHasXML = true;
}


if (stepHasJSON(endpoint, step)) {
    hasJSON = true;
}

if (stepHasXML(endpoint, step)) {
    hasXML = true;
}
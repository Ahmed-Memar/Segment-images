/**
 * Validates the configuration of a JSONThreatProtection policy.
 *
 * Rules:
 * - ERROR if required protection fields are missing.
 * - WARNING if recommended protection fields are missing.
 *
 * Required fields:
 * - ContainerDepth
 *
 * Recommended fields:
 * - ArrayElementCount
 * - ObjectEntryCount
 * - StringValueLength
 *
 * @param {Object} policy ApigeeLint policy object.
 * @param {Function} policy.getElement Returns the XML DOM element.
 * @param {Function} policy.getName Returns the policy name.
 * @param {Function} policy.addMessage Adds a lint message.
 *
 * @returns {boolean}
 * Returns true when all required fields are present,
 * false otherwise.
 */



/**
 * Builds a registry of variables produced by ServiceCallout policies.
 *
 * The registry is later used to determine the trust level of
 * ExtractVariables and JSONToXML sources.
 *
 * Trust levels:
 * - internal : trusted source (ignored)
 * - external : untrusted source (error)
 * - unknown  : source cannot be determined automatically (warning)
 *
 * Detection rules:
 * - LocalTargetConnection => internal
 * - URL containing .internal, .local or localhost => internal
 * - URL containing variables ({...}) => unknown
 * - Hardcoded external URL => external
 *
 * @param {Object} endpoint Apigee endpoint object.
 *
 * @returns {Object<string, {
 *   type: string,
 *   trust: 'internal' | 'external' | 'unknown'
 * }>}
 * Registry indexed by variable name.
 */



// ===== Determine ServiceCallout trust level =====



// Explicit external URL
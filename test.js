const trust = registry[baseVariable];

if (trust) {

    if (trust === 'internal') {


if (trust === 'external') {


/**
 * Builds a registry of variables produced by ServiceCallout policies.
 *
 * The registry is used to determine the trust level of sources used by
 * ExtractVariables and JSONToXML policies.
 *
 * Trust levels:
 * - internal: trusted source, ignored
 * - external: untrusted source, reported as error
 * - unknown : source cannot be verified automatically, reported as warning
 *
 * Detection rules:
 * - LocalTargetConnection => internal
 * - URL containing ".internal", ".local" or "localhost" => internal
 * - URL containing variables "{...}" => unknown
 * - Explicit external URL => external
 * - LoadBalancer/Server without resolvable URL => unknown
 *
 * @param {Object} endpoint Apigee endpoint object.
 *
 * @returns {Object<string, 'internal' | 'external' | 'unknown'>}
 * Registry indexed by variable name.
 */



/**
 * Classifies the origin and severity of a JSON source.
 *
 * Rules:
 * - request/message sources => error
 * - response and Apigee internal variables => ignore
 * - ServiceCallout source from registry:
 *   - internal => ignore
 *   - external => error
 *   - unknown  => warning
 * - unknown custom source => warning
 *
 * @param {string} source Source value from ExtractVariables or JSONToXML.
 * @param {Object<string, 'internal' | 'external' | 'unknown'>} registry
 * Registry returned by buildVariableRegistry().
 *
 * @returns {{
 *   usesJson: boolean,
 *   severity: 'error' | 'warning' | 'ignore',
 *   source: string
 * }}
 * Classification result.
 */
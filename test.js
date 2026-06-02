/**
 * Determines whether a Step processes JSON content.
 *
 * Supported policies:
 * - ExtractVariables with JSONPayload
 * - JSONToXML
 * - AssignMessage with Payload contentType="application/json"
 *
 * For ExtractVariables and JSONToXML, the source is analyzed
 * to determine whether it is trusted, untrusted, or unknown.
 *
 * @param {Object} endpoint Apigee endpoint object.
 * @param {Node} step XML Step node.
 * @param {Object<string, 'internal' | 'external' | 'unknown'>} registry
 * Variable trust registry built from ServiceCallout policies.
 *
 * @returns {{
 *   usesJson: boolean,
 *   severity?: 'error' | 'warning' | 'ignore',
 *   source?: string
 * }}
 * Analysis result.
 */


// ===== JSONToXML =====


// ===== AssignMessage =====
// Detects JSON payload creation:
// <Payload contentType="application/json">
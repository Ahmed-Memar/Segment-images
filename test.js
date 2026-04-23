/**
 * Analyze VerifyJWT policy
 *
 * @param {Object} policy - Apigee policy object
 * @returns {{
 *   policy: Object,
 *   isValid: boolean, // true if no errors
 *   errors: Array<{line: number, column: number, message: string}>,
 *   warnings: Array<{line: number, column: number, message: string}>
 * }}
 */
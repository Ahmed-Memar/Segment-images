/**
 * Classify a single JWT algorithm.
 *
 * @param {string} algorithm Algorithm value from policy.
 * @returns {{
 *   status: string,
 *   family: string|null,
 *   value: string
 * }}
 */


/**
 * Classify one or more JWT algorithms.
 *
 * @param {string} algorithms Comma-separated algorithm list.
 *
 * @returns {{
 *   values: string[],       // Original algorithms after split and trim
 *   results: object[],      // Classification result for each algorithm
 *   hasError: boolean,      // True if at least one algorithm is forbidden or unsupported
 *   hasWarning: boolean     // True if at least one algorithm is legacy
 * }}
 */



/**
 * Classify one or more JWT algorithms.
 *
 * @param {string} algorithms Comma-separated algorithm list.
 *
 * @returns {{
 *   values: string[],
 *   results: {
 *     status: string,
 *     family: string|null,
 *     value: string
 *   }[],
 *   hasError: boolean,
 *   hasWarning: boolean
 * }}
 */
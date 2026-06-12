/**
 * Classify one or more JWT algorithms.
 *
 * @param {string} algorithms Comma-separated algorithm list.
 * @returns {{
 *   values: string[],
 *   results: {
 *     status: string,
 *     family: string|null,
 *     value: string
 *   }[]
 * }}
 */
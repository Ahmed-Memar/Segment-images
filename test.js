/**
 * Classify a single JWT algorithm.
 *
 * @param {string} algorithm Algorithm value from policy.
 * @returns {{
 *   status: string,      // approved | legacy | forbidden | unsupported
 *   family: string|null, // HS | RS | PS | ES or null
 *   value: string        // normalized algorithm value
 * }}
 */



/**
 * Classify one or more JWT algorithms.
 *
 * @param {string} algorithms Comma-separated algorithm list.
 * @returns {{
 *   values: string[], // algorithms after split and trim
 *   results: {
 *     status: string,
 *     family: string|null,
 *     value: string
 *   }[]
 * }}
 */






mixes symmetric (HS*) and asymmetric (RS*/PS*/ES*) algorithms, which may lead to inconsistent key requirements.
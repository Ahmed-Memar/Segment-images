/**
 * Apply matcherFn to each flow and collect invalid ones
 *
 * @param {Function} matcherFn
 * Function used to validate a flow based on its Request steps
 *
 * matcherFn arguments:
 * - steps: Array
 *   Array of Request Step elements (Element[])
 * - flow: Element
 *   Flow XML element
 *
 * matcherFn return:
 * - isValid: boolean
 * - details: Array
 *   Array of {message: string, line: number, column: number}
 *
 * @returns {Array}
 * Array of invalid flows:
 * - name: string
 * - line: number
 * - column: number
 * - details: Array
 */
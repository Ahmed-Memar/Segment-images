/**
 * Apply matcherFn to each flow and collect invalid ones
 *
 * @param {(steps: Array<Element>, flow: Element) => {isValid: boolean, details: Array<{message: string, line: number, column: number}>}} matcherFn
 * Function used to validate a flow based on its Request steps
 *
 * @returns {Array<{name: string, line: number, column: number, details: Array}>}
 * List of invalid flows with metadata and validation details
 */
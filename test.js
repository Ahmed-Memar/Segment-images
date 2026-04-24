/**
 * Extract text content from an XML node
 * @param {Object} node - XML node
 * @returns {string} Trimmed text or empty string
 */
const getNodeText = (node) =>
  node && node.firstChild && node.firstChild.data
    ? node.firstChild.data.trim()
    : '';

/**
 * Get first node from XPath query
 * @param {string} path - XPath expression
 * @param {Object} el - XML element
 * @returns {Object|undefined} First matching node or undefined
 */
const getFirstNode = (path, el) => xpath.select(path, el)[0];

/**
 * Get node line number with fallback
 * @param {Object} node
 * @param {number} fallbackLine
 * @returns {number}
 */
const getNodeLine = (node, fallbackLine) =>
  node && node.lineNumber ? node.lineNumber : fallbackLine;

/**
 * Get node column number with fallback
 * @param {Object} node
 * @param {number} fallbackColumn
 * @returns {number}
 */
const getNodeColumn = (node, fallbackColumn) =>
  node && node.columnNumber ? node.columnNumber : fallbackColumn;
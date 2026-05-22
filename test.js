message: 'JSON/XML threat protection could not be verified automatically.'


/**
 * Checks whether a flow condition indicates
 * an HTTP method that usually carries a request body.
 *
 * Supported methods: POST, PUT, PATCH
 *
 * @param {string} condition - Flow condition expression
 * @returns {boolean}
 */
function mayContainRequestBody(condition) {
  return BODY_METHOD_REGEX.test(condition || '');
}


// Reuse JSON/XML detection logic from threat protection plugins
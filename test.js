const text = htmlEncode(message.message || "ApigeeLint finding");



/**
 * Encodes special HTML characters so GitLab displays them as plain text
 * instead of interpreting them as HTML tags.
 *
 * @param {string} text Text to encode.
 * @returns {string} HTML-encoded text.
 */
function htmlEncode(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
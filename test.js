

1️⃣ parseTimeAllowanceToSeconds

/**
 * Parse TimeAllowance value into seconds
 * Supports units: s (seconds), m (minutes), h (hours), d (days)
 *
 * @param {string} rawValue - raw TimeAllowance value (e.g. "10m", "1h")
 * @returns {number|null} time in seconds or null if invalid
 */


---

2️⃣ hasHardcodedValue

/**
 * Check if a node contains a hardcoded <Value> (no ref attribute)
 *
 * @param {Object} parentNode - XML parent node
 * @returns {boolean} true if value is hardcoded, false otherwise
 */


---

3️⃣ hasSecretKey

/**
 * Check if VerifyJWT policy contains a usable SecretKey
 *
 * @param {Object} el - VerifyJWT XML element
 * @returns {boolean} true if SecretKey is present and valid
 */


---

4️⃣ hasPublicKey

/**
 * Check if VerifyJWT policy contains a usable PublicKey
 * Supports Value, Certificate, or JWKS
 *
 * @param {Object} el - VerifyJWT XML element
 * @returns {boolean} true if PublicKey configuration is valid
 */


---

5️⃣ analyzeVerifyJwtPolicy

/**
 * Analyze VerifyJWT policy configuration
 * Validates algorithm, keys, audience, time allowance and security rules
 *
 * @param {Object} policy - Apigee policy object
 * @returns {Object} result
 * @returns {Object} result.policy - original policy
 * @returns {boolean} result.isValid - true if no errors
 * @returns {Array<Object>} result.errors - list of errors
 * @returns {Array<Object>} result.warnings - list of warnings
 */
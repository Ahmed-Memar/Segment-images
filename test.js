🧩 1. Header du fichier (à ajouter en haut)

/**
 * EX-CS009 - Access Token Control
 *
 * This plugin validates that APIs enforce access token validation
 * using OAuthV2 (VerifyAccessToken) or VerifyJWT policies.
 *
 * It also checks that VerifyJWT policies are correctly configured
 * according to security rules (algorithm, key, audience, etc.).
 */


---

🧩 2. Helper simple

🔹 getNodeText

/**
 * Extract text content from an XML node
 *
 * @param {Object} node - XML node
 * @returns {string} Trimmed text content or empty string if not found
 */
const getNodeText = (node) =>
  node && node.firstChild && node.firstChild.data
    ? node.firstChild.data.trim()
    : '';


---

🧩 3. Fonction métier

🔹 isVerifyAccessTokenPolicy

/**
 * Check if an OAuthV2 policy is configured for VerifyAccessToken
 *
 * @param {Object} policy - Apigee policy object
 * @returns {boolean} True if policy operation is VerifyAccessToken
 */
const isVerifyAccessTokenPolicy = (policy) => {
  ...
};


---

🧩 4. Fonction principale récupération policies

🔹 getValidAccessTokenPolicies

/**
 * Retrieve all access token validation policies (OAuthV2 and VerifyJWT)
 *
 * @param {Object} endpoint - Apigee endpoint object
 * @returns {Array<Object>} List of policies used for access token validation
 */
const getValidAccessTokenPolicies = (endpoint) => {
  ...
};


---

🧩 5. Vérification PreFlow

/**
 * Check if access token validation is enforced in PreFlow
 *
 * @param {Object} endpoint - Apigee endpoint object
 * @returns {boolean} True if validation exists in PreFlow
 */
const checkPreFlowProtection = (endpoint) => {
  ...
};


---

🧩 6. Fonction principale du plugin

🔹 onProxyEndpoint

/**
 * Main plugin entry point for ProxyEndpoint
 *
 * Validates that:
 * - Access token validation policy exists
 * - Validation is enforced in PreFlow or flows
 * - All flows are protected
 *
 * @param {Object} endpoint - Apigee endpoint object
 * @param {Function} cb - Callback function (error, result)
 * @returns {void}
 */
const onProxyEndpoint = function (endpoint, cb) {
  ...
};


---

🧩 7. Classification des algorithmes (IMPORTANT)

/**
 * Classify JWT algorithm based on security level
 *
 * @param {string} algorithm - Algorithm value from VerifyJWT policy
 * @returns {{
 *   status: 'approved' | 'legacy' | 'forbidden' | 'unsupported',
 *   family: string | null,
 *   value: string
 * }}
 */
const classifyJwtAlgorithm = (algorithm) => {
  ...
};


---

🧩 8. Vérification clé

/**
 * Check if a SecretKey is defined in policy
 *
 * @param {Object} el - XML element of policy
 * @returns {boolean} True if SecretKey exists
 */
const hasSecretKey = (el) => { ... };

/**
 * Check if a PublicKey is defined in policy
 *
 * @param {Object} el - XML element of policy
 * @returns {boolean} True if PublicKey exists
 */
const hasPublicKey = (el) => { ... };


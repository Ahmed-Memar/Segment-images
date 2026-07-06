/**
 * Resolves the most relevant location file for a finding.
 * If the message contains a policy name, the finding is linked to the
 * corresponding policy XML file instead of the proxy default.xml file.
 *
 * @param {string} filePath Original file path from ApigeeLint.
 * @param {string} messageText ApigeeLint finding message.
 * @returns {string} Best file path to use in the GitLab SAST location.
 */
function resolveLocationFile(filePath, messageText) {
  const normalizedFilePath = normalizePath(filePath);
  const policyMatch = String(messageText).match(/policy\s+"([^"]+)"/i);

  if (!policyMatch) {
    return normalizedFilePath;
  }

  const policyName = policyMatch[1];

  const apiproxyIndex = normalizedFilePath.indexOf("/apiproxy/");

  if (apiproxyIndex === -1) {
    return normalizedFilePath;
  }

  const proxyRoot = normalizedFilePath.slice(0, apiproxyIndex + "/apiproxy/".length);

  return `${proxyRoot}policies/${policyName}.xml`;
}






const locationFile = resolveLocationFile(filePath, message.message || "");




const stableKey = `${ruleId}|${locationFile}|${line}|${text}`;





location: {
  file: locationFile,
  start_line: line,
  end_line: line,
},
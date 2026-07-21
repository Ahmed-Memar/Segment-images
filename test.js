/**
 * Returns the current UTC timestamp in the format required by
 * the GitLab security report schema.
 *
 * @returns {string} Timestamp formatted as YYYY-MM-DDTHH:mm:ss.
 */
function getTimestamp() {
  return new Date()
    .toISOString()
    .replace(/\.\d{3}Z$/, "");
}




node --check convert-apigeelint-to-gitlab-sast.js




npm run scan -- apiproxies





node -e "const r=require('./gl-sast-report.json'); console.log('start_time:', r.scan.start_time); console.log('end_time:', r.scan.end_time)"






node -e "const r=require('./gl-sast-report.json'); const p=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/; if(!p.test(r.scan.start_time)||!p.test(r.scan.end_time)){console.error('Invalid GitLab timestamps');process.exit(1)} console.log('GitLab timestamps valid')"






rm -f apigeelint-results.json apigeelint-stderr.log gl-sast-report.json
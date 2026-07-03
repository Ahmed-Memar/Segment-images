validate-sast.js


const fs = require("fs");
const Ajv = require("ajv");

const schema = JSON.parse(fs.readFileSync("sast-report-format.json", "utf8"));
const report = JSON.parse(fs.readFileSync("gl-sast-report.json", "utf8"));

const ajv = new Ajv({
  allErrors: true,
  strict: false
});

const validate = ajv.compile(schema);

if (validate(report)) {
  console.log("✅ SAST report is valid");
} else {
  console.log("❌ Validation failed:");
  console.log(validate.errors);
}



https://gitlab.com/gitlab-org/security-products/security-report-schemas/-/raw/master/dist/sast-report-format.json




sast-report-format.json


npm install ajv


node validate-sast.js
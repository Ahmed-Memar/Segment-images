const ruleId = 'EX-CS008';

const debug = require('debug')('apigeelint:' + ruleId);
const SecurityLib = require('./security-lib.js');

const plugin = {
  ruleId: ruleId,
  name: "Check HTTP Methods Control",
  message: "Checks if HTTP methods are explicitly controlled and unsupported methods are rejected",
  fatal: false,
  severity: 2,
  nodeType: "Bundle",
  enabled: true,
};

const warningPlugin = JSON.parse(JSON.stringify(plugin));
warningPlugin.severity = 1;

const onProxyEndpoint = function (endpoint, cb) {

  debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);

  let flows = endpoint.getFlows();
  let hasVerbCondition = false;
  let hasCatchAllRaiseFault = false;

  flows.forEach((flow, index) => {

    const condition = flow.getCondition();

    if (condition && condition.includes('request.verb')) {
      hasVerbCondition = true;
    }

    // catch-all flow = no condition
    if (!condition) {

      const steps = flow.getRequestSteps().concat(flow.getResponseSteps());

      steps.forEach(step => {

        if (step.getName && step.getName().includes('RaiseFault')) {
          hasCatchAllRaiseFault = true;
        }

      });
    }

  });

  // --- Error: no HTTP method control

  if (!hasVerbCondition) {

    endpoint.addMessage({
      plugin: plugin,
      line: endpoint.lineNumber,
      column: endpoint.columnNumber,
      message:
        `No HTTP method control detected. ` +
        `Proxy does not check "request.verb".`,
    });

  }

  // --- Error: missing catch-all rejection

  if (hasVerbCondition && !hasCatchAllRaiseFault) {

    endpoint.addMessage({
      plugin: plugin,
      line: endpoint.lineNumber,
      column: endpoint.columnNumber,
      message:
        `HTTP methods may fall through to backend. ` +
        `Missing catch-all flow with RaiseFault to reject unsupported methods.`,
    });

  }

  // --- Warning: AssignMessage used instead of RaiseFault

  flows.forEach(flow => {

    const steps = flow.getRequestSteps().concat(flow.getResponseSteps());

    steps.forEach(step => {

      if (step.getName && step.getName().includes('AssignMessage')) {

        endpoint.addMessage({
          plugin: warningPlugin,
          line: endpoint.lineNumber,
          column: endpoint.columnNumber,
          message:
            `AssignMessage used for method control without RaiseFault. ` +
            `AssignMessage alone may not terminate the request.`,
        });

      }

    });

  });

  if (typeof cb === 'function') {
    cb();
  }
};

module.exports = {
  plugin,
  onProxyEndpoint,
};

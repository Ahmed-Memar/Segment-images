const stepHasJSON = (endpoint, step) =>
    stepUsesJSON(endpoint, step, {}).usesJson === true;

const stepHasXML = (endpoint, step) =>
    stepUsesXML(endpoint, step, {}).usesXML === true;



if (stepHasJSON(endpoint, step)) {
    preFlowHasJSON = true;
}

if (stepHasXML(endpoint, step)) {
    preFlowHasXML = true;
}


if (stepHasJSON(endpoint, step)) {
    hasJSON = true;
}

if (stepHasXML(endpoint, step)) {
    hasXML = true;
}
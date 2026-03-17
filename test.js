flows.forEach((flow) => {

  const conditionObj = flow.getCondition();
  const condition = conditionObj ? conditionObj.getExpression() : "";

  // ✅ détecter request.verb
  if (condition.includes('request.verb')) {
    hasVerbCondition = true;
  }

  const steps = flow.steps || [];

  steps.forEach(step => {

    // ✅ detect RaiseFault (catch-all)
    if (!condition && step.name && step.name.toLowerCase().includes('rf-')) {
      hasCatchAllRaiseFault = true;
    }

    // ✅ detect AssignMessage
    if (step.name && step.name.toLowerCase().includes('assignmessage')) {
      hasAssignMessage = true;
    }

  });

});
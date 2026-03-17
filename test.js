flows.forEach((flow) => {

  const conditionObj = flow.getCondition();
  const condition = conditionObj ? conditionObj.getExpression() : "";

  if (condition.includes('request.verb')) {
    hasVerbCondition = true;
  }

  // catch-all = pas de condition
  if (!condition) {

    const steps = flow.steps || [];

    steps.forEach(step => {

      if (step.name && step.name.includes('RF-')) {
        hasCatchAllRaiseFault = true;
      }

    });
  }

});
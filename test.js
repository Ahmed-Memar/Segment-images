flows.forEach((flow) => {

  const conditionObj = flow.getCondition();
  const condition = conditionObj ? conditionObj.getExpression() : "";

  // détecter request.verb
  if (condition.includes('request.verb')) {
    hasVerbCondition = true;
  }

  // 🔥 récupérer les steps correctement depuis XML
  const el = flow.getElement();
  const stepNodes = xpath.select('./Request/Step/Name | ./Response/Step/Name', el);

  stepNodes.forEach((node) => {
    const stepName = (node.firstChild && node.firstChild.data ? node.firstChild.data : "")
      .trim()
      .toLowerCase();

    // detect RaiseFault
    if (stepName.startsWith('rf-')) {
      hasCatchAllRaiseFault = true;
    }

    // detect AssignMessage
    if (stepName.startsWith('am-')) {
      hasAssignMessage = true;
    }
  });

});
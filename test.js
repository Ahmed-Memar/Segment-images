invalidFlows.forEach(flow => {
    flow.details.forEach(detail => {
        endpoint.addMessage({
            plugin,
            line: detail.line,
            column: detail.column,
            message: `Flow "${flow.name}" error: ${detail.message}`
        });
    });
});
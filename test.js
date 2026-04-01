invalidFlows.forEach(flow => {

    const messages = flow.details.map(d => d.message);

    endpoint.addMessage({
        plugin,
        line: flow.line,
        column: flow.column,
        message: `Flow "${flow.name}" - ${messages.join(' AND ')}`
    });

});
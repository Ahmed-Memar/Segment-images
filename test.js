if (invalidFlows.length > 0) {

    hasIssue = true;

    invalidFlows.forEach(flow => {

        // ===== Group by severity =====

        const errorDetails = flow.details.filter(
            d => d.severity === 'error'
        );

        const warningDetails = flow.details.filter(
            d => d.severity === 'warning'
        );

        // ===== ERROR message =====

        if (errorDetails.length > 0) {

            const messages = errorDetails.map(detail =>

                detail.stepName
                    ? `Step "${detail.stepName}" ${detail.message}`
                    : detail.message
            );

            endpoint.addMessage({
                plugin,
                line: errorDetails[0].line,
                column: errorDetails[0].column,
                message:
                    `Flow "${flow.name}" is not compliant: ` +
                    messages.join(' AND ')
            });
        }

        // ===== WARNING message =====

        if (warningDetails.length > 0) {

            const messages = warningDetails.map(detail =>

                detail.stepName
                    ? `Step "${detail.stepName}" ${detail.message}`
                    : detail.message
            );

            endpoint.addMessage({
                plugin: warningPlugin,
                line: warningDetails[0].line,
                column: warningDetails[0].column,
                message:
                    `Flow "${flow.name}" is not compliant: ` +
                    messages.join(' AND ')
            });
        }
    });
}
// ===== AssignMessage =====

if (policy.getType() === 'AssignMessage') {

    const payloadNode = getFirstNode(
        '/AssignMessage/Set/Payload',
        policy.getElement()
    );

    if (!payloadNode) {
        return {
            usesJson: false
        };
    }

    const contentType =
        payloadNode.getAttribute &&
        payloadNode.getAttribute('contentType')
            ? payloadNode.getAttribute('contentType')
            : '';

    if (!contentType.toLowerCase().includes('application/json')) {
        return {
            usesJson: false
        };
    }

    return {
        usesJson: true,
        severity: 'error'
    };
}
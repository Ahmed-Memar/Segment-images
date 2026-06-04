// ===== XML transformation policies =====

if (['XMLToJSON', 'XSL'].includes(policy.getType())) {

    const sourcePath =
        policy.getType() === 'XMLToJSON'
            ? '/XMLToJSON/Source'
            : '/XSL/Source';

    const sourceNode = getFirstNode(
        sourcePath,
        policy.getElement()
    );

    const source = sourceNode
        ? getNodeText(sourceNode).trim()
        : 'message';

    return classifySource(source, registry);
}
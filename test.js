// ===== JSON transformation =====

if (policy.getType() === 'JSONToXML') {

    const sourceNode = getFirstNode(
        '/JSONToXML/Source',
        policy.getElement()
    );

    // Default source = message
    const source = sourceNode
        ? getNodeText(sourceNode).trim()
        : 'message';

    return classifySource(source, registry);
}
const xmlPayload = getFirstNode(
    '/ExtractVariables/XMLPayload',
    policy.getElement()
);

return !!xmlPayload;



const jsonPayload = getFirstNode(
    '/ExtractVariables/JSONPayload',
    policy.getElement()
);

return !!jsonPayload;
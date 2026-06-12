const isOptionsFlow = flow => {
    const condition = getCondition(flow);

    const hasOptionsVerb =
        /request\.verb\s*(?:=|==)\s*["']?OPTIONS["']?/i.test(condition);

    const hasOriginHeader =
        /request\.header\.origin\s*(?:!=|NotEquals|IsNot)\s*(?:"?null"?)/i.test(condition);

    const hasAccessControlRequestMethod =
        /request\.header\.Access-Control-Request-Method\s*(?:!=|NotEquals|IsNot)\s*(?:"?null"?)/i.test(condition);

    return hasOptionsVerb && hasOriginHeader && hasAccessControlRequestMethod;
};
<VerifyJWT name="jwt-Decode" enabled="true" continueOnError="false">
    <Algorithm>RS256</Algorithm>

    <PublicKey>
        <Value ref="public.key.variable"/>
    </PublicKey>

    <Issuer>https://issuer.example.com</Issuer>

    <Audience>your-api-audience</Audience>

    <IgnoreUnresolvedVariables>false</IgnoreUnresolvedVariables>
</VerifyJWT>





// 🚨 If Algorithm is missing → also fail on key
if (!algorithm) {
    const hasSecret = hasSecretKey(el);
    const hasPublic = hasPublicKey(el);

    if (!hasSecret && !hasPublic) {
        endpoint.addMessage({
            plugin,
            line,
            column,
            message: `VerifyJWT policy "${policy.getName()}" must define <PublicKey> or <SecretKey>.`
        });
    }

    return; // ⛔ stop here (important)
}
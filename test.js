<VerifyJWT name="jwt-Decode" enabled="true" continueOnError="false">
    <Algorithm>RS256</Algorithm>

    <PublicKey>
        <Value ref="public.key.variable"/>
    </PublicKey>

    <Issuer>https://issuer.example.com</Issuer>

    <Audience>your-api-audience</Audience>

    <IgnoreUnresolvedVariables>false</IgnoreUnresolvedVariables>
</VerifyJWT>
PublicKey

<Value ref="public.key.variable"/>


<Value>-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtest123...
-----END PUBLIC KEY-----</Value>


<Value ref="private.kvm.publickey"/>


<Certificate>my-cert-alias</Certificate>

<JWKS uri="https://example.com/.well-known/jwks.json"/>







<SecretKey>
    <Value ref="secret.key.variable"/>
</SecretKey>


<SecretKey>
    <Value>my-secret-key-123</Value>
</SecretKey>


<SecretKey>
    <Value ref="private.kvm.secretkey"/>
</SecretKey>

Exigence	Why (Automate? = No)

Coarse-grained authorization enforcement	Authorization can be implemented through scopes, claims, flow conditions, or custom logic. A generic plugin cannot reliably verify correct enforcement.
End-to-end API call tracking	Correlation IDs can be generated or propagated through multiple patterns. A generic plugin cannot reliably verify tracking enforcement.
Consumer app. IP whitelisting	IP filtering may be implemented through proxy logic or infrastructure controls. A generic plugin cannot reliably verify IP allowlisting.


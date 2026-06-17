Non-compliant configurations:

The ProxyEndpoint is non-compliant only when no non-empty error handling mechanism is found.

This includes:
- No FaultRules and no DefaultFaultRule defined.
- FaultRules defined but empty, with no non-empty DefaultFaultRule.
- DefaultFaultRule defined but empty, with no non-empty FaultRule.
Design Decisions

• The validation is limited to the ProxyEndpoint. TargetEndpoint error handling is not currently evaluated.
• The plugin verifies the presence of an error-handling mechanism but does not validate the internal behavior of FaultRules or DefaultFaultRule.


An empty FaultRule.
# Rule Logic

1. Build a registry of ServiceCallout response variables.

2. Classify ServiceCallout response variables as internal, external or unknown.

3. Check whether a valid ThreatProtection policy exists in the request PreFlow.
   - If valid, treat it as global protection and stop further analysis.
   - Otherwise, continue flow analysis.

4. Detect payload processing:
   - JSONThreatProtection:
     - PreFlow uses explicit JSON processing indicators.
     - POST, PUT and PATCH request flows are assumed to process JSON request bodies by default.
     - Flows that clearly process XML are excluded.
   - XMLThreatProtection:
     - PreFlow and request flows use explicit XML processing indicators.

5. Verify that the corresponding ThreatProtection policy exists where required.

6. Validate the policy configuration.

7. Report findings according to source classification and configuration requirements:
   - ERROR for high-risk sources or missing mandatory protection parameters.
   - WARNING for unknown sources or missing recommended protection parameters.
   - IGNORE for trusted internal sources.
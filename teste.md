JSONThreatProtection

Detection Logic

The rule applies JSONThreatProtection using two mechanisms:

1. PreFlow detection
In PreFlow, JSON is detected only through explicit JSON indicators:
Table: JSON indicators table

2. Flow-by-flow detection
For normal request flows, POST, PUT and PATCH flows are assumed to process JSON request bodies by default, unless a clear XML indicator is detected.
If no JSONThreatProtection policy is applied in the same flow, an ERROR is raised.

Configuration Requirements

Table: JSONThreatProtection configuration requirements table

XMLThreatProtection

Detection Logic

The rule detects XML processing only through explicit XML indicators:
Table: XML indicators table

If XML processing is detected, the rule checks whether XMLThreatProtection is applied in the same flow, or globally in PreFlow.

Configuration Requirements

Table: XMLThreatProtection configuration requirements table

Source Classification

Source classification is used only when the rule analyzes explicit processing policies that define a <Source> element, such as ExtractVariables, JSONToXML, XMLToJSON or XSL.

It is not used for JSON default detection on POST, PUT and PATCH flows, because in that case the rule assumes a JSON request body by default.

Table: Source classification table

Design Decisions

JSONThreatProtection

1. A valid JSONThreatProtection policy in request PreFlow is treated as global protection.
2. In PreFlow, JSON must be detected through explicit JSON indicators.
3. In normal request flows, POST, PUT and PATCH are assumed to process JSON request bodies by default.
4. Flows that clearly process XML are ignored by JSONThreatProtection and handled by XMLThreatProtection.
5. This conservative approach reduces false negatives, but may increase false positives.

XMLThreatProtection

1. A valid XMLThreatProtection policy in request PreFlow is treated as global protection.
2. XMLThreatProtection is required only when explicit XML indicators are detected.
3. HTTP method conditions are not required for XML detection, because XML processing is already explicitly identified.
4. Source classification is used when XML processing policies define a <Source>.

Rule Logic

JSONThreatProtection

1. Check whether JSONThreatProtection exists in request PreFlow.
2. If yes, validate its configuration.
3. If valid, treat it as global protection and stop the analysis.
4. If no global protection exists, analyze PreFlow using explicit JSON indicators.
5. Then analyze each request flow:
   i. Ignore flows that are not POST, PUT or PATCH.
   ii. Ignore flows that clearly process XML.
   iii. Otherwise, assume JSON request body by default.
6. Check whether JSONThreatProtection exists in the same flow.
7. Report:
   i. ERROR if JSONThreatProtection is missing.
   ii. ERROR if required configuration parameters are missing.
   iii. WARNING if recommended configuration parameters are missing.

XMLThreatProtection

1. Build a registry of ServiceCallout response variables.
2. Check whether XMLThreatProtection exists in request PreFlow.
3. If yes, validate its configuration.
4. If valid, treat it as global protection and stop the analysis.
5. If no global protection exists, analyze PreFlow and request flows using explicit XML indicators.
6. Check whether XMLThreatProtection exists in the same flow.
7. Report:
   i. ERROR if XMLThreatProtection is missing for a high-risk XML source.
   ii. WARNING if the XML source origin cannot be verified automatically.
   iii. WARNING if recommended configuration parameters are missing.
   iv. IGNORE for trusted internal or backend sources.

Important : la phrase actuelle “Both controls use the same source classification logic” n’est plus totalement vraie. Remplace-la par la section “Source Classification” ci-dessus.
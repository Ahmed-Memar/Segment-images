
✅ TEST 1 — NO JSON (SKIP)

📁 test-json-01-no-json

default.xml

<ProxyEndpoint name="default">
  <PreFlow name="PreFlow">
    <Request/>
    <Response/>
  </PreFlow>
  <Flows/>
  <HTTPProxyConnection>
    <BasePath>/test</BasePath>
    <VirtualHost>default</VirtualHost>
  </HTTPProxyConnection>
  <RouteRule name="noroute"/>
</ProxyEndpoint>

✅ Expected

SKIP (no JSON usage)


---

❌ TEST 2 — ExtractVariables JSON (INVALID)

📁 test-json-02-extract-invalid

default.xml

<Step>
  <Name>EV-ExtractJSON</Name>
</Step>

policy EV-ExtractJSON.xml

<ExtractVariables name="EV-ExtractJSON">
  <JSONPayload>
    <Variable name="test">
      <JSONPath>$.id</JSONPath>
    </Variable>
  </JSONPayload>
</ExtractVariables>

❌ Expected

FAIL (missing JSONThreatProtection)


---

✅ TEST 3 — ExtractVariables JSON (VALID)

📁 test-json-03-extract-valid

default.xml

<Step><Name>EV-ExtractJSON</Name></Step>
<Step><Name>JSON-Threat</Name></Step>

JSONThreatProtection.xml

<JSONThreatProtection name="JSON-Threat">
  <ArrayElementCount>10</ArrayElementCount>
  <ContainerDepth>5</ContainerDepth>
  <ObjectEntryCount>10</ObjectEntryCount>
  <ObjectEntryNameLength>50</ObjectEntryNameLength>
  <StringValueLength>100</StringValueLength>
</JSONThreatProtection>

✅ Expected

PASS


---

❌ TEST 4 — JSONToXML (INVALID)

📁 test-json-04-transform-invalid

default.xml

<Step>
  <Name>JSONToXML-1</Name>
</Step>

JSONToXML.xml

<JSONToXML name="JSONToXML-1"/>

❌ Expected

FAIL


---

❌ TEST 5 — AssignMessage JSON header (INVALID)

📁 test-json-05-header-invalid

default.xml

<Step>
  <Name>AM-SetHeader</Name>
</Step>

AssignMessage.xml

<AssignMessage name="AM-SetHeader">
  <Add>
    <Headers>
      <Header name="Content-Type">application/json</Header>
    </Headers>
  </Add>
</AssignMessage>

❌ Expected

FAIL


---

⚠️ TEST 6 — FAKE JSON (SHOULD SKIP)

📁 test-json-06-fake-json-name

default.xml

<Step>
  <Name>Check-JSON-Header</Name>
</Step>

(no real JSON logic)

✅ Expected

SKIP

👉 très important → test faux positif


---

⚠️ TEST 7 — XML ONLY (SHOULD SKIP)

📁 test-json-07-xml-only

default.xml

<Step>
  <Name>MV-ValidateXML</Name>
</Step>

MessageValidation.xml

<MessageValidation name="MV-ValidateXML">
  <Source>request</Source>
</MessageValidation>

✅ Expected

SKIP



🚀 1. test-xml-01-no-xml-usage ✅ (DOIT PASSER)

👉 Objectif :
❌ Pas de XML → plugin doit IGNORER


---

🔹 policies/AM-SetHeader.xml

<AssignMessage name="AM-SetHeader">
    <Set>
        <Headers>
            <Header name="Content-Type">application/json</Header>
        </Headers>
    </Set>
    <AssignTo createNew="false" type="request"/>
</AssignMessage>


---

🔹 proxies/default.xml

<ProxyEndpoint name="default">
    <PreFlow>
        <Request>
            <Step>
                <Name>AM-SetHeader</Name>
            </Step>
        </Request>
    </PreFlow>
</ProxyEndpoint>


---

🚀 2. test-xml-02-preflow-extract-invalid ❌ (ERROR attendu)

👉 XML utilisé MAIS pas de XMLThreatProtection


---

🔹 policies/EV-ExtractXML.xml

<ExtractVariables name="EV-ExtractXML">
    <XMLPayload>
        <Variable name="test">
            <XPath>/root/value</XPath>
        </Variable>
    </XMLPayload>
</ExtractVariables>


---

🔹 proxies/default.xml

<ProxyEndpoint name="default">
    <PreFlow>
        <Request>
            <Step>
                <Name>EV-ExtractXML</Name>
            </Step>
        </Request>
    </PreFlow>
</ProxyEndpoint>


---

👉 Résultat attendu :

ERROR → XML utilisé mais pas de XMLThreatProtection


---

🚀 3. test-xml-03-preflow-valid ✅ (OK)

👉 XML + XMLThreatProtection bien configuré


---

🔹 policies/XML-Threat.xml

<XMLThreatProtection name="XML-Threat">
    <StructureLimits>
        <NodeDepth>10</NodeDepth>
        <ChildCount>20</ChildCount>
        <AttributeCountPerElement>5</AttributeCountPerElement>
    </StructureLimits>
    <ValueLimits>
        <Text>1000</Text>
        <Attribute>500</Attribute>
    </ValueLimits>
</XMLThreatProtection>


---

🔹 policies/EV-ExtractXML.xml

(même que avant)


---

🔹 proxies/default.xml

<ProxyEndpoint name="default">
    <PreFlow>
        <Request>
            <Step>
                <Name>XML-Threat</Name>
            </Step>
            <Step>
                <Name>EV-ExtractXML</Name>
            </Step>
        </Request>
    </PreFlow>
</ProxyEndpoint>


---

👉 Résultat :

PASS ✅


---

🚀 4. test-xml-04-mix-all-errors-warnings-config ⚠️

👉 Cas COMPLET (très important)


---

🔹 policies/XML-Threat.xml (config incomplète)

<XMLThreatProtection name="XML-Threat">
    <StructureLimits>
        <NodeDepth>10</NodeDepth>
        <!-- ChildCount manquant → ERROR -->
    </StructureLimits>
    <ValueLimits>
        <!-- Text manquant → WARNING -->
    </ValueLimits>
</XMLThreatProtection>


---

🔹 policies/JSONToXML.xml (détection XML)

<JSONToXML name="JSONToXML"/>


---

🔹 proxies/default.xml

<ProxyEndpoint name="default">
    <PreFlow>
        <Request>
            <Step>
                <Name>JSONToXML</Name>
            </Step>
            <Step>
                <Name>XML-Threat</Name>
            </Step>
        </Request>
    </PreFlow>
</ProxyEndpoint>


---

👉 Résultat attendu :

ERROR → ChildCount manquant
WARNING → Text manquant


---

🚀 5. test-xml-06-flow-valid ✅

👉 XML utilisé dans flow (pas PreFlow)


---

🔹 policies/XML-Threat.xml

(valide)


---

🔹 policies/JSONToXML.xml

<JSONToXML name="JSONToXML"/>


---

🔹 proxies/default.xml

<ProxyEndpoint name="default">

    <Flows>
        <Flow name="XMLFlow">
            <Request>
                <Step>
                    <Name>JSONToXML</Name>
                </Step>
                <Step>
                    <Name>XML-Threat</Name>
                </Step>
            </Request>
        </Flow>
    </Flows>

</ProxyEndpoint>
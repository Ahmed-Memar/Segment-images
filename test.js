<ProxyEndpoint name="default">
    <PreFlow name="PreFlow">
        <Request>
            <Step>
                <Name>ValidateXML</Name>
            </Step>
        </Request>
        <Response/>
    </PreFlow>

    <Flows/>

    <HTTPProxyConnection>
        <BasePath>/test-soap-01</BasePath>
        <VirtualHost>default</VirtualHost>
    </HTTPProxyConnection>

    <RouteRule name="default">
        <TargetEndpoint>default</TargetEndpoint>
    </RouteRule>

</ProxyEndpoint>






<MessageValidation name="ValidateXML">
    <DisplayName>Validate XML Request</DisplayName>
    <Source>request</Source>
</MessageValidation>
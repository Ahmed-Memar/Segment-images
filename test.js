<ProxyEndpoint name="default">

<PreFlow name="PreFlow">
  <Request>
    <Step>
      <Name>DummyStep</Name>
    </Step>
  </Request>
  <Response/>
</PreFlow>


  <Flows>
    <Flow name="PostFlow">
      <Condition>request.verb = "POST"</Condition>
    </Flow>
  </Flows>

  <HTTPProxyConnection>
    <BasePath>/test</BasePath>
    <VirtualHost>default</VirtualHost>
  </HTTPProxyConnection>

  <RouteRule name="noroute"/>

</ProxyEndpoint>
<ProxyEndpoint name="default">

  <PreFlow name="PreFlow">
    <Request/>
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
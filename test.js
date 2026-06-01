<ServiceCallout name="SC-External">
    <Response>externalResponse</Response>
    <HTTPTargetConnection>
        <URL>https://api.thirdparty.com/test</URL>
    </HTTPTargetConnection>
</ServiceCallout>



<ExtractVariables name="EV-ExtractJSON">
    <JSONPayload>
        <Variable name="id">
            <JSONPath>$.id</JSONPath>
        </Variable>
    </JSONPayload>
    <Source>externalResponse</Source>
</ExtractVariables>



<Flow name="Flow1">
    <Request>
        <Step>
            <Name>SC-External</Name>
        </Step>
        <Step>
            <Name>EV-ExtractJSON</Name>
        </Step>
    </Request>
</Flow>
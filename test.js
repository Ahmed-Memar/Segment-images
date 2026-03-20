<Flows>

  <!-- Flow protégé -->
  <Flow name="BlockMethods">
    <Condition>request.verb != "POST"</Condition>
    <Request>
      <Step>
        <Name>RF-InvalidMethod</Name>
      </Step>
    </Request>
  </Flow>

  <!-- Flow NON protégé -->
  <Flow name="NoProtection">
    <Condition>request.verb = "POST"</Condition>
    <Request>
      <Step>
        <Name>SomePolicy</Name>
      </Step>
    </Request>
  </Flow>

</Flows>



<Flows>

  <Flow name="Flow1">
    <Condition>request.verb != "POST"</Condition>
    <Request>
      <Step>
        <Name>RF-InvalidMethod</Name>
      </Step>
    </Request>
  </Flow>

  <Flow name="Flow2">
    <Condition>request.verb != "POST"</Condition>
    <Request>
      <Step>
        <Name>RF-InvalidMethod</Name>
      </Step>
    </Request>
  </Flow>

</Flows>

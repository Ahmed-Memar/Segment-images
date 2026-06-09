1. Check whether a SpikeArrest policy exists in the proxy bundle.
2. Validate that every SpikeArrest policy contains a Rate element.
3. Check whether a compliant SpikeArrest policy is applied:
   - In the request PreFlow, or
   - In every request Flow.
4. Report an ERROR when:
   - No compliant SpikeArrest policy is applied where required.
   - A SpikeArrest policy is missing the required Rate element.
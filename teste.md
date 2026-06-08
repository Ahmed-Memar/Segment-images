# Source Classification

Source classification is used for:

- JSON processing detected through explicit indicators in PreFlow.
- XML processing detected in PreFlow and request flows.

It determines whether the payload source is trusted, untrusted, or unknown.

It is not used for the default JSON detection applied to POST, PUT and PATCH request flows.

Source classification rules are summarized in the following table.

**Table: Source classification**
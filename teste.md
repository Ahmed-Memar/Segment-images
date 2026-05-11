## JSONThreatProtection

| Parameter | Description | Severity | Why |
|---|---|---|---|
| ContainerDepth | Defines the maximum nesting level of JSON objects and arrays. | ERROR | Excessive nesting may lead to parser abuse and resource exhaustion attacks. |
| ObjectEntryCount | Defines the maximum number of key-value pairs allowed in a JSON object. | WARNING | Large JSON objects may increase processing cost and memory usage. |
| StringValueLength | Defines the maximum length of string values in the JSON payload. | WARNING | Excessively large text values may increase payload processing overhead. |
| ArrayElementCount | Defines the maximum number of elements allowed in a JSON array. | WARNING | Large arrays may increase memory consumption and parsing complexity. |
| ObjectEntryNameLength | Defines the maximum length of JSON property names. | IGNORED | Property name length is considered low risk and highly context-dependent. |
| Source | Defines which message is analysed (request, response, or message). | IGNORED | The default request source is considered sufficient for this control. |

---

## XMLThreatProtection

| Parameter | Description | Severity | Why |
|---|---|---|---|
| StructureLimits/NodeDepth | Defines the maximum nesting depth of XML elements. | ERROR | Deep XML structures may lead to parser abuse and resource exhaustion attacks. |
| StructureLimits/ChildCount | Defines the maximum number of child elements allowed per XML node. | ERROR | Excessive child elements may significantly increase parsing complexity. |
| ValueLimits/Text | Defines the maximum length of text content inside XML elements. | WARNING | Large text values may increase processing overhead and memory usage. |
| ValueLimits/Attribute | Defines the maximum length of XML attribute values. | WARNING | Excessively large attribute values may increase payload size and parsing cost. |
| StructureLimits/AttributeCountPerElement | Defines the maximum number of attributes allowed on a single XML element. | WARNING | Excessive attributes may increase XML parsing complexity and memory usage. |
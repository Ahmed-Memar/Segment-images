## JSONThreatProtection (EX-CS002)

| Parameter | Severity | Why |
|----------|----------|-----|
| ContainerDepth | ERROR | Defines the maximum nesting level of JSON objects and arrays. Used to control how deep a JSON structure can be. |
| ObjectEntryCount | WARNING | Defines the maximum number of key-value pairs allowed inside a JSON object. Controls the size of JSON objects. |
| StringValueLength | WARNING | Defines the maximum length of string values in the JSON payload. Controls how large text data can be. |
| ArrayElementCount | WARNING | Defines the maximum number of elements allowed in a JSON array. Controls the size of arrays. |
| ObjectEntryNameLength | IGNORED | Defines the maximum length of JSON keys. Controls how long property names can be. |
| Source | IGNORED | Defines which message is analyzed (request, response, or message). Determines where the JSON payload is read from. |






## XMLThreatProtection (EX-CS003)

| Parameter | Severity | Why |
|----------|----------|-----|
| StructureLimits/NodeDepth | ERROR | Defines the maximum nesting depth of XML elements. Controls how deep the XML structure can be. |
| StructureLimits/ChildCount | ERROR | Defines the maximum number of child elements per XML node. Controls how many elements can exist under a single parent. |
| ValueLimits/Text | WARNING | Defines the maximum length of text content inside XML elements. Controls the size of textual data. |
| ValueLimits/Attribute | WARNING | Defines the maximum length of attribute values. Controls how large attribute data can be. |
| StructureLimits/AttributeCountPerElement | WARNING | Defines the maximum number of attributes allowed on a single XML element. Controls attribute density. |
| NameLimits / Namespace / Comments / ProcessingInstructions | IGNORED | Define limits for element names, namespaces, comments, and processing instructions. Control less critical XML structure details. |
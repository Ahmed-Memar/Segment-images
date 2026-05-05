# JSONThreatProtection (EX-CS002)

| Parameter | Severity | Why |
|----------|----------|-----|
| ContainerDepth | ERROR | Limits JSON nesting depth. Without it, deeply nested payloads can cause CPU/memory exhaustion and lead to service crashes (DoS). This is the most critical structural protection. |
| ObjectEntryCount | WARNING | Limits the number of keys in a JSON object. Without it, very large objects can consume significant memory. However, acceptable limits depend on business needs. |
| StringValueLength | WARNING | Limits the size of string values. Without it, large payloads (e.g., long text or base64 data) can increase memory usage. This is often business-dependent. |
| ArrayElementCount | WARNING | Limits the number of elements in arrays. Without it, very large arrays can lead to high memory consumption (array-based DoS). |
| ObjectEntryNameLength | IGNORED | Low security impact. Limiting key length adds little protection and may introduce unnecessary noise. |
| Source | IGNORED | Defaults to `request`. Enforcing it provides little value in this context and may increase noise. |

---

# XMLThreatProtection (EX-CS003)

| Parameter | Severity | Why |
|----------|----------|-----|
| StructureLimits/NodeDepth | ERROR | Limits XML nesting depth. Without it, deeply nested XML can cause parser crashes or CPU exhaustion (XML bomb / DoS). |
| StructureLimits/ChildCount | ERROR | Limits the number of child elements. Without it, XML structures can grow exponentially and consume large amounts of memory. |
| ValueLimits/Text | WARNING | Limits the size of text nodes. Without it, large payloads (e.g., base64 or long text) can increase memory usage. Often depends on business requirements. |
| ValueLimits/Attribute | WARNING | Limits the size of attribute values. Without it, attributes can carry large payloads, increasing memory usage. |
| StructureLimits/AttributeCountPerElement | WARNING | Limits the number of attributes per element. Without it, attackers can create "attribute bombs" leading to memory pressure. |
| Namespace / NameLimits / Comments / ProcessingInstructions | IGNORED | Low practical impact for most APIs. Including them would increase noise without significant security benefit in a first version. |

---

## Severity Definition

- ERROR: Critical protection missing (high risk of DoS or crash)
- WARNING: Important but context-dependent
- IGNORED: Low impact or intentionally excluded to reduce noise
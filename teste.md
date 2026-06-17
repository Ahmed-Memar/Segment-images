# Exception & Error Management

## Description

APIs must implement exception and error handling mechanisms to ensure that unexpected errors are managed consistently and do not expose internal implementation details, backend information, or sensitive technical data to consumers.

## Evaluation

The API proxy must define an exception and error management mechanism using Apigee FaultRules or DefaultFaultRule at the ProxyEndpoint level.

## Applicable Configuration

| Configuration | API Type |
|---|---|
| FaultRules / DefaultFaultRule | All APIs |

---

# Configuration Implementation

## Design Decisions

- Error handling must be explicitly configured.
- Empty FaultRules are not considered valid.
- Either a DefaultFaultRule or a valid FaultRule is sufficient.
- Only the presence of an error handling mechanism is verified.

## Rule Logic

The plugin evaluates the ProxyEndpoint as follows:

### 1. Error Handling Detection

The ProxyEndpoint must define at least one of the following:

- A DefaultFaultRule
- A FaultRule containing at least one child element

### 2. Compliance Validation

The ProxyEndpoint is considered compliant when one of the following conditions is met:

#### Option A – DefaultFaultRule

```xml
<DefaultFaultRule name="default-faultrule">
    <AlwaysEnforce>true</AlwaysEnforce>
    <Step>
        <Name>FC-ErrorHandling</Name>
    </Step>
</DefaultFaultRule>
```

#### Option B – FaultRule

```xml
<FaultRules>
    <FaultRule name="oauth-fault-rule">
        <Step>
            <Name>AM-ErrorOauth2</Name>
        </Step>
    </FaultRule>
</FaultRules>
```

### 3. Non-Compliant Configurations

The following configurations are considered non-compliant:

- No FaultRule and no DefaultFaultRule defined.
- Empty FaultRules block (`<FaultRules/>`).
- Empty FaultRule definition without any child configuration element.

---

## References

**Lint Rule:** EX-CS010-CheckExceptionErrorManagement.js

**Apigee configuration reference:** FaultRules & DefaultFaultRule
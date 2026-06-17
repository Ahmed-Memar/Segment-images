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

The current implementation evaluates only the **ProxyEndpoint**.

TargetEndpoint error handling is not currently enforced and may be evaluated separately depending on BNP security requirements.

A FaultRule is considered valid only if it contains at least one child configuration element.

## Rule Logic

The plugin evaluates the **ProxyEndpoint** as follows:

### 1. Error Handling Detection

The ProxyEndpoint must define at least one of the following:

- A **DefaultFaultRule**
- A **FaultRule** containing at least one child element

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

- No **FaultRule** and no **DefaultFaultRule** defined.
- Empty **FaultRules** block (`<FaultRules/>`).
- Empty **FaultRule** definition without any child configuration element.

## Design Decisions

- Error handling must be explicitly configured.
- Empty FaultRule definitions are ignored because they do not provide any error management behavior.
- The presence of either a valid FaultRule or a DefaultFaultRule is considered sufficient.
- The plugin focuses on the existence of an error management mechanism and does not validate the internal implementation of the FaultRule or DefaultFaultRule.

---

## References

**Lint Rule:** EX-CS010-CheckExceptionErrorManagement.js

**Apigee configuration reference:** FaultRules & DefaultFaultRule
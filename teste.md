# Exception & Error Management

## Applicable Error Handling Mechanisms

| Mechanism | API Type |
|-----------|----------|
| FaultRules / DefaultFaultRule | All APIs |

---

# Implementation

## Design Decisions

The plugin evaluates the ProxyEndpoint and verifies that an error handling mechanism is explicitly defined. Compliance is achieved when a DefaultFaultRule exists or when at least one FaultRule contains configuration elements. The plugin validates the presence of an error handling mechanism but does not analyze the internal logic of the configured rules.

## Rule Logic

The plugin evaluates the **ProxyEndpoint** as follows:

### 1. Error Handling Detection

The ProxyEndpoint must define at least one of the following:

- A `DefaultFaultRule`
- A `FaultRule` containing at least one configuration element

### 2. Compliance Validation

The ProxyEndpoint is considered compliant when one of the following conditions is met.

#### Example 1 – DefaultFaultRule

```xml
<DefaultFaultRule name="default-faultrule">
    <AlwaysEnforce>true</AlwaysEnforce>
    <Step>
        <Name>FC-ErrorHandling</Name>
    </Step>
</DefaultFaultRule>
```

#### Example 2 – FaultRule

```xml
<FaultRules>
    <FaultRule name="oauth-fault-rule">
        <Step>
            <Name>AM-ErrorOauth2</Name>
        </Step>
    </FaultRule>
</FaultRules>
```

These are only examples. Any DefaultFaultRule or FaultRule configuration is accepted as long as it contains at least one configuration element.

### 3. Non-Compliant Configurations

The following configurations are considered non-compliant:

- No `FaultRules` and no `DefaultFaultRule` defined.
- An empty `FaultRules` block (`<FaultRules/>`).
- A `FaultRule` without any configuration element.

---

## References

**Lint Rule:** EX-CS010-CheckExceptionErrorManagement.js

**Apigee Reference:** FaultRules & DefaultFaultRule
# Security Requirement

## HTTP Method Control

### Description

APIs must restrict allowed HTTP methods and reject unsupported methods to prevent misuse and unintended access.

---

### Evaluation

The API proxy must enforce HTTP method restrictions to ensure that only authorized methods are accepted.

---

### Applicable Policies

| Policy | API Type |
|---|---|
| RaiseFault + Flow Conditions | SOAP / XML APIs |

---

# Policy Implementation

## HTTP Method Control (SOAP APIs)

### Purpose

Ensure that only allowed HTTP methods (typically POST for SOAP APIs) are accepted.

---

### Configuration Requirements

| Requirement | Description |
|---|---|
| request.verb condition | must restrict allowed HTTP methods |
| RaiseFault policy | must block unauthorized methods |

#### Design Decisions

- Only **SOAP APIs** are evaluated (REST APIs are covered by OASValidation).  
- **request.verb** must be explicitly used to enforce allowed methods.  
- **RaiseFault** ensures that invalid methods are actively rejected.  

---

### Rule Logic

The plugin evaluates the ProxyEndpoint as follows:

#### 1. API Filtering

- Ignore REST APIs covered by OASValidation  
- Evaluate only SOAP APIs (detected via MessageValidation)  

---

#### 2. Method Control Validation

The following conditions must be met:

- `request.verb` must be used to validate allowed HTTP methods  
- A RaiseFault policy must be used to reject unauthorized methods  

---

#### 3. Protection Coverage

HTTP method control must be applied in one of the following ways:

**PreFlow Protection**

- Method control implemented in PreFlow  
- Considered sufficient for the entire API  

---

**Flow-Level Protection**

If no PreFlow protection is present:

- Each Flow must include:  
  - a `request.verb` condition  
  - a RaiseFault policy  

---

### Exception Handling

GET requests are allowed only for WSDL/XSD retrieval:

| Case | Description |
|---|---|
| WSDL access | `request.queryparam.wsdl` or `.wsdl` in path |
| XSD access | `request.queryparam.xsd` |

#### Design Decisions

- WSDL/XSD retrieval requires GET and is valid  
- These flows are excluded from validation to avoid false positives  

---

### Lint Rule

**EX-CS008 — HTTP Method Control Check**
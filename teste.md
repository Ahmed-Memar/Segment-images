START
  │
  ▼
[REST ? (OASValidation)]
  │
  └── YES → ✅ PASS (skip)

  │
  ▼
[SOAP ? (MessageValidation)]
  │
  └── YES → 🔍 vérifier HTTP methods

────────────────────────

[CAS SOAP]

  │
  ▼
request.verb présent ?
  │
  ├── NO → ❌ ERROR
  │
  └── YES
         │
         ▼
RaiseFault lié ?
         │
         ├── NO → ❌ ERROR
         │
         └── YES
                │
                ▼
Position PreFlow ?
                │
                ├── YES → ✔️ OK
                │
                └── NO → ⚠️ WARNING

────────────────────────

[GET + ?wsdl détecté ?]
  │
  ├── NO → (rien, normal)
  │
  └── YES
         │
         ▼
Annotation présente ?
         │
         ├── YES → ✅ PASS
         │
         └── NO → ⚠️ WARNING

END
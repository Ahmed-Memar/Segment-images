Evaluation

Remplacer par :

> The API proxy should define a DefaultFaultRule at the ProxyEndpoint level to provide default error handling.

A ProxyEndpoint that defines only FaultRules without a DefaultFaultRule is considered partially compliant and generates a warning.




---

Design Decisions

Remplacer les 2 puces par :

• The validation is limited to the ProxyEndpoint.

• A non-empty DefaultFaultRule is the preferred error-handling mechanism.
  A ProxyEndpoint defining only FaultRules is reported as a warning.

• The plugin verifies the presence of error-handling mechanisms but does not validate the internal behavior of FaultRules or DefaultFaultRule.


---

1. Error Handling Detection

Remplacer complètement par :

The ProxyEndpoint is evaluated according to the following criteria:

• A non-empty DefaultFaultRule
  → PASS

• One or more non-empty FaultRules without a DefaultFaultRule
  → WARNING

• No valid error-handling mechanism found
  → ERROR


---

2. Compliance Validation

Remplacer le texte :

These are only examples. Any DefaultFaultRule or FaultRule configuration is accepted if it contains at least one configuration element.

par :

These are only examples.

Any non-empty DefaultFaultRule is considered compliant.

A non-empty FaultRule without a DefaultFaultRule generates a warning but does not fail the validation.


---

3. Non-Compliant Configurations

Remplacer :

ProxyEndpoint is non-compliant only when no non-empty error handling mechanism is found.

par :

ProxyEndpoint is non-compliant when neither a non-empty DefaultFaultRule nor a non-empty FaultRule is defined.


---

Ajouter une section Warning Configurations (recommandé)

Entre Compliance Validation et Non-Compliant Configurations :

3. Warning Configurations

The following configuration generates a warning:

• One or more non-empty FaultRules are defined, but no DefaultFaultRule exists.

Puis renuméroter :

4. Non-Compliant Configurations

Cette version est maintenant parfaitement alignée avec la logique du plugin.
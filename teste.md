
1. TLS (backend)

Remplacer

Automate? = Yes

Par

Automate? = No

Remplacer le Why (Automate)

Par :

The bundle may expose TLS indicators (SSLInfo), but absence of SSLInfo does not reliably prove that backend communication is not protected by TLS because TargetServer and infrastructure configuration may be external to the bundle.


---

2. DDoS prevention

Remplacer le Why (Verifiable)

Par :

API rate-limiting mechanisms such as SpikeArrest are visible in the proxy bundle, but DDoS protection may also rely on external infrastructure controls.

Remplacer le Why (Automate)

Par :

SpikeArrest presence and coverage can be reliably verified, but this only verifies API-level rate limiting, not full DDoS protection.

Ajouter dans Relevant Policies

Ajouter :

Quota

Donc :

SpikeArrest, Quota


---

3. Access Token Control

Remplacer le How

Par :

Verify that OAuthV2 (VerifyAccessToken) or VerifyJWT exists and is attached to the PreFlow or all applicable request flows. Validate required policy parameters.

Plus précis que simplement vérifier la présence.


---

4. HTTP Methods Control

Remplacer le How

Par :

Verify that only approved HTTP methods are accepted and that unsupported methods are rejected through RaiseFault or equivalent logic.


---

5. Injection Attacks Prevention

Ajouter dans Relevant Policies

Ajouter :

RegularExpressionProtection

Donc :

JSONThreatProtection, XMLThreatProtection, RegularExpressionProtection

⚠️ Seulement si vous considérez que l'exigence couvre aussi les paramètres et non uniquement les payloads JSON/XML.


---

6. Data Integrity Control

Remplacer Relevant Policies

Actuellement tu as probablement :

SSLInfo, VerifyJWT

Je mettrais plutôt :

VerifyJWT, GenerateJWT, JavaScript (custom signature/HMAC validation)

Car TLS protège le transport, pas l'intégrité métier des données.


---

7. Data Schema Controls

Remplacer le How

Par :

Verify policy presence, flow coverage, required parameters, and that the referenced schema/specification exists.

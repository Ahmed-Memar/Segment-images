## VerifyJWT Parameters Analysis (Access Token Control)

| Parameter | Decision & Enforcement | Accepted Values / Rule | Justification |
|----------|------------------------|------------------------|---------------|
| **Algorithm (`<Algorithm>`)** | Required (**ERROR**) | Must be present. Reject `none`. Prefer strong algorithms (RS256, ES256, PS256). | Defines how the JWT signature is verified. Without it, signature validation is unreliable and vulnerable to algorithm confusion attacks. |
| **Key (`<PublicKey>` / `<SecretKey>`)** | Required (**ERROR**) | Must be present and consistent with Algorithm: HS* → SecretKey, RS*/PS*/ES* → PublicKey (Value, Certificate, or JWKS). | Without a key, no cryptographic verification is performed. Ensures the token is actually signed by a trusted authority. |
| **Issuer (`<Issuer>`)** | Recommended (**WARNING**) | Should be present and non-empty. | Ensures the token is issued by a trusted Identity Provider and prevents accepting tokens from unintended sources. |
| **Audience (`<Audience>`)** | Recommended (**WARNING**) | Should be present and contain the expected API audience. | Prevents token reuse across different APIs (token confusion attack). |
| **IgnoreUnresolvedVariables (`<IgnoreUnresolvedVariables>`)** | Must not be enabled (**WARNING if true**) | Should be `false` (or absent, default = false). | Prevents silent bypass of validation if a variable (e.g., key reference) is not resolved. |
| **Key Source (`<PublicKey><Value>`)** | Recommended (**WARNING**) | Should use `ref=` (KVM or variable), avoid hardcoded values. | Hardcoded keys expose sensitive data in source code and reduce security. |
| **Source (`<Source>`)** | Optional (no enforcement) | Default is `request.header.authorization`. | Explicit definition improves clarity, but default behavior is already secure. |
| **Expiration (`exp` claim)** | Handled by Apigee (no enforcement) | Automatically enforced by VerifyJWT. | No need to enforce in plugin; already handled by the runtime. |
| **Not Before (`nbf` claim)** | Handled by Apigee (no enforcement) | Automatically handled if present. | Managed by Apigee; not required for plugin enforcement. |
| **Subject (`<Subject>`)** | Out of scope | Any value | Depends on business logic; not relevant for generic access token validation. |
| **AdditionalClaims (`<AdditionalClaims>`)** | Out of scope | Custom claims | Business-specific validation (scope, roles); not generic. |
| **TimeAllowance (`<TimeAllowance>`)** | Out of scope | Optional skew value | Impacts time tolerance; not critical for core validation. |
| **JWKS Advanced Handling (`<JWKS>`)** | Partially supported (no strict enforcement) | Basic presence accepted | Advanced key rotation logic adds complexity and is not required for this control. |
| **JWE / Encrypted JWT (`<Type>` / advanced)** | Out of scope | Not supported | Rare and complex use cases; not relevant for this requirement. |

---

### Summary

- **Required (ERROR):**
  - Algorithm
  - Key (consistent with algorithm)

- **Recommended (WARNING):**
  - Issuer
  - Audience
  - IgnoreUnresolvedVariables (must not be true)
  - Avoid hardcoded keys

- **No enforcement:**
  - Source (default is safe)
  - exp / nbf (handled by Apigee)

- **Out of scope:**
  - Subject
  - AdditionalClaims
  - TimeAllowance
  - Advanced JWT features






---

🔴 1. Algorithm (<Algorithm>)

👉 Définit comment la signature du token est vérifiée (ex : RS256).

👉 Doit être présent et utiliser un algorithme sécurisé (refuser none).

👉 On met ERROR car sans algorithme, la vérification du token n’est pas fiable et peut être contournée.



---

🔴 2. Key (<PublicKey> / <SecretKey>)

👉 C’est la clé utilisée pour vérifier la signature du token.

👉 Doit être présente et cohérente avec l’algorithme utilisé (HS → SecretKey, RS → PublicKey).

👉 On met ERROR car sans clé, aucune vérification réelle n’est faite.



---

🟠 3. Issuer (<Issuer>)

👉 Indique qui a créé le token (ex : serveur d’authentification).

👉 Doit être défini pour accepter uniquement les tokens d’une source fiable.

👉 On met WARNING car c’est très important pour la sécurité, mais l’absence ne casse pas techniquement la vérification.



---

🟠 4. Audience (<Audience>)

👉 Indique pour quelle API le token a été créé.

👉 Doit être défini pour éviter qu’un token soit utilisé sur une autre API.

👉 On met WARNING car c’est une bonne pratique de sécurité, mais pas strictement obligatoire pour vérifier la signature.



---

🟠 5. IgnoreUnresolvedVariables (<IgnoreUnresolvedVariables>)

👉 Définit le comportement si une variable (ex : clé) ne peut pas être résolue.

👉 Doit être false pour bloquer la requête en cas de problème.

👉 On met WARNING car une mauvaise configuration peut créer un bypass de sécurité, mais ce n’est pas toujours critique dans tous les cas.



---

🟠 6. Key Source (<PublicKey><Value>)

👉 Indique comment la clé est fournie (hardcodée ou via une référence).

👉 Doit utiliser une référence (ref=) et éviter les valeurs en dur dans le code.

👉 On met WARNING car c’est une bonne pratique de sécurité (éviter fuite de clé), mais ça ne casse pas la validation du token.



---

⚪ 7. Source (<Source>)

👉 Indique où le token est récupéré (ex : header Authorization).

👉 Peut être défini, mais Apigee utilise déjà une valeur par défaut sécurisée.

👉 On ne met ni erreur ni warning car ce paramètre est optionnel et déjà bien géré par défaut.



---

⚪ 8. Expiration (exp claim)

👉 Indique la date d’expiration du token.

👉 Est automatiquement vérifiée par Apigee dans VerifyJWT.

👉 On ne met ni erreur ni warning car c’est déjà géré par la plateforme.



---

⚪ 9. Not Before (nbf claim)

👉 Indique à partir de quand le token est valide.

👉 Est automatiquement pris en compte par Apigee si présent.

👉 On ne met ni erreur ni warning car ce n’est pas nécessaire de le recontrôler.



---

⚪ 10. Subject (<Subject>)

👉 Représente l’utilisateur ou le client du token.

👉 Peut être utilisé selon le besoin métier de l’API.

👉 On ne met ni erreur ni warning car cela dépend du contexte métier et n’est pas générique.



---

⚪ 11. AdditionalClaims (<AdditionalClaims>)

👉 Permet de vérifier des champs spécifiques (ex : scope, rôle).

👉 Dépend fortement de la logique métier de chaque API.

👉 On ne met ni erreur ni warning car ce n’est pas applicable de manière générale.



---

⚪ 12. TimeAllowance (<TimeAllowance>)

👉 Permet d’ajouter une tolérance de temps pour gérer les décalages d’horloge.

👉 Peut être utilisé dans des cas spécifiques mais rarement nécessaire.

👉 On ne met ni erreur ni warning car c’est un réglage avancé et non critique.



---

🏁 Conclusion simple

👉 Ton plugin vérifie :

✔️ que la validation existe et est correcte (ERROR)

✔️ que les bonnes pratiques sont respectées (WARNING)

❌ sans entrer dans la logique métier ou les cas rares

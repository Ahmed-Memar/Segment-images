## ERREUR

| Cas | Exemple | Pourquoi ERREUR |
|---|---|---|
| `<Source>` absent | `<ExtractVariables><JSONPayload/></ExtractVariables>` | La source par défaut est `message` → donnée contrôlée par le client |
| Source venant de la requête | `request`, `request.content`, `message.content` | Payload directement fourni par l’utilisateur/client |
| ServiceCallout externe | `<URL>https://api.thirdparty.com</URL>` | Un backend externe peut retourner un JSON malveillant |

---

## WARNING

| Cas | Exemple | Pourquoi WARNING |
|---|---|---|
| URL dynamique/inconnue dans ServiceCallout | `<URL>https://{host}/api</URL>` | Le niveau de confiance ne peut pas être déterminé automatiquement |
| Variable custom inconnue | `<Source>tokenResponse</Source>` | Le plugin ne peut pas détecter l’origine réelle |
| Origine indétectable | Variable créée dynamiquement via JS/Python | Vérification manuelle recommandée |

---

## IGNORER

| Cas | Exemple | Pourquoi IGNORER |
|---|---|---|
| Source de réponse | `response`, `response.content` | Réponse backend/interne |
| Variables internes Apigee | `AccessEntity.*`, `private.*`, `oauthv2.*` | Variables générées en interne par Apigee |
| ServiceCallout interne | `<TargetServer>internal-auth</TargetServer>` | Backend interne géré et considéré fiable |
| LocalTargetConnection | `<LocalTargetConnection/>` | Communication interne entre proxies/services |
| Domaine interne | `https://service.internal/api` | Système interne de l’entreprise |
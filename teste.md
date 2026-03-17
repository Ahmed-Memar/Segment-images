HTTP method control plugin :
je vérifie s’il y a request.verb dans les flows
→ sinon error
pourquoi : pour s’assurer que l’API limite les méthodes autorisées (sinon tout passe)
je vérifie s’il y a un blocage avec RaiseFault
soit dans un flow (catch-all)
soit dans PreFlow (global deny)
→ sinon error
pourquoi : pour empêcher les méthodes non autorisées d’atteindre le backend (fail-closed)
si y a AssignMessage sans RaiseFault
→ warning
pourquoi : les dev pensent bloquer mais la requête continue (faux contrôle)
logique globale : no verb → error (aucun contrôle → surface d’attaque)
verb mais pas de blocage → error (fail-open → dangereux)
assignmessage seul → warning (intention correcte mais mal implémentée)
sinon → ok (API sécurisée)
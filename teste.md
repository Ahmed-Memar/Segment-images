je vérifie s’il y a request.verb dans les flows
→ sinon error
pourquoi : sans request.verb, le proxy ne distingue pas les méthodes (GET, POST, etc.), donc toutes les requêtes sont acceptées par défaut, même celles non prévues → aucun contrôle
je vérifie s’il y a un blocage avec RaiseFault
soit dans un flow (catch-all)
soit dans PreFlow (global deny)
→ sinon error
pourquoi : même si certaines méthodes sont définies, sans RaiseFault les autres méthodes ne sont pas bloquées et continuent vers le backend (fall-through) → comportement fail-open dangereux
si y a AssignMessage sans RaiseFault
→ warning
pourquoi : AssignMessage modifie la réponse mais n’arrête pas l’exécution, donc la requête continue quand même vers le backend → illusion de blocage mais pas de protection réelle
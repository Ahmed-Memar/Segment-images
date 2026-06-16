Tu peux lui écrire simplement :

> J'ai regardé la documentation Apigee. Apparemment, les TargetEndpoints peuvent aussi gérer des erreurs qui seront renvoyées au client via leurs FaultRules ou leur DefaultFaultRule.

La différence que j'ai comprise, c'est que les FaultRules du ProxyEndpoint gèrent les erreurs côté proxy (VerifyJWT, OAuthV2, SpikeArrest, RaiseFault, etc.), alors que les FaultRules du TargetEndpoint gèrent plutôt les erreurs liées à l'appel du backend (timeout, backend indisponible, problème SSL, problème de connexion, etc.).

Par contre, en regardant les 4 bundles que j'ai, je vois que 3 n'ont aucun FaultRule ni DefaultFaultRule dans le TargetEndpoint. Et le 4ème a bien un bloc FaultRules, mais il est vide.

Du coup, je me demande si, dans la pratique chez BNP, la gestion des erreurs n'est pas principalement faite dans les ProxyEndpoints. Tu en penses quoi ?
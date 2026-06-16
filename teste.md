Tu peux lui écrire naturellement :

> J'ai vérifié la documentation Apigee. Oui, les TargetEndpoints peuvent également renvoyer des erreurs à l'utilisateur via leurs FaultRules ou leur DefaultFaultRule.

La différence principale est que les FaultRules du ProxyEndpoint gèrent les erreurs côté proxy (VerifyJWT, OAuthV2, SpikeArrest, RaiseFault, etc.), tandis que les FaultRules du TargetEndpoint gèrent plutôt les erreurs liées à l'appel du backend (timeout, backend indisponible, erreur SSL, problème de connexion, etc.).

Par contre, en regardant les 4 bundles que j'ai à disposition, je constate que 3 n'ont aucun FaultRule ni DefaultFaultRule dans leurs TargetEndpoints. Le quatrième contient bien un bloc <FaultRules>, mais il est vide.

Du coup, je me demande si, dans notre contexte, la gestion des erreurs est généralement centralisée au niveau des ProxyEndpoints et si cela vaut vraiment le coup d'inclure les TargetEndpoints dans le contrôle V1. Qu'en penses-tu ?
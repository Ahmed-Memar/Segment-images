Salut,

J'ai une question concernant les policies VerifyJWT.

En analysant un proxy, je suis tombé sur une configuration comme celle-ci :

<Algorithm>RS256,RS384,RS512,PS256,PS384,PS512</Algorithm>

De mon côté, en regardant la documentation officielle Apigee de VerifyJWT, je n'ai trouvé que des exemples avec un seul algorithme (RS256, PS256, etc.) et aucune mention explicite d'une liste d'algorithmes dans l'élément <Algorithm>.

Est-ce que ce type de configuration est quelque chose d'accepté/utilisé chez nous ? Ou bien est-ce plutôt une ancienne configuration particulière ?

Merci d'avance pour ton retour.
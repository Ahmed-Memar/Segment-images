Donc ici, c’est la structure du plugin EX-CS008 pour le contrôle des méthodes HTTP.

Je vais expliquer chaque étape simplement et pourquoi on a fait ces choix.

Première étape, on vérifie si c’est une API REST avec OASValidation.
Si oui, on ne fait rien et on passe.
Pourquoi ? Parce que ce contrôle est déjà fait dans le plugin précédent avec OASValidation, donc on évite de faire un doublon.

Ensuite, si c’est une API SOAP, là on applique le contrôle.
Pourquoi ? Parce que MessageValidation ne contrôle pas les méthodes HTTP, donc il faut le faire nous-mêmes.

Après, on vérifie qu’il existe une condition sur request.verb.
Pourquoi ? Parce que sans ça, l’API accepte toutes les méthodes sans restriction.

Ensuite, on vérifie qu’il y a un RaiseFault.
Pourquoi ? Parce qu’une condition seule ne bloque rien. Il faut une vraie action pour refuser la requête.

On regarde aussi où le contrôle est placé.
Si c’est dans le PreFlow, c’est parfait parce que ça s’applique à toute l’API.
Si c’est dans un Flow, on met un warning, parce que ça peut ne pas couvrir tous les cas.

Enfin, on a un cas spécial : GET pour récupérer le WSDL.
Normalement, en SOAP, on utilise POST. Mais GET peut être utilisé pour récupérer le WSDL.
Donc on l’autorise, mais seulement si c’est clairement documenté.
Sinon, on met un warning, parce que ça peut être un risque.

Donc globalement, l’idée est simple :
on force POST pour SOAP,
on bloque les autres méthodes,
et on gère les exceptions comme GET de manière contrôlée.
Et on évite de dupliquer ce qui est déjà couvert pour REST.

Questions à valider :
Est-ce qu’on est sûrs que toutes nos APIs sont soit REST soit SOAP ?
Pour SOAP, est-ce qu’on accepte officiellement GET pour le WSDL ou on préfère rester strict POST uniquement ?
Et est-ce qu’on utilise des FlowCallout pour la sécurité, et si oui, est-ce qu’on doit les intégrer dans le plugin ?
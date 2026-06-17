Salut Tariq,

Je suis en train de travailler sur un plugin autour de la gestion des erreurs sur les proxies Apigee.

Pour l'instant, je vérifie la présence de FaultRules ou de DefaultFaultRule au niveau du ProxyEndpoint.

En regardant la documentation Apigee, j'ai vu que les TargetEndpoints peuvent aussi définir des FaultRules pour gérer les erreurs liées au backend (timeout, backend indisponible, problème SSL, etc.) et que ces erreurs peuvent ensuite être renvoyées au client. Du coup, je trouve que c'est un point assez important et pertinent vis-à-vis de l'exigence de sécurité "Exception & Error Management", et je me demande si cela devrait également être pris en compte dans le contrôle.

Par contre, sur les 4 bundles que j'ai analysés, 3 n'ont aucun FaultRule ni DefaultFaultRule dans leurs TargetEndpoints, et le 4ème a bien un bloc FaultRules mais il est vide.

Je voulais donc avoir ton retour : chez BNP, est-ce qu'on s'attend à avoir de la gestion d'erreurs également dans les TargetEndpoints, ou est-ce qu'en pratique c'est plutôt centralisé au niveau des ProxyEndpoints ?

Merci 
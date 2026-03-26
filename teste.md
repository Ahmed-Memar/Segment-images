Au début, j’ai d’abord collecté les exigences de sécurité, puis je les ai analysées pour voir ce qu’on pouvait vérifier directement à partir du bundle et automatiser. Ensuite, j’ai fait le mapping entre les exigences et les policies Apigee correspondantes, ce qui m’a permis de construire une base solide pour travailler.
Après ça, je suis passé à l’implémentation des plugins. J’ai commencé par l’exigence de validation de schéma, avec trois plugins : OASValidation, MessageValidation et un plugin global.
Et actuellement, je suis presque à la fin de la deuxième exigence, qui est le contrôle des méthodes HTTP.


🔹 Question 1 (top)
Est-ce que vous avez déjà des contrôles de sécurité automatisés dans votre pipeline aujourd’hui ?

🔹 Question 2
À quel moment du pipeline vous pensez intégrer apigeelint ? Avant build ou avant déploiement ?

🔹 Question 3 (bonus)
Est-ce que vous utilisez des shared flows pour la sécurité ?
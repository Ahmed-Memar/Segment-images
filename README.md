J’ai travaillé sur des plugins ApigeeLint pour automatiser des contrôles de sécurité.

D’abord, j’ai implémenté l’exigence de Data Schema Control, en utilisant OASValidation pour les APIs REST et MessageValidation pour les APIs SOAP, avec un plugin global pour vérifier la bonne configuration.

Ensuite, je travaille actuellement sur un plugin de contrôle des méthodes HTTP pour les APIs SOAP, afin de s’assurer que seules les méthodes autorisées sont acceptées et que les autres sont correctement bloquées.
## Structure du plugin – Access Token Control

1. Définition du plugin
. plugin : utilisé pour les erreurs (severity = ERROR)  
. warningPlugin : copie du plugin avec severity = WARNING  

2. Helpers (fonctions utilitaires)
. Lecture du XML avec xpath  
. getNodeText : récupérer proprement la valeur d’un élément XML  
. parseTimeAllowanceToSeconds : convertir TimeAllowance en secondes  
. getAlgorithmFamily : détecter le type d’algorithme (HS, RS, ES, PS)  
. hasSecretKey / hasPublicKey : vérifier la présence des clés  
. hasHardcodedValue : détecter les clés hardcodées  
. Fonctions utilitaires pour gérer les lignes/colonnes et valeurs booléennes  

3. Détection des policies
. Récupération des policies OAuthV2 avec opération VerifyAccessToken  
. Récupération des policies VerifyJWT  
. Séparation entre policies valides et celles à analyser  

4. Analyse des VerifyJWT
. Vérification des paramètres obligatoires :  
. Algorithm (présent et sécurisé)  
. Key (cohérente avec l’algorithme)  
. Audience (obligatoire)  
. IgnoreUnresolvedVariables (ne doit pas être true)  
. TimeAllowance (gestion des seuils)  

. Vérification des bonnes pratiques :  
. Issuer recommandé  
. éviter les clés hardcodées  

. Classification des résultats :  
. erreurs (bloquantes)  
. warnings (recommandations)  

5. Vérification globale de l’API
. Vérifier qu’au moins une validation de token existe  
. Vérifier si la validation est appliquée dans le PreFlow  
. Si non, vérifier chaque flow individuellement  
. Identifier les flows non protégés  

6. Résultat final
. Ajouter les messages d’erreur avec plugin  
. Ajouter les warnings avec warningPlugin  
. Retourner le résultat global (API conforme ou non)
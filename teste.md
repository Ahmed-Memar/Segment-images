1. Définition du plugin
   ├─ plugin (ERROR)
   ├─ warningPlugin (WARNING)

2. Helpers (fonctions utilitaires)
   ├─ lire XML (xpath)
   ├─ getNodeText
   ├─ parseTimeAllowance
   ├─ détection clé / algo / etc

3. Détection des policies
   ├─ OAuth2 VerifyAccessToken
   ├─ VerifyJWT

4. Analyse des VerifyJWT
   ├─ Vérifier paramètres (Algorithm, Key, Audience…)
   ├─ Générer erreurs / warnings

5. Vérification globale API
   ├─ Existe-t-il une validation ?
   ├─ Est-ce dans PreFlow ?
   ├─ Sinon → vérifier chaque flow

6. Résultat final
   ├─ Ajouter messages (error / warning)
   ├─ Retourner résultat
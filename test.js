Oui. Le test avec cache vide a réussi : npm a installé le .tgz avec --offline et un cache neuf. Cela confirme que le package contient bien ses dépendances. bundleDependencies + npm pack servent justement à produire ce type de tarball autonome, et --offline interdit les requêtes réseau. 

Il reste juste à terminer le scan local, puis à automatiser ce même contrôle dans le pipeline du scanner.

1. Terminer ton test local

Sur ta capture, le terminal affiche :

>

Cela signifie que le guillemet final manque. Annule avec :

Ctrl+C

Puis copie cette commande sur une seule ligne :

./node_modules/.bin/apigeelint-security scan "$HOME/consumer project/mybundles"

Résultat attendu :

Found 8 Apigee proxy bundle(s).
...
All Apigee proxy bundles were scanned successfully.
Converted 108 ApigeeLint findings to gl-sast-report.json

Après cela, le test local autonome est complètement validé.


---

2. À quoi sert le renforcement du test GitLab ?

Ce changement est permanent.

Il permet au pipeline du dépôt scanner de vérifier à chaque modification que :

le .tgz contient toujours apigeelint ;

le package peut être installé sans Artifactory ;

personne ne casse accidentellement l’exécution locale dans une future version.


Cela ne change pas le fonctionnement principal GitLab CI des consommateurs.

Tu modifies uniquement :

.gitlab-ci.yml

du dépôt scanner, dans le job :

test_npm_package:

Tu ne modifies pas pour cette étape :

ci/apigeelint-security.yml

Le job GitLab recommandé apigeelint_security_sast continuera donc à fonctionner exactement comme avant.


---

3. Modification exacte de .gitlab-ci.yml

Dans le dépôt :

cd "$HOME/apigeelint-security-plugins"

Dans .gitlab-ci.yml, tu as actuellement vers la ligne 87 :

# Install only the generated package, not the current repository directly.
- PACKAGE_TARBALL="$(cat ../package-tarball-name.txt)"
- npm install --no-audit --no-fund "../${PACKAGE_TARBALL}"

Remplace exactement ce bloc par :

# Install only the generated package, not the current repository directly.
# Use an empty cache and offline mode to verify that the tarball contains
# every runtime dependency required by the scanner.
- PACKAGE_TARBALL="$(cat ../package-tarball-name.txt)"
- rm -rf "$CI_PROJECT_DIR/.npm-offline-cache"
- npm install --offline --cache "$CI_PROJECT_DIR/.npm-offline-cache" --no-save --no-audit --no-fund "../${PACKAGE_TARBALL}"

Le reste du job ne change pas.

Les lignes suivantes restent exactement comme elles sont :

# Verify that npm exposed the public CLI declared in package.json.
- test -x ./node_modules/.bin/apigeelint-security

# Run the packaged scanner against this repository's proxy test bundles.
- ./node_modules/.bin/apigeelint-security scan ../apiproxies


---

Pourquoi le début du job garde Artifactory ?

Plus haut, le job exécute toujours :

- npm ci --no-audit --no-fund

avec le .npmrc Artifactory créé par le pipeline.

C’est normal :

1. Artifactory sert à télécharger les dépendances pour construire le package ;


2. npm pack crée ensuite le .tgz autonome ;


3. le nouveau test installe ce .tgz avec un cache vide et sans réseau.



Donc :

Artifactory → construction du package
Offline → validation du package autonome

Cela ne casse pas le pipeline existant.


---

4. Ajouter le cache de test au .gitignore

Dans .gitignore, ajoute cette ligne :

.npm-offline-cache/

Ton .gitignore peut maintenant contenir :

node_modules/
.apigeelint-results/
apigeelint-results.json
apigeelint-stderr.log
gl-sast-report.json
*.tgz
package-consumer/
.npm-offline-cache/

Le .tgz restera ignoré localement, ce qui est correct : il sera généré par le pipeline.


---

5. Vérifier les versions 0.2.1

Dans package.json, tu dois avoir :

"version": "0.2.1"

et :

"dependencies": {
  "apigeelint": "4.9.0"
},
"bundleDependencies": [
  "apigeelint"
]

Garde naturellement la version exacte d’apigeelint déjà présente dans ton fichier si elle diffère.

Vérifie :

grep -n '"version"\|bundleDependencies\|apigeelint' package.json

Puis :

grep -n '"version"' package.json package-lock.json | head

La version principale doit être 0.2.1 dans les deux fichiers.


---

6. Modifier la version par défaut du template CI

Dans :

ci/apigeelint-security.yml

cherche :

APIGEELINT_SECURITY_REF: "v0.2.0"

et remplace par :

APIGEELINT_SECURITY_REF: "v0.2.1"

Cela ne change pas le fonctionnement du scanner. Cela prépare simplement la nouvelle release.

Dans ton .gitlab-ci.yml interne, conserve :

APIGEELINT_SECURITY_REF: "$CI_COMMIT_SHA"

Ne le remplace surtout pas par v0.2.1, car le pipeline interne doit continuer à tester le commit actuel.


---

7. Mettre le README à jour

Dans les exemples GitLab CI du README, remplace :

ref: 'v0.2.0'

par :

ref: 'v0.2.1'

et :

APIGEELINT_SECURITY_REF: 'v0.2.0'

par :

APIGEELINT_SECURITY_REF: 'v0.2.1'

Pour l’utilisation locale, utilise cette section :

## Local execution

The standalone scanner package can be used without access to an npm registry
or Artifactory.

Requirements:

- Node.js 20 or later;
- Bash or Git Bash;
- access to the standalone scanner package.

Download:

```text
apigeelint-security-plugins-0.2.1.tgz
```

From the directory containing the package, install it:

```bash
npm install --offline --no-save \
  ./apigeelint-security-plugins-0.2.1.tgz
```

Scan every proxy under a directory:

```bash
./node_modules/.bin/apigeelint-security scan mybundles
```

Scan one specific proxy:

```bash
./node_modules/.bin/apigeelint-security scan \
  path/to/my-proxy/apiproxy
```

The scanner recursively searches the provided path for directories named
`apiproxy`.

The standalone package includes its runtime dependencies. No npm registry or
Artifactory configuration is required.


---

8. Exécuter les dernières validations locales

Dans le dépôt scanner :

cd "$HOME/apigeelint-security-plugins"

Exécute :

bash -n scripts/scan-all-apigee-proxies.sh

node --check bin/apigeelint-security.js

node --check convert-apigeelint-to-gitlab-sast.js

npm install --package-lock-only

npm ci

npm run pack:check

npm pack

Puis vérifie encore la dépendance :

tar -tf apigeelint-security-plugins-0.2.1.tgz \
  | grep "node_modules/apigeelint/package.json"

Résultat attendu :

package/node_modules/apigeelint/package.json


---

9. Vérifier les fichiers modifiés

Supprime le .tgz local :

rm -f apigeelint-security-plugins-0.2.1.tgz

Puis :

git status

Tu dois principalement voir :

modified: .gitignore
modified: .gitlab-ci.yml
modified: README.md
modified: ci/apigeelint-security.yml
modified: package.json
modified: package-lock.json

Ajoute-les :

git add \
  .gitignore \
  .gitlab-ci.yml \
  README.md \
  ci/apigeelint-security.yml \
  package.json \
  package-lock.json

Vérifie :

git diff --cached --stat

Puis vérifie spécialement le pipeline :

git diff --cached -- .gitlab-ci.yml

Tu dois voir l’ajout de :

- rm -rf "$CI_PROJECT_DIR/.npm-offline-cache"
- npm install --offline --cache "$CI_PROJECT_DIR/.npm-offline-cache" --no-save --no-audit --no-fund "../${PACKAGE_TARBALL}"


---

10. Commit et push

git commit -m "Add standalone offline scanner package"

Puis :

git push origin docker-runtime

Le pipeline de la branche exécutera toujours :

test_npm_package ;

apigeelint_security_sast.


Le résultat attendu est :

test_npm_package        Passed
apigeelint_security_sast Passed

Le premier vérifiera maintenant automatiquement l’installation offline. Le deuxième confirmera que l’utilisation GitLab CI recommandée fonctionne toujours.

Après ce pipeline vert, tu pourras créer le tag v0.2.1, puis tester le dépôt consommateur avec v0.2.1.
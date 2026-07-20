Oui. Il reste trois modifications importantes avant le commit :

1. fixer le chemin du projet scanner dans le template CI ;


2. faire tester à votre pipeline le commit actuel, pas l’ancien tag v0.1.0 ;


3. remplacer entièrement le README par une version plus courte, séparant consommateurs et développeurs.



1. Modifier ci/apigeelint-security.yml

Au début du fichier, remplace le bloc variables: actuel par :

variables:
  # Internal project containing the scanner package.
  APIGEELINT_SECURITY_PROJECT_PATH: "gf/ITG-ITRMG/CDF-EXI-AppSec/appsec-tools/apigeelint-security-plugins"

  # Scanner version installed by consumer projects.
  APIGEELINT_SECURITY_REF: "v0.2.0"

  # Directory searched recursively for Apigee proxy bundles.
  APIGEE_PROXY_ROOT: "apiproxies"

  # Project-local npm cache.
  npm_config_cache: "$CI_PROJECT_DIR/.npm"

Le reste de ci/apigeelint-security.yml ne change pas.

Pourquoi v0.2.0 ? Parce que v0.1.0 existe déjà et pointe vers l’ancienne version. Les modifications actuelles devront être publiées avec un nouveau tag.


---

2. Modifier .gitlab-ci.yml du dépôt scanner

Dans le dépôt du scanner, tu avais actuellement :

variables:
  APIGEELINT_SECURITY_PROJECT_PATH: "$CI_PROJECT_PATH"
  APIGEELINT_SECURITY_REF: "v0.1.0"
  APIGEE_PROXY_ROOT: "apiproxies"

Remplace-le par :

variables:
  APIGEELINT_SECURITY_PROJECT_PATH: "$CI_PROJECT_PATH"

  # Test the package from the exact commit currently running.
  APIGEELINT_SECURITY_REF: "$CI_COMMIT_SHA"

  APIGEE_PROXY_ROOT: "apiproxies"

C’est important : avant, ton pipeline testait toujours l’ancien package du tag v0.1.0. Avec $CI_COMMIT_SHA, il testera réellement les modifications que tu viens de faire.

L’include local reste :

include:
  - project: 'Production-mutualisee/IPS/IDO/gitlab-cicd/pipelines'
    file: '.gitlab-ci.yml'

  - local: '/ci/apigeelint-security.yml'


---

3. Mettre la version npm à jour

Dans package.json, remplace :

"version": "0.1.0"

par :

"version": "0.2.0"

Puis mets à jour automatiquement package-lock.json :

npm install --package-lock-only

Vérifie ensuite :

grep -n '"version"' package.json package-lock.json | head

Tu dois voir 0.2.0 pour le package principal dans les deux fichiers.


4. Vérifications avant commit

Exécute exactement :

bash -n scripts/scan-all-apigee-proxies.sh

node --check bin/apigeelint-security.js

node --check convert-apigeelint-to-gitlab-sast.js

npm ci

npm run scan -- apiproxies

node -e "JSON.parse(require('fs').readFileSync('gl-sast-report.json', 'utf8')); console.log('SAST report valid')"

npm run pack:check

Puis vérifie les références restantes :

grep -R "run-all-apiproxies\|v0.1.0\|Dockerfile\|dockerignore" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  .

Le résultat ne doit contenir aucune ancienne référence utile. Une occurrence dans un historique ou un fichier généré ne compte pas.

Supprime les rapports locaux :

rm -f apigeelint-results.json apigeelint-stderr.log gl-sast-report.json

Puis :

git status

5. Commit et push

Comme les fichiers sont déjà staged, après les dernières modifications fais :

git add README.md package.json package-lock.json .gitlab-ci.yml ci/apigeelint-security.yml

Puis :

git diff --cached --stat

git diff --cached

Si tout est correct :

git commit -m "Finalize npm scanner and reusable CI template"

Puis :

git push origin docker-runtime

Ne crée pas encore le tag v0.2.0 sur cette branche. Attends que le pipeline réussisse et que les changements soient fusionnés dans main.
cat > .gitlab-ci.yml <<'EOF'
include:
  # Variables et définitions CI partagées.
  - project: 'Production-mutualisee/IPS/IDO/gitlab-cicd/pipelines'
    file: '.gitlab-ci.yml'

  # Scanner ApigeeLint Security réutilisable.
  - project: 'gf/ITG-ITRMG/CDF-EXI-AppSec/appsec-tools/apigeelint-security-plugins'
    ref: 'v0.1.0'
    file: '/ci/apigeelint-security.yml'

variables:
  # Projet qui contient le package npm du scanner.
  APIGEELINT_SECURITY_PROJECT_PATH: 'gf/ITG-ITRMG/CDF-EXI-AppSec/appsec-tools/apigeelint-security-plugins'

  # Version immuable du scanner.
  APIGEELINT_SECURITY_REF: 'v0.1.0'

  # Racine contenant les bundles Apigee de ce dépôt consommateur.
  APIGEE_PROXY_ROOT: 'apiproxies'
EOF
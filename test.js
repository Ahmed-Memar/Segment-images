import os
import json
from collections import defaultdict

FOLDER_PATH = "results_json"

# Mapping ruleId -> nom complet plugin
PLUGIN_NAMES = {
    "EX-CS002": "EX-CS002-CheckJSONThreatProtection",
    "EX-CS003": "EX-CS003-CheckXMLThreatProtection",
    "EX-CS004": "EX-CS004-CheckSpikeArrest",
    "EX-CS005": "EX-CS005-CheckOASValidation",
    "EX-CS006": "EX-CS006-CheckSOAPMessageValidation",
    "EX-CS007": "EX-CS007-DataSchemaControl",
    "EX-CS008": "EX-CS008-CheckHTTPMethodControl",
    "EX-CS009": "EX-CS009-CheckAccessTokenControl",
    "EX-CS010": "EX-CS010-DetectApiPayloadFormat"
}

TARGET_RULES = set(PLUGIN_NAMES.keys())

plugin_stats = defaultdict(lambda: {
    "fail": 0,
    "warning": 0,
    "apis": set(),

    # stats détaillées par API
    "api_details": defaultdict(lambda: {
        "fail": 0,
        "warning": 0
    })
})

# Stocker toutes les APIs analysées
all_apis = set()


def process_entry(entry, filename):
    """
    Analyse une entrée JSON et met à jour les statistiques
    pour les plugins ciblés.
    """
    api_name = filename.replace(".json", "")

    if isinstance(entry, dict):
        messages = entry.get("messages", [])

        for msg in messages:
            if isinstance(msg, dict):
                rule_id = msg.get("ruleId")
                severity = msg.get("severity")

                if rule_id in TARGET_RULES:

                    # stats globales
                    if severity == 2:
                        plugin_stats[rule_id]["fail"] += 1
                        plugin_stats[rule_id]["api_details"][api_name]["fail"] += 1

                    elif severity == 1:
                        plugin_stats[rule_id]["warning"] += 1
                        plugin_stats[rule_id]["api_details"][api_name]["warning"] += 1

                    plugin_stats[rule_id]["apis"].add(api_name)

    elif isinstance(entry, list):
        for sub in entry:
            process_entry(sub, filename)


# Parcourir tous les fichiers JSON
for filename in os.listdir(FOLDER_PATH):
    if filename.endswith(".json"):
        file_path = os.path.join(FOLDER_PATH, filename)

        api_name = filename.replace(".json", "")
        all_apis.add(api_name)

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            process_entry(data, filename)

        except Exception as e:
            print(f"Erreur lecture {filename}: {e}")


# Affichage des résultats
print("\n===== RESULTATS PAR PLUGIN =====\n")

print(f"TOTAL APIs ANALYSEES : {len(all_apis)}\n")

for rule in sorted(TARGET_RULES):
    stats = plugin_stats[rule]
    total = stats["fail"] + stats["warning"]
    impacted_apis = sorted(stats["apis"])
    plugin_name = PLUGIN_NAMES[rule]

    print(f"{plugin_name}")
    print(f"  FAIL: {stats['fail']}")
    print(f"  WARNING: {stats['warning']}")
    print(f"  TOTAL: {total}")
    print(f"  APIs impactees: {len(impacted_apis)}")

    # Afficher les noms seulement si <= 12
    if 0 < len(impacted_apis) <= 12:
        print("  Noms des APIs impactees:")

        for api in impacted_apis:
            fail_count = stats["api_details"][api]["fail"]
            warning_count = stats["api_details"][api]["warning"]
            total_api = fail_count + warning_count

            # Si une seule remarque → afficher juste le nom
            if total_api == 1:
                print(f"    - {api}")

            # Sinon afficher détails
            else:
                details = []

                if fail_count > 0:
                    details.append(f"{fail_count} FAIL")

                if warning_count > 0:
                    details.append(f"{warning_count} WARNING")

                details_str = ", ".join(details)

                print(f"    - {api} ({details_str})")

    print()
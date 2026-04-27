import os
import json
from collections import defaultdict

FOLDER_PATH = "results_json"

TARGET_RULES = {
    "EX-CS002",
    "EX-CS003",
    "EX-CS004",
    "EX-CS005",
    "EX-CS006",
    "EX-CS007",
    "EX-CS008"
}

plugin_stats = defaultdict(lambda: {
    "alerts": 0,
    "apis": set()
})


def process_entry(entry, filename):
    # Si c'est un dict
    if isinstance(entry, dict):
        messages = entry.get("messages", [])

        for msg in messages:
            if isinstance(msg, dict):
                rule_id = msg.get("ruleId")

                if rule_id in TARGET_RULES:
                    plugin_stats[rule_id]["alerts"] += 1
                    plugin_stats[rule_id]["apis"].add(filename)

    # Si c'est une liste → on descend dedans
    elif isinstance(entry, list):
        for sub in entry:
            process_entry(sub, filename)


for filename in os.listdir(FOLDER_PATH):
    if filename.endswith(".json"):
        file_path = os.path.join(FOLDER_PATH, filename)

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            process_entry(data, filename)

        except Exception as e:
            print(f"Erreur lecture {filename}: {e}")


print("\n===== RESULTATS PAR PLUGIN =====\n")

for rule in sorted(TARGET_RULES):
    stats = plugin_stats[rule]
    print(f"{rule}")
    print(f"  Alerts: {stats['alerts']}")
    print(f"  APIs impactees: {len(stats['apis'])}")
    print()
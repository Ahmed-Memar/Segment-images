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
    "fail": 0,
    "warning": 0,
    "apis": set()
})


def process_entry(entry, filename):
    if isinstance(entry, dict):
        messages = entry.get("messages", [])

        for msg in messages:
            if isinstance(msg, dict):
                rule_id = msg.get("ruleId")
                severity = msg.get("severity")

                if rule_id in TARGET_RULES:
                    if severity == 2:
                        plugin_stats[rule_id]["fail"] += 1
                    elif severity == 1:
                        plugin_stats[rule_id]["warning"] += 1

                    plugin_stats[rule_id]["apis"].add(filename)

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
    total = stats["fail"] + stats["warning"]

    print(f"{rule}")
    print(f"  FAIL: {stats['fail']}")
    print(f"  WARNING: {stats['warning']}")
    print(f"  TOTAL: {total}")
    print(f"  APIs impactees: {len(stats['apis'])}")
    print()
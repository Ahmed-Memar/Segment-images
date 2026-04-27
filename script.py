import os
import json
from collections import defaultdict

# 🔧 chemin vers le dossier contenant les JSON
FOLDER_PATH = "results_json"   # à modifier

# structure des stats
plugin_stats = defaultdict(lambda: {
    "total_alerts": 0,
    "fail": 0,
    "warning": 0,
    "apis": set()
})

# parcourir tous les fichiers JSON
for filename in os.listdir(FOLDER_PATH):
    if filename.endswith(".json"):
        filepath = os.path.join(FOLDER_PATH, filename)

        with open(filepath, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except:
                print(f"Erreur lecture {filename}")
                continue

        # chaque fichier = 1 API
        api_name = filename

        for item in data:
            messages = item.get("messages", [])

            for msg in messages:
                rule_id = msg.get("ruleId", "UNKNOWN")
                severity = msg.get("severity", 0)

                plugin_stats[rule_id]["total_alerts"] += 1
                plugin_stats[rule_id]["apis"].add(api_name)

                # 🔴 FAIL (severity = 2)
                if severity == 2:
                    plugin_stats[rule_id]["fail"] += 1

                # 🟡 WARNING (severity = 1)
                elif severity == 1:
                    plugin_stats[rule_id]["warning"] += 1

# afficher les résultats
print("\n📊 Résultats par plugin\n")

for rule_id, stats in plugin_stats.items():
    print(f"Plugin: {rule_id}")
    print(f"  Total alerts: {stats['total_alerts']}")
    print(f"  FAIL: {stats['fail']}")
    print(f"  WARNING: {stats['warning']}")
    print(f"  APIs impactées: {len(stats['apis'])}")
    print("-" * 40)
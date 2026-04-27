import os
import json
from collections import defaultdict

# 📁 Dossier contenant les JSON (à modifier)
FOLDER_PATH = "C:/chemin/vers/ton/dossier/json"

# 🎯 Plugins à analyser
TARGET_RULES = {
    "EX-CS002",
    "EX-CS003",
    "EX-CS004",
    "EX-CS005",
    "EX-CS006",
    "EX-CS007",
    "EX-CS008"
}

# 📊 Stockage résultats
plugin_stats = defaultdict(lambda: {
    "alerts": 0,
    "apis": set()
})

# 🔍 Parcours des fichiers
for filename in os.listdir(FOLDER_PATH):
    if filename.endswith(".json"):
        file_path = os.path.join(FOLDER_PATH, filename)

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Chaque fichier contient une liste d’objets
            for entry in data:
                messages = entry.get("messages", [])

                for msg in messages:
                    rule_id = msg.get("ruleId")

                    if rule_id in TARGET_RULES:
                        plugin_stats[rule_id]["alerts"] += 1
                        plugin_stats[rule_id]["apis"].add(filename)

        except Exception as e:
            print(f"Erreur lecture {filename}: {e}")

# 📊 Affichage résultats
print("\n===== RESULTATS PAR PLUGIN =====\n")

for rule in sorted(TARGET_RULES):
    stats = plugin_stats[rule]
    print(f"{rule}")
    print(f"  ➤ Alerts: {stats['alerts']}")
    print(f"  ➤ APIs impactées: {len(stats['apis'])}")
    print()
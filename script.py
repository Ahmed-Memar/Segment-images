import os
import json
from collections import defaultdict

FOLDER_PATH = "results_json"

plugin_stats = defaultdict(lambda: {
    "total_alerts": 0,
    "fail": 0,
    "warning": 0,
    "apis": set()
})

# 🔥 pour éviter doublons
seen_messages = set()

for filename in os.listdir(FOLDER_PATH):
    if filename.endswith(".json"):
        filepath = os.path.join(FOLDER_PATH, filename)

        with open(filepath, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except:
                print(f"Erreur lecture {filename}")
                continue

        api_name = filename

        # 🔍 parcourir récursivement (plus fiable)
        def extract_items(obj):
            if isinstance(obj, dict):
                yield obj
            elif isinstance(obj, list):
                for x in obj:
                    yield from extract_items(x)

        for item in extract_items(data):

            messages = item.get("messages", [])

            for msg in messages:
                rule_id = msg.get("ruleId", "UNKNOWN").strip()
                severity = msg.get("severity", 0)
                message_text = msg.get("message", "").strip()

                # 🔥 clé unique pour éviter doublons
                unique_key = (api_name, rule_id, message_text)

                if unique_key in seen_messages:
                    continue

                seen_messages.add(unique_key)

                plugin_stats[rule_id]["total_alerts"] += 1
                plugin_stats[rule_id]["apis"].add(api_name)

                if severity == 2:
                    plugin_stats[rule_id]["fail"] += 1
                elif severity == 1:
                    plugin_stats[rule_id]["warning"] += 1


# affichage trié propre
print("\nRésultats par plugin (clean)\n")

for rule_id in sorted(plugin_stats.keys()):
    stats = plugin_stats[rule_id]

    print(f"Plugin: {rule_id}")
    print(f"  Total alerts: {stats['total_alerts']}")
    print(f"  FAIL: {stats['fail']}")
    print(f"  WARNING: {stats['warning']}")
    print(f"  APIs impactées: {len(stats['apis'])}")
    print("-" * 40)
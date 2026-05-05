JSONThreatProtection (EX-CS002)

ContainerDepth

Il définit la profondeur maximale d’imbrication du JSON (objets et tableaux).

Je l’ai mis en erreur parce que c’est le point le plus critique pour éviter les JSON très imbriqués qui peuvent bloquer ou faire tomber le système.



---

ObjectEntryCount

Il définit le nombre maximum de clés dans un objet JSON.

Je l’ai mis en warning parce que ça dépend du métier, certaines APIs peuvent avoir beaucoup de champs donc on ne peut pas bloquer directement.



---

StringValueLength

Il définit la taille maximale des valeurs texte dans le JSON.

Je l’ai mis en warning parce que certaines APIs manipulent des données volumineuses comme du base64 ou des documents.



---

ArrayElementCount

Il définit le nombre maximum d’éléments dans un tableau JSON.

Je l’ai mis en warning parce que la taille des tableaux dépend du contexte, par exemple entre une pagination simple et un traitement en masse.



---

ObjectEntryNameLength

Il définit la taille maximale des noms de clés JSON.

Je ne l’ai pas pris en compte parce que l’impact sécurité est faible et ça risque surtout de générer du bruit inutile.



---

Source

Il définit quel message est analysé (request, response ou message).

Je ne l’ai pas pris en compte parce que la valeur par défaut suffit dans la majorité des cas et ça n’apporte pas vraiment de sécurité en plus.



---

🔹 XMLThreatProtection (EX-CS003)

StructureLimits / NodeDepth

Il définit la profondeur maximale des balises XML.

Je l’ai mis en erreur parce que c’est le contrôle principal contre les XML très imbriqués qui peuvent provoquer des attaques type XML bomb.



---

StructureLimits / ChildCount

Il définit le nombre maximum d’éléments enfants par balise.

Je l’ai mis en erreur parce que ça permet d’éviter les structures XML trop volumineuses qui peuvent saturer les ressources.



---

ValueLimits / Text

Il définit la taille maximale du texte contenu dans une balise XML.

Je l’ai mis en warning parce que certaines APIs transportent des contenus longs donc ça dépend du besoin métier.



---

ValueLimits / Attribute

Il définit la taille maximale des valeurs des attributs XML.

Je l’ai mis en warning parce que c’est utile mais pas critique et ça dépend aussi du contexte de l’API.



---

StructureLimits / AttributeCountPerElement

Il définit le nombre maximum d’attributs sur une balise XML.

Je l’ai mis en warning parce que ça permet de limiter les abus mais les besoins peuvent varier selon les cas.


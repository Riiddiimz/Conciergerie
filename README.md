# Maison Sereine — site vitrine de conciergerie

Site vitrine statique en HTML, CSS et JavaScript natifs, pensé pour une conciergerie de location saisonnière premium.

## Pages

- `index.html` — accueil, services, étapes, témoignages et appel à l’action
- `services.html` — prestations, propriétaires et voyageurs
- `a-propos.html` — histoire, valeurs et zone d’intervention
- `contact.html` — coordonnées et formulaire qui prépare un e-mail via le logiciel de messagerie du visiteur

## Structure

```
/
├── index.html
├── services.html
├── a-propos.html
├── contact.html
├── css/style.css
├── js/main.js
├── content.json
├── images/
└── README.md
```

## Modifier les contenus

Les textes éditoriaux, les coordonnées et les cartes sont centralisés dans `content.json`. Les attributs `data-content`, `data-html`, `data-attr-*` et les modèles `data-list` sont alimentés par `js/main.js`.

Les coordonnées, témoignages, portrait, zone d’intervention et coordonnées de démonstration doivent être vérifiés et remplacés avant toute mise en production. L’adresse en domaine `.example` est volontairement fictive. Le formulaire n’envoie pas de données à un serveur : il valide les champs puis ouvre le logiciel de messagerie avec un brouillon prérempli.

## Prévisualisation locale

Le chargement de `content.json` nécessite un serveur HTTP local (ne pas ouvrir les fichiers en `file://`). Depuis la racine du projet, lancer par exemple :

```bash
python -m http.server 8000
```

Puis ouvrir http://localhost:8000.

## Déploiement Vercel

Importer le dépôt GitHub dans Vercel ou l’associer à un projet Vercel existant. Framework preset : **Other** ; build command et output directory laissés vides (racine statique). Une fois l’intégration GitHub/Vercel activée, les nouveaux commits sur `main` déclenchent le déploiement de production et les branches peuvent générer des previews.

## Photos & typographies

Les photos sont chargées depuis Unsplash via des URLs directes. Les typographies sont Playfair Display et DM Sans depuis Google Fonts. L’iframe de carte est fournie par OpenStreetMap.

## Contrôles recommandés avant publication

- Vérifier la réalité des coordonnées et la disponibilité des prestations.
- Remplacer les témoignages et le portrait de démonstration par des contenus authentiques.
- Tester le formulaire sur un appareil avec un logiciel de messagerie configuré.
- Contrôler l’affichage mobile, le chargement des images et les contrastes.

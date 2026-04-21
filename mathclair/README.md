# MathClair

Plateforme de cours de mathématiques statique, hébergeable sur GitHub Pages.

---

## Hébergement sur GitHub Pages

1. Crée un repo GitHub (ex: `mathclair`)
2. Pousse tous ces fichiers à la racine
3. Dans les Settings du repo → Pages → Source : `main` / `/(root)`
4. Ton site sera accessible sur `https://[username].github.io/mathclair`

---

## Mot de passe admin

Le mot de passe par défaut est **`mathclair2024`**.

Pour le changer, ouvre `js/admin.js` et modifie :
```js
const ADMIN_PASS_B64 = btoa('ton_nouveau_mot_de_passe');
```

---

## Ajouter un cours

### Via l'interface admin
1. Va sur `/admin.html`
2. Connecte-toi
3. Glisse ton fichier JSON sur la zone de dépôt
4. Clique sur "Importer ce cours"

⚠️ Les cours importés via l'admin sont stockés dans le `localStorage` du navigateur.
Pour qu'ils soient **permanents et visibles par tous**, il faut les mettre dans `/data/` et les lister dans `js/loader.js`.

### En dur (recommandé pour la production)
1. Place ton fichier JSON dans `/data/`
2. Dans `js/loader.js`, ajoute le nom du fichier à `BUNDLED_COURSES` :
```js
const BUNDLED_COURSES = [
  'cours_seconde_fonctions_signes.json',
  'ton_nouveau_cours.json',   // ← ici
];
```
3. Commit et push

---

## Structure des fichiers

```
/
├── index.html          ← Page d'accueil
├── cours.html          ← Page de cours dynamique
├── admin.html          ← Interface d'administration
├── css/
│   └── style.css
├── js/
│   ├── theme.js        ← Gestion thème clair/sombre
│   ├── loader.js       ← Chargement des cours JSON
│   ├── cours.js        ← Rendu dynamique du cours
│   └── admin.js        ← Interface admin + upload
└── data/
    └── cours_seconde_fonctions_signes.json
```

---

## Prompt pour générer un fichier JSON de cours avec une IA

Copie-colle ce prompt dans ChatGPT, Claude, ou n'importe quelle IA :

---

```
Je veux que tu génères un fichier JSON pour un cours de mathématiques.
Respecte EXACTEMENT la structure suivante, sans ajouter de champ supplémentaire,
sans enlever de champ obligatoire, et sans mettre de backticks ou de markdown
autour du JSON — réponds uniquement avec le JSON brut.

STRUCTURE OBLIGATOIRE :

{
  "id": "niveau-chapitre-titre-court",        ← minuscules, tirets, pas d'espaces
  "titre": "Titre du cours",
  "matiere": "Mathématiques",
  "niveau": "Seconde",                         ← ou Première, Terminale
  "chapitre": "Nom du chapitre",
  "description": "Une phrase décrivant le cours.",
  "couleur": "#6366f1",                        ← couleur hexadécimale quelconque
  "icone": "📐",                               ← un emoji représentatif

  "lecons": [
    {
      "id": "lecon-1",
      "titre": "Titre de la leçon",
      "contenu": [
        // bloc intro
        { "type": "intro", "texte": "Texte d'introduction." },

        // bloc règle / propriété / définition
        {
          "type": "regle",
          "titre": "Titre de la règle",
          "texte": "Énoncé introductif :",
          "items": ["Point 1", "Point 2"]
        },

        // bloc exemple avec calculs textuels
        {
          "type": "exemple",
          "titre": "Titre de l'exemple",
          "etapes": [
            { "texte": "Explication.", "calcul": "Calcul optionnel en texte" },
            { "texte": "Conclusion." }
          ]
        },

        // bloc exemple avec tableau de signes (si pertinent)
        {
          "type": "exemple",
          "titre": "Exemple avec tableau",
          "etapes": [
            { "texte": "Explication." },
            {
              "texte": "Tableau de signes :",
              "tableau": {
                "headers": ["x", "−∞", "", "valeur1", "", "valeur2", "", "+∞"],
                "lignes": [
                  { "label": "facteur 1", "valeurs": ["−", "−", "0", "+"] },
                  { "label": "résultat", "valeurs": ["+", "0", "−", "0", "+"], "gras": true }
                ]
              }
            },
            { "texte": "Conclusion." }
          ]
        }
      ]
    }
  ],

  "exercices": [
    {
      "id": "ex-1",
      "titre": "Exercice 1 — Description courte",
      "difficulte": 1,                          ← 1, 2 ou 3 étoiles
      "enonce": "Texte de l'énoncé.",
      "indices": ["Indice 1", "Indice 2"],       ← peut être vide []
      "solution": {
        "etapes": ["Étape 1", "Étape 2", "Réponse finale"],
        "tableau": null                          ← ou un objet tableau comme ci-dessus
      }
    }
  ],

  "fiche_revision": {
    "titre": "Fiche de révision — Titre",
    "sections": [
      {
        "titre": "À retenir",
        "items": ["Point 1", "Point 2"]
      },
      {
        "titre": "Les étapes",
        "items": ["Étape 1 : ...", "Étape 2 : ..."]
      },
      {
        "titre": "Pièges classiques",
        "items": ["Piège 1", "Piège 2"]
      }
    ]
  }
}

RÈGLES IMPORTANTES :
- L'id doit être unique, en minuscules, avec des tirets (ex: "seconde-algebre-factorisation")
- Les valeurs dans "valeurs" des tableaux de signes sont : "+", "−", "0", "||" (valeur interdite)
- Le nombre de valeurs dans chaque ligne du tableau doit correspondre au nombre de colonnes de valeurs dans les headers (les colonnes vides "" comptent)
- Ne mets JAMAIS de LaTeX ($...$) — utilise des caractères unicode (−, ×, ÷, √, ≥, ≤, ∈, ∀, ∃, →, ⟹, etc.)
- Écris les intervalles avec les symboles : ] −∞ ; 0 [  ou  [ −3 ; 2 ]
- Le JSON doit être valide et parseable directement

Génère maintenant un cours complet sur : [DÉCRIS ICI TON SUJET, ex: "les équations du second degré en Première, avec discriminant, racines, et factorisation"]
```

---

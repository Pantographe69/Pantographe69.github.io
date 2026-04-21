// admin.js — Gestion de l'espace admin
// Le mot de passe est stocké en clair ici (hashé en base64 pour ne pas être trivial)
// C'est volontaire : pas de BDD, hébergement statique GitHub Pages.

// Pour changer le mot de passe : encoder en base64 votre mot de passe
// et remplacer la valeur ci-dessous.
// Exemple JS : btoa('monmotdepasse') → valeur à coller
const ADMIN_PASS_B64 = btoa('mathclair2024'); // mot de passe par défaut : mathclair2024
const SESSION_KEY = 'mathclair-admin-session';

let pendingCours = null;

// ---- Auth ----
function login() {
  const input = document.getElementById('adminPass');
  const val = input?.value || '';
  if (btoa(val) === ADMIN_PASS_B64) {
    sessionStorage.setItem(SESSION_KEY, '1');
    showAdminPanel();
  } else {
    const err = document.getElementById('loginError');
    if (err) err.style.display = 'block';
    input.value = '';
    input.focus();
    setTimeout(() => err && (err.style.display = 'none'), 3000);
  }
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  location.reload();
}

function checkSession() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

// Enter key on password input
document.addEventListener('DOMContentLoaded', () => {
  const passInput = document.getElementById('adminPass');
  if (passInput) {
    passInput.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  }

  if (checkSession()) {
    showAdminPanel();
  }

  // Setup drag & drop
  setupDrop();

  // Show template
  renderTemplate();
});

// ---- Admin panel ----
function showAdminPanel() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('adminSection').style.display = 'block';
  loadAdminCoursList();
}

async function loadAdminCoursList() {
  const list = document.getElementById('adminCoursList');
  if (!list) return;

  const courses = await getCoursList();
  if (!courses.length) {
    list.innerHTML = '<p style="font-size:0.85rem;color:var(--text-3)">Aucun cours.</p>';
    return;
  }

  list.innerHTML = courses.map(c => `
    <div class="admin-course-item">
      <span style="font-size:1.3rem">${c.icone || '📐'}</span>
      <div class="admin-course-info">
        <strong>${c.titre}</strong>
        <span>${c.niveau} — ${c.chapitre} · ${c.lecons?.length || 0} leçon(s), ${c.exercices?.length || 0} exo(s)</span>
      </div>
      <a href="cours.html?id=${c.id}" target="_blank" style="font-size:0.75rem;color:var(--text-3)">Voir →</a>
    </div>
  `).join('');
}

// ---- File drop & upload ----
function setupDrop() {
  const zone = document.getElementById('dropZone');
  const input = document.getElementById('fileInput');
  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  input.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });
}

function handleFile(file) {
  if (!file.name.endsWith('.json')) {
    showUploadError('Format non supporté. Utilise un fichier .json');
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      validateCours(data);
      pendingCours = data;
      showPreview(file.name, data);
    } catch (err) {
      showUploadError('Fichier JSON invalide : ' + err.message);
    }
  };
  reader.readAsText(file);
}

function validateCours(data) {
  const required = ['id', 'titre', 'niveau', 'chapitre'];
  for (const field of required) {
    if (!data[field]) throw new Error(`Champ requis manquant : "${field}"`);
  }
  if (data.id && !/^[a-z0-9-]+$/.test(data.id)) {
    throw new Error('L\'id doit être en minuscules, chiffres et tirets uniquement');
  }
}

function showPreview(filename, data) {
  document.getElementById('dropZone').style.display = 'none';
  document.getElementById('uploadPreview').style.display = 'block';
  document.getElementById('previewFileName').textContent = filename;
  document.getElementById('previewInfo').innerHTML = `
    <span>📚 <strong>${data.titre}</strong></span>
    <span>🎓 ${data.niveau} — ${data.chapitre}</span>
    <span>📖 ${data.lecons?.length || 0} leçon(s) · ${data.exercices?.length || 0} exercice(s)</span>
    <span>🆔 id : ${data.id}</span>
  `;
}

function clearUpload() {
  pendingCours = null;
  document.getElementById('dropZone').style.display = 'block';
  document.getElementById('uploadPreview').style.display = 'none';
  document.getElementById('uploadSuccess').style.display = 'none';
  document.getElementById('uploadError').style.display = 'none';
  document.getElementById('fileInput').value = '';
}

function importCours() {
  if (!pendingCours) return;
  try {
    saveCours(pendingCours);
    document.getElementById('uploadSuccess').textContent = `✓ Cours "${pendingCours.titre}" importé avec succès !`;
    document.getElementById('uploadSuccess').style.display = 'block';
    document.getElementById('uploadError').style.display = 'none';
    loadAdminCoursList();
    setTimeout(clearUpload, 3000);
  } catch (e) {
    showUploadError('Erreur lors de l\'import : ' + e.message);
  }
}

function showUploadError(msg) {
  const el = document.getElementById('uploadError');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

// ---- Template ----
const TEMPLATE = {
  "id": "niveau-chapitre-titre",
  "titre": "Titre du cours",
  "matiere": "Mathématiques",
  "niveau": "Seconde",
  "chapitre": "Nom du chapitre",
  "description": "Courte description du cours.",
  "couleur": "#6366f1",
  "icone": "📐",
  "lecons": [
    {
      "id": "lecon-1",
      "titre": "Titre de la leçon",
      "contenu": [
        {
          "type": "intro",
          "texte": "Texte d'introduction à la leçon."
        },
        {
          "type": "regle",
          "titre": "Titre de la règle / propriété",
          "texte": "Description de la règle :",
          "items": [
            "Point 1",
            "Point 2",
            "Point 3"
          ]
        },
        {
          "type": "exemple",
          "titre": "Titre de l'exemple",
          "etapes": [
            {
              "texte": "Explication de l'étape.",
              "calcul": "Calcul optionnel affiché en monospace"
            },
            {
              "texte": "Étape avec tableau de signes :",
              "tableau": {
                "headers": ["x", "−∞", "", "a", "", "b", "", "+∞"],
                "lignes": [
                  { "label": "facteur 1", "valeurs": ["−", "−", "0", "+"] },
                  { "label": "facteur 2", "valeurs": ["−", "0", "+", "+"] },
                  { "label": "produit", "valeurs": ["+", "0", "−", "0", "+"], "gras": true }
                ]
              }
            },
            {
              "texte": "Conclusion : ..."
            }
          ]
        }
      ]
    }
  ],
  "exercices": [
    {
      "id": "ex-1",
      "titre": "Exercice 1 — Titre",
      "difficulte": 1,
      "enonce": "Texte de l'énoncé.",
      "indices": [
        "Premier indice",
        "Deuxième indice (optionnel)"
      ],
      "solution": {
        "etapes": [
          "Étape 1 de la correction",
          "Étape 2",
          "Conclusion"
        ],
        "tableau": null
      }
    }
  ],
  "fiche_revision": {
    "titre": "Fiche de révision — Titre",
    "sections": [
      {
        "titre": "À retenir",
        "items": [
          "Point clé 1",
          "Point clé 2"
        ]
      },
      {
        "titre": "Les étapes",
        "items": [
          "Étape 1 : ...",
          "Étape 2 : ..."
        ]
      }
    ]
  }
};

function renderTemplate() {
  const el = document.getElementById('templateBlock');
  if (el) el.textContent = JSON.stringify(TEMPLATE, null, 2);
}

function downloadTemplate() {
  const blob = new Blob([JSON.stringify(TEMPLATE, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'template_cours.json';
  a.click();
  URL.revokeObjectURL(url);
}

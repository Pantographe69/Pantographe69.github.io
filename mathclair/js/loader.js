// Loader — gère la liste des cours
// Les cours sont stockés dans localStorage après import par l'admin.
// Les cours "bundlés" (dans /data/) sont listés ici et toujours disponibles.

const BUNDLED_COURSES = [
  'cours_seconde_fonctions_signes.json'
];

const STORAGE_KEY = 'mathclair-courses';

/**
 * Retourne la liste de tous les cours (bundlés + importés)
 * Chaque élément est l'objet JSON complet du cours.
 */
async function getCoursList() {
  const courses = [];

  // 1. Cours bundlés
  for (const file of BUNDLED_COURSES) {
    try {
      const res = await fetch(`data/${file}`);
      if (res.ok) {
        const data = await res.json();
        courses.push(data);
      }
    } catch (e) {
      console.warn('Impossible de charger', file, e);
    }
  }

  // 2. Cours importés via admin (stockés en localStorage)
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const imported = JSON.parse(stored);
      for (const cours of imported) {
        // Ne pas dupliquer avec les bundlés
        if (!courses.find(c => c.id === cours.id)) {
          courses.push(cours);
        } else {
          // L'importé écrase le bundlé si même id
          const idx = courses.findIndex(c => c.id === cours.id);
          courses[idx] = cours;
        }
      }
    }
  } catch (e) {
    console.warn('Erreur lecture localStorage', e);
  }

  return courses;
}

/**
 * Retourne un cours par son id
 */
async function getCoursById(id) {
  const list = await getCoursList();
  return list.find(c => c.id === id) || null;
}

/**
 * Sauvegarde un cours importé dans localStorage
 */
function saveCours(cours) {
  let stored = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch (e) {}

  const idx = stored.findIndex(c => c.id === cours.id);
  if (idx >= 0) stored[idx] = cours;
  else stored.push(cours);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

/**
 * Supprime un cours importé (les bundlés ne peuvent pas être supprimés)
 */
function deleteCours(id) {
  let stored = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch (e) {}
  stored = stored.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

/**
 * Vérifie si un cours est bundlé (non supprimable)
 */
function isBundled(id) {
  // On ne peut pas savoir sans fetcher, on fait une approximation
  return BUNDLED_COURSES.some(f => f.includes(id.replace(/-/g, '_')));
}

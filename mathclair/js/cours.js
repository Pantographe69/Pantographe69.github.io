// cours.js — rendu dynamique d'un cours depuis son JSON

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    renderError('Aucun cours spécifié.');
    return;
  }

  const cours = await getCoursById(id);
  if (!cours) {
    renderError('Cours introuvable.');
    return;
  }

  document.title = `${cours.titre} — MathClair`;
  renderCours(cours);
});

function renderCours(cours) {
  const app = document.getElementById('courseApp');

  app.innerHTML = `
    <button class="sidebar-toggle" onclick="toggleSidebar()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      Plan du cours
    </button>
    <div class="course-layout">
      <aside class="course-sidebar" id="courseSidebar">
        <div class="sidebar-header">
          <span class="niveau-tag">${cours.niveau} — ${cours.chapitre}</span>
          <h2>${cours.titre}</h2>
        </div>
        <nav class="sidebar-nav" id="sidebarNav">
          ${buildSidebarNav(cours)}
        </nav>
      </aside>
      <div class="course-content" id="courseContent">
        ${buildCourseContent(cours)}
      </div>
    </div>
  `;

  // Activate first tab by default
  showTab('lecons');
  activateSidebarLink('lecon-' + (cours.lecons?.[0]?.id || ''));
}

function buildSidebarNav(cours) {
  let html = '';

  if (cours.lecons?.length) {
    html += `<div class="sidebar-section-label">Leçons</div>`;
    cours.lecons.forEach((l, i) => {
      html += `<div class="sidebar-link" id="nav-lecon-${l.id}" onclick="scrollToLecon('${l.id}')">
        <span class="dot"></span>${i + 1}. ${l.titre}
      </div>`;
    });
  }

  if (cours.exercices?.length) {
    html += `<div class="sidebar-section-label">Exercices</div>`;
    cours.exercices.forEach(ex => {
      const stars = '★'.repeat(ex.difficulte || 1) + '☆'.repeat(3 - (ex.difficulte || 1));
      html += `<div class="sidebar-link" onclick="showTab('exercices'); scrollToExo('${ex.id}')">
        <span class="dot"></span>${ex.titre}
        <span class="diff" title="Difficulté">${stars}</span>
      </div>`;
    });
  }

  if (cours.fiche_revision) {
    html += `<div class="sidebar-section-label">Révision</div>`;
    html += `<div class="sidebar-link" onclick="showTab('fiche')">
      <span class="dot"></span>Fiche de révision
    </div>`;
  }

  return html;
}

function buildCourseContent(cours) {
  return `
    <nav class="breadcrumb">
      <a href="index.html">Accueil</a>
      <span>›</span>
      <a href="index.html">${cours.niveau}</a>
      <span>›</span>
      <span>${cours.titre}</span>
    </nav>

    <h1 class="page-title">${cours.titre}</h1>
    <p class="page-subtitle">${cours.niveau} — ${cours.chapitre} · ${cours.description}</p>

    <div class="tabs">
      <button class="tab-btn active" id="tab-lecons" onclick="showTab('lecons')">Leçons</button>
      <button class="tab-btn" id="tab-exercices" onclick="showTab('exercices')">Exercices (${cours.exercices?.length || 0})</button>
      <button class="tab-btn" id="tab-fiche" onclick="showTab('fiche')">Fiche de révision</button>
    </div>

    <div class="tab-panel active" id="panel-lecons">
      ${buildLecons(cours.lecons || [])}
    </div>

    <div class="tab-panel" id="panel-exercices">
      ${buildExercices(cours.exercices || [])}
    </div>

    <div class="tab-panel" id="panel-fiche">
      ${buildFiche(cours.fiche_revision)}
    </div>
  `;
}

// ---- LECONS ----
function buildLecons(lecons) {
  if (!lecons.length) return '<p class="empty-state">Aucune leçon disponible.</p>';
  return lecons.map((l, i) => `
    <div id="lecon-${l.id}" class="lecon-block">
      <h2 style="font-size:1.4rem;margin-bottom:20px;letter-spacing:-0.02em">
        <span style="color:var(--text-3);font-family:var(--font-body);font-size:0.75rem;font-weight:500;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.06em">Leçon ${i + 1}</span>
        ${l.titre}
      </h2>
      ${l.contenu.map(renderBlock).join('')}
      <div style="height:40px;border-bottom:1px solid var(--border);margin-bottom:40px"></div>
    </div>
  `).join('');
}

function renderBlock(block) {
  switch (block.type) {
    case 'intro':
      return `<div class="content-block"><div class="block-intro">${block.texte}</div></div>`;

    case 'regle':
      return `<div class="content-block">
        <div class="block-regle">
          <h4>${block.titre}</h4>
          <p>${block.texte}</p>
          <ul>${(block.items || []).map(i => `<li>${i}</li>`).join('')}</ul>
        </div>
      </div>`;

    case 'exemple':
      return `<div class="content-block">
        <div class="block-exemple">
          <div class="exemple-header">Exemple — ${block.titre}</div>
          <div class="exemple-body">
            ${(block.etapes || []).map(renderEtape).join('')}
          </div>
        </div>
      </div>`;

    default:
      return '';
  }
}

function renderEtape(etape) {
  let html = `<div class="exemple-step">`;
  if (etape.texte) html += `<p>${etape.texte.replace(/\n/g, '<br>')}</p>`;
  if (etape.calcul) html += `<pre>${etape.calcul}</pre>`;
  if (etape.tableau) html += renderTableau(etape.tableau);
  html += `</div>`;
  return html;
}

function renderTableau(tableau) {
  if (!tableau) return '';
  const headers = tableau.headers || [];
  const lignes = tableau.lignes || [];

  // Build a map of "value columns" — the indices between the header values
  // headers = ["x", "−∞", "", "−1", "", "2", "", "+∞"]
  // We need to distribute sign cells accordingly.

  let html = `<div class="tableau-signes"><table>`;

  // Header row
  html += `<thead><tr>`;
  headers.forEach(h => {
    html += `<th>${h}</th>`;
  });
  html += `</tr></thead>`;

  // Body rows
  html += `<tbody>`;
  lignes.forEach(ligne => {
    const cls = ligne.gras ? 'row-bold' : '';
    html += `<tr class="${cls}"><td>${ligne.label}</td>`;

    // Distribute values across the gap cells of the header
    // gaps = number of "" entries in headers
    const gaps = headers.filter((h, i) => i > 0 && i < headers.length - 1).length;
    // We need to spread the values across: between each "real" header value there are cells
    // The simplest approach: just output a cell per value, skip separators
    const vals = ligne.valeurs || [];
    let vIdx = 0;
    for (let i = 1; i < headers.length; i++) {
      if (headers[i] === '') {
        // gap cell: show sign value
        const v = vals[vIdx] ?? '';
        vIdx++;
        html += `<td>${formatSign(v)}</td>`;
      } else {
        // boundary: zero or forbidden
        const v = vals[vIdx] ?? '';
        vIdx++;
        html += `<td>${formatSign(v)}</td>`;
      }
    }

    html += `</tr>`;
  });
  html += `</tbody></table></div>`;

  return html;
}

function formatSign(v) {
  if (v === '+') return `<span class="sign-plus">+</span>`;
  if (v === '−' || v === '-') return `<span class="sign-minus">−</span>`;
  if (v === '0') return `<span class="sign-zero">0</span>`;
  if (v === '||') return `<span class="sign-forbidden">||</span>`;
  return v;
}

// ---- EXERCICES ----
function buildExercices(exercices) {
  if (!exercices.length) return '<p class="empty-state">Aucun exercice disponible.</p>';
  return exercices.map(ex => `
    <div class="exercise-card" id="exo-${ex.id}">
      <div class="exercise-header">
        <div class="exercise-num">${exercices.indexOf(ex) + 1}</div>
        <div class="exercise-title-wrap">
          <h3>${ex.titre}</h3>
          <div class="diff-stars" title="Difficulté ${ex.difficulte}/3">
            ${Array.from({length: 3}, (_, i) => `<span class="diff-star" style="opacity:${i < (ex.difficulte||1) ? 1 : 0.25}">★</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="exercise-body">
        <p class="enonce">${ex.enonce}</p>
        <div class="exercise-actions">
          ${ex.indices?.length ? `<button class="btn-hint" onclick="toggleHint('hint-${ex.id}')">💡 Indice</button>` : ''}
          <button class="btn-solution" onclick="toggleHint('sol-${ex.id}')">✓ Solution</button>
        </div>
        ${ex.indices?.length ? `
          <div class="hint-block" id="hint-${ex.id}" style="display:none">
            ${ex.indices.map((idx, i) => `<p style="margin-bottom:${i < ex.indices.length - 1 ? '8px' : '0'}">💡 ${idx}</p>`).join('')}
          </div>` : ''}
        <div class="solution-block" id="sol-${ex.id}" style="display:none">
          <strong>✓ CORRECTION</strong>
          <ul class="solution-steps">
            ${(ex.solution?.etapes || []).map(e => `<li>${e}</li>`).join('')}
          </ul>
          ${ex.solution?.tableau ? `<div style="margin-top:16px">${renderTableau(ex.solution.tableau)}</div>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// ---- FICHE ----
function buildFiche(fiche) {
  if (!fiche) return '<p class="empty-state">Aucune fiche de révision disponible.</p>';
  const icons = ['📌', '📋', '⚠️', '📐', '💡', '✏️'];
  return `
    <h2 style="font-size:1.4rem;margin-bottom:20px;letter-spacing:-0.02em">${fiche.titre}</h2>
    ${(fiche.sections || []).map((s, i) => `
      <div class="fiche-section">
        <div class="fiche-section-header">
          ${icons[i % icons.length]} ${s.titre}
        </div>
        <div class="fiche-section-body">
          ${(s.items || []).map(item => `<div class="fiche-item">${item}</div>`).join('')}
        </div>
      </div>
    `).join('')}
  `;
}

// ---- UTILS ----
function showTab(name) {
  ['lecons', 'exercices', 'fiche'].forEach(t => {
    document.getElementById(`panel-${t}`)?.classList.toggle('active', t === name);
    document.getElementById(`tab-${t}`)?.classList.toggle('active', t === name);
  });
}

function toggleHint(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function scrollToLecon(id) {
  showTab('lecons');
  setTimeout(() => {
    document.getElementById(`lecon-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}

function scrollToExo(id) {
  setTimeout(() => {
    document.getElementById(`exo-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}

function activateSidebarLink(id) {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.getElementById(`nav-${id}`)?.classList.add('active');
}

function toggleSidebar() {
  document.getElementById('courseSidebar')?.classList.toggle('open');
}

function renderError(msg) {
  document.getElementById('courseApp').innerHTML = `
    <div style="padding:60px 24px;text-align:center;color:var(--text-2)">
      <div style="font-size:3rem;margin-bottom:16px">🤔</div>
      <p>${msg}</p>
      <a href="index.html" class="btn-ghost btn-sm" style="margin-top:20px;display:inline-flex">← Retour</a>
    </div>
  `;
}

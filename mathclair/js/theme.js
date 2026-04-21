// Theme management
(function() {
  const saved = localStorage.getItem('mathclair-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);

  function updateIcon(theme) {
    const sun = document.getElementById('iconSun');
    const moon = document.getElementById('iconMoon');
    if (!sun || !moon) return;
    sun.style.display = theme === 'dark' ? 'none' : 'block';
    moon.style.display = theme === 'dark' ? 'block' : 'none';
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateIcon(saved);
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('mathclair-theme', next);
        updateIcon(next);
      });
    }
  });
})();

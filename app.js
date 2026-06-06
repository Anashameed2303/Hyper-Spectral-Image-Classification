/* =============================================
   HyperSpec Classifier — Main Application Logic
   js/app.js

   Handles:
   - Model tab switching
   - Metrics card updates
   - Per-class accuracy bar chart
   - Class legend rendering
   - Page initialisation
   ============================================= */

/* ---------- State ---------- */
let currentModel = 'svm';

/* ---------- selectModel ----------
   Called when the user clicks a model tab.
   Updates the map image, metrics cards,
   bar chart, and active tab highlight.
   ---------------------------------- */
function selectModel(model) {
  currentModel = model;

  // Update tab active state
  document.querySelectorAll('.model-tab').forEach(tab => {
    tab.classList.remove('active');
    tab.setAttribute('aria-selected', 'false');
  });
  const activeTab = document.getElementById('tab-' + model);
  activeTab.classList.add('active');
  activeTab.setAttribute('aria-selected', 'true');

  // Swap the predicted map image
  document.getElementById('img-pred').src = MAPS[model];
  document.getElementById('active-tag').textContent = METRICS[model].name;

  // Reset zoom on the predicted panel when switching models
  resetZoom('pred');

  // Update metrics cards
  const m = METRICS[model];
  document.getElementById('m-acc').textContent   = m.accuracy   + '%';
  document.getElementById('m-prec').textContent  = m.precision  + '%';
  document.getElementById('m-rec').textContent   = m.recall     + '%';
  document.getElementById('m-f1').textContent    = m.f1         + '%';
  document.getElementById('m-kappa').textContent = m.kappa;

  // Retrigger the top-border animation on all metric cards
  document.querySelectorAll('.mcard').forEach(card => {
    card.classList.remove('lit');
    void card.offsetWidth;           // force reflow to restart animation
    card.classList.add('lit');
  });

  // Update per-class chart label and bars
  document.getElementById('perclass-name').textContent = METRICS[model].name;
  renderBarChart(model);
}

/* ---------- renderBarChart ----------
   Builds the per-class accuracy bar rows
   for the given model key ('svm'|'rf'|'cnn').
   Bars animate in from 0% to their value.
   ---------------------------------- */
function renderBarChart(model) {
  const container = document.getElementById('bar-chart');
  const data      = PER_CLASS[model];
  container.innerHTML = '';

  CLASS_NAMES.forEach((name, index) => {
    const pct   = data[name] || 0;
    const color = COLORS[index];

    // Build row
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <div class="bar-name" title="${name}">${name}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:0%; background: linear-gradient(90deg, ${color}99, ${color});"></div>
      </div>
      <div class="bar-pct">${pct}%</div>
    `;
    container.appendChild(row);

    // Animate bar width after DOM insertion (double rAF ensures paint)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        row.querySelector('.bar-fill').style.width = pct + '%';
      });
    });
  });
}

/* ---------- renderLegend ----------
   Populates the legend grid with a coloured
   dot and name for each land cover class.
   ---------------------------------- */
function renderLegend() {
  const grid = document.getElementById('legend-grid');

  CLASS_NAMES.forEach((name, index) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <div class="legend-dot" style="background: ${COLORS[index]};"></div>
      <span>${name}</span>
    `;
    grid.appendChild(item);
  });
}

/* ---------- initMaps ----------
   Sets the src of both map images once the
   MAPS constant (from data.js) is available.
   ---------------------------------- */
function initMaps() {
  document.getElementById('img-gt').src   = MAPS.gt;
  document.getElementById('img-pred').src = MAPS.svm;
  document.getElementById('hero-gt-img').src = MAPS.gt;
}

/* ---------- Page Initialisation ----------
   Runs after all three scripts have loaded.
   ---------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initMaps();
  renderBarChart('svm');
  renderLegend();
});

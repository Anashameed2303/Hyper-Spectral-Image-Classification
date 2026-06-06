/* =============================================
   HyperSpec Classifier — Zoom & Pan Engine
   js/zoom.js

   Handles mouse/touch zoom and panning for
   the two classification map viewers.
   ============================================= */

/* ---------- State ----------
   Each map panel ('gt' and 'pred') has its own
   independent zoom/pan state object.
   ---------------------------------- */
const zoomState = {
  gt: {
    scale:    1,
    ox:       0,      // x offset in pixels
    oy:       0,      // y offset in pixels
    dragging: false,
    lastX:    0,
    lastY:    0
  },
  pred: {
    scale:    1,
    ox:       0,
    oy:       0,
    dragging: false,
    lastX:    0,
    lastY:    0
  }
};

/* ---------- Apply Transform ----------
   Writes the current scale + offset into the
   CSS transform of the image element, and
   updates the zoom-level label.
   ---------------------------------- */
function applyTransform(id) {
  const s   = zoomState[id];
  const img = document.getElementById('img-' + id);
  img.style.transform = `translate(${s.ox}px, ${s.oy}px) scale(${s.scale})`;
  document.getElementById('zoom-level-' + id).textContent = s.scale.toFixed(1) + '×';
}

/* ---------- Clamp Offset ----------
   Prevents the user from panning outside the
   image bounds when zoomed in.
   ---------------------------------- */
function clampOffset(id) {
  const s         = zoomState[id];
  const container = document.getElementById('zoom-' + id);
  const w         = container.offsetWidth;
  const h         = container.offsetHeight;

  if (s.scale <= 1) {
    s.ox = 0;
    s.oy = 0;
    return;
  }

  const minOx = w - w * s.scale;
  const minOy = h - h * s.scale;

  s.ox = Math.min(0, Math.max(minOx, s.ox));
  s.oy = Math.min(0, Math.max(minOy, s.oy));
}

/* ---------- Mouse Wheel Zoom ----------
   Zooms toward the cursor position so the
   point under the cursor stays fixed.
   ---------------------------------- */
function handleZoom(e, id) {
  e.preventDefault();

  const s         = zoomState[id];
  const container = document.getElementById('zoom-' + id);
  const rect      = container.getBoundingClientRect();

  // Mouse position relative to container
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const delta    = e.deltaY > 0 ? 0.85 : 1.18;
  const newScale = Math.max(1, Math.min(12, s.scale * delta));
  const ratio    = newScale / s.scale;

  // Adjust offset so the point under cursor stays fixed
  s.ox = mx - ratio * (mx - s.ox);
  s.oy = my - ratio * (my - s.oy);
  s.scale = newScale;

  clampOffset(id);
  applyTransform(id);
}

/* ---------- Button Zoom ---------- */
function zoomIn(id) {
  const s   = zoomState[id];
  s.scale   = Math.min(12, s.scale * 1.4);
  clampOffset(id);
  applyTransform(id);
}

function zoomOut(id) {
  const s   = zoomState[id];
  s.scale   = Math.max(1, s.scale / 1.4);
  clampOffset(id);
  applyTransform(id);
}

function resetZoom(id) {
  const s = zoomState[id];
  s.scale = 1;
  s.ox    = 0;
  s.oy    = 0;
  applyTransform(id);
}

/* ---------- Sync Zoom ----------
   Copies gt zoom/pan state to pred so both
   maps are viewing the same region.
   ---------------------------------- */
function syncZoom() {
  const gt = zoomState.gt;
  const pr = zoomState.pred;
  pr.scale = gt.scale;
  pr.ox    = gt.ox;
  pr.oy    = gt.oy;
  applyTransform('pred');
}

/* ---------- Mouse Drag (Pan) ---------- */
function startDrag(e, id) {
  const s   = zoomState[id];
  s.dragging = true;
  s.lastX    = e.clientX;
  s.lastY    = e.clientY;
  document.getElementById('zoom-' + id).style.cursor = 'grabbing';
}

function doDrag(e, id) {
  const s = zoomState[id];
  if (!s.dragging) return;

  s.ox   += e.clientX - s.lastX;
  s.oy   += e.clientY - s.lastY;
  s.lastX = e.clientX;
  s.lastY = e.clientY;

  clampOffset(id);
  applyTransform(id);
}

function stopDrag(id) {
  zoomState[id].dragging = false;
  document.getElementById('zoom-' + id).style.cursor = 'crosshair';
}

/* ---------- Touch Drag (Mobile Pan) ---------- */
function startTouchDrag(e, id) {
  if (e.touches.length === 1) {
    const s   = zoomState[id];
    s.dragging = true;
    s.lastX    = e.touches[0].clientX;
    s.lastY    = e.touches[0].clientY;
  }
}

function doTouchDrag(e, id) {
  e.preventDefault();
  if (e.touches.length === 1) {
    doDrag({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }, id);
  }
}

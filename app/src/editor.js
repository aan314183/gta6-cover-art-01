// Vice Cover editor: owns the cover state, wires every control, and lets the
// user drag a panel on the preview to pan its photo. Photos are read with
// FileReader on this machine and never uploaded anywhere.

import { SIZES, PANEL_NAMES, panelLayout, panelAt } from './panels.js';
import { GRADES, GRADE_KEYS } from './grade.js';
import { renderCover, exportCoverPNG } from './export.js';

export function freshState() {
  return {
    photos: [], // loaded Image objects, in the order they were added
    photoNames: [],
    panels: PANEL_NAMES.map(() => ({ photoIndex: 0, zoom: 1, dx: 0, dy: 0, rotate: 0 })),
    selected: 0,
    caption: 'Sunset Heist',
    subcaption: 'Vice City · Est. Tonight',
    grade: 'sunset',
    sizeKey: 'wide',
    exportSize: SIZES.wide,
    hideSelection: false,
  };
}

export function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function loadImageUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export function initEditor() {
  const state = freshState();
  const canvas = document.getElementById('cover');
  const status = document.getElementById('status');
  const $ = (id) => document.getElementById(id);

  function redraw() {
    const size = SIZES[state.sizeKey];
    canvas.width = size.width;
    canvas.height = size.height;
    renderCover(canvas, state);
  }

  function refreshPanelControls() {
    const panel = state.panels[state.selected];
    $('zoom').value = panel.zoom;
    $('rotate').value = panel.rotate;
    $('rotateVal').textContent = `${panel.rotate}°`;
    const select = $('panelPhoto');
    select.innerHTML = '';
    state.photos.forEach((_, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `Photo ${i + 1} — ${state.photoNames[i] || 'photo'}`;
      select.appendChild(opt);
    });
    if (state.photos.length === 0) {
      const opt = document.createElement('option');
      opt.value = 0;
      opt.textContent = 'No photo yet — add one above';
      select.appendChild(opt);
    }
    select.value = String(panel.photoIndex);
    document.querySelectorAll('#panelTabs button').forEach((b, i) => {
      b.classList.toggle('active', i === state.selected);
    });
    document.querySelectorAll('#photoChips .chip').forEach((c, i) => {
      c.classList.toggle('active', i === panel.photoIndex);
    });
  }

  function refreshChips() {
    const box = $('photoChips');
    box.innerHTML = '';
    state.photoNames.forEach((name, i) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = `Photo ${i + 1}: ${name}`;
      chip.addEventListener('click', () => {
        state.panels[state.selected].photoIndex = i;
        refreshPanelControls();
        redraw();
      });
      box.appendChild(chip);
    });
  }

  async function addPhotos(files) {
    for (const file of files) {
      if (state.photos.length >= 3) { status.textContent = 'Three photos at most — that fills every panel.'; break; }
      try {
        const img = await loadImageFile(file);
        state.photos.push(img);
        state.photoNames.push(file.name.length > 22 ? file.name.slice(0, 22) + '…' : file.name);
      } catch {
        status.textContent = `Could not read ${file.name}.`;
      }
    }
    // First photo fills every panel by default.
    if (state.photos.length === 1) state.panels.forEach((p) => { p.photoIndex = 0; });
    refreshChips();
    refreshPanelControls();
    redraw();
    status.textContent = `${state.photos.length} photo${state.photos.length === 1 ? '' : 's'} loaded. Pick a panel and drag it to frame the shot.`;
  }

  async function loadSamples() {
    try {
      const names = ['boulevard', 'pier'];
      for (const name of names) {
        if (state.photos.length >= 3) break;
        const img = await loadImageUrl(`samples/${name}.jpg`);
        state.photos.push(img);
        state.photoNames.push(`${name}.jpg`);
      }
      state.panels[0].photoIndex = 0;
      state.panels[1].photoIndex = 1;
      state.panels[2].photoIndex = 1;
      state.panels[3].photoIndex = 0;
      refreshChips();
      refreshPanelControls();
      redraw();
      status.textContent = 'Sample photos loaded — hero and bottom right use the boulevard, the others the pier.';
    } catch {
      status.textContent = 'Sample photos could not be loaded.';
    }
  }

  // Panel tabs.
  const tabs = $('panelTabs');
  PANEL_NAMES.forEach((name, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = name;
    b.addEventListener('click', () => { state.selected = i; refreshPanelControls(); redraw(); });
    tabs.appendChild(b);
  });

  // Style tabs.
  const styles = $('styleTabs');
  GRADE_KEYS.forEach((key) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = GRADES[key].label;
    b.addEventListener('click', () => {
      state.grade = key;
      document.querySelectorAll('#styleTabs button').forEach((x) => x.classList.toggle('active', x === b));
      redraw();
    });
    styles.appendChild(b);
  });
  styles.querySelector('button').classList.add('active');

  $('photos').addEventListener('change', (e) => addPhotos([...e.target.files]));
  $('useSamples').addEventListener('click', loadSamples);
  $('fillAll').addEventListener('click', () => {
    if (!state.photos.length) { status.textContent = 'Add a photo first.'; return; }
    state.panels.forEach((p) => { p.photoIndex = 0; });
    refreshPanelControls();
    redraw();
    status.textContent = 'Every panel now shows photo 1.';
  });
  $('zoom').addEventListener('input', (e) => { state.panels[state.selected].zoom = Number(e.target.value); redraw(); });
  $('rotate').addEventListener('input', (e) => {
    state.panels[state.selected].rotate = Number(e.target.value);
    $('rotateVal').textContent = `${e.target.value}°`;
    redraw();
  });
  $('panelPhoto').addEventListener('change', (e) => {
    state.panels[state.selected].photoIndex = Number(e.target.value);
    refreshPanelControls();
    redraw();
  });
  $('caption').addEventListener('input', (e) => { state.caption = e.target.value; redraw(); });
  $('subcaption').addEventListener('input', (e) => { state.subcaption = e.target.value; redraw(); });
  $('size').addEventListener('change', (e) => {
    state.sizeKey = e.target.value;
    state.exportSize = SIZES[state.sizeKey];
    redraw();
  });
  $('export').addEventListener('click', () => {
    exportCoverPNG(state, (name) => { status.textContent = `Saved ${name} — share it anywhere.`; });
  });

  // Drag to pan the photo inside the panel under the pointer.
  let drag = null;
  function canvasPoint(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }
  canvas.addEventListener('pointerdown', (e) => {
    const p = canvasPoint(e);
    const hit = panelAt(panelLayout(state.sizeKey), p.x, p.y, canvas.width, canvas.height);
    if (hit === -1) return;
    state.selected = hit;
    refreshPanelControls();
    const panel = state.panels[hit];
    drag = { panel, startX: p.x, startY: p.y, dx: panel.dx, dy: panel.dy, layout: panelLayout(state.sizeKey)[hit] };
    canvas.setPointerCapture(e.pointerId);
    redraw();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = canvasPoint(e);
    const [, , fw, fh] = drag.layout;
    drag.panel.dx = drag.dx + (p.x - drag.startX) / (fw * canvas.width);
    drag.panel.dy = drag.dy + (p.y - drag.startY) / (fh * canvas.height);
    redraw();
  });
  canvas.addEventListener('pointerup', () => { drag = null; });

  refreshChips();
  refreshPanelControls();
  redraw();
  return { state, redraw, loadSamples, addPhotos };
}

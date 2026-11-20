// Vice Cover v3 editor.
//
// This module owns the whole cover state and every sidebar control, and
// it lets the user drag a panel on the preview to pan the photo inside
// it. Photos are read with FileReader on this machine and never uploaded
// anywhere; the two bundled samples are local files under samples/.
//
// State shape:
//   photos / photoNames — loaded Image objects and their display names
//   panels — one slot per panel: { photoIndex, zoom, dx, dy, rotate }
//   active — which panel is being edited
//   panelCount — 3 or 4 panels on the cover (new in v3)
//   headline, tagline — the two lines of poster lettering
//   align — headline/tagline alignment: left, center or right (new in v3)
//   spacing — extra letter-spacing on the headline, in px (new in v3)
//   badge — whether the EST. 2026 star shows (new in v3)
//   format — export file type: png or jpeg (new in v3)
//   grade — key into GRADES; sizeKey — key into EXPORT_SIZES
//   outline — headline outline thickness (0 = none)
//   shadow, shadowAmount — headline drop shadow switch and strength
//   divider — frame style around every panel
//   clean — true only for an export render (no editor frame)

import { EXPORT_SIZES, PANEL_LABELS, DIVIDER_KEYS, layoutFor, panelAtPoint, visiblePanels } from './panels.js';
import { GRADES, GRADE_KEYS } from './grade.js';
import { renderPoster, exportPoster } from './export.js';

const MAX_PHOTOS = 3;

export function createState() {
  return {
    photos: [],
    photoNames: [],
    panels: PANEL_LABELS.map(() => ({ photoIndex: 0, zoom: 1, dx: 0, dy: 0, rotate: 0 })),
    active: 0,
    panelCount: 4,
    headline: 'Vice Nights',
    tagline: 'Vice City · Est. Tonight',
    align: 'left',
    spacing: 0,
    badge: false,
    format: 'png',
    grade: 'dusk',
    sizeKey: 'wide',
    exportSize: EXPORT_SIZES.wide,
    outline: 4,
    shadow: true,
    shadowAmount: 0.6,
    divider: 'hairline',
    clean: false,
  };
}

// Reads a user-picked file into an Image, through a data: URL.
export function readFileAsImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('bad image'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('unreadable file'));
    reader.readAsDataURL(file);
  });
}

// Loads a same-origin image (the bundled samples) into an Image.
export function readUrlAsImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`cannot load ${url}`));
    img.src = url;
  });
}

export function startEditor() {
  const state = createState();
  const canvas = document.getElementById('poster');
  const note = document.getElementById('statusLine');
  const byId = (id) => document.getElementById(id);

  function repaint() {
    const size = EXPORT_SIZES[state.sizeKey];
    canvas.width = size.width;
    canvas.height = size.height;
    renderPoster(canvas, state);
  }

  function say(text) {
    if (note) note.textContent = text;
  }

  // Rebuilds the panel picker so it only lists panels that are visible.
  function rebuildPanelPicker() {
    const box = byId('panelPicker');
    box.innerHTML = '';
    PANEL_LABELS.slice(0, visiblePanels(state)).forEach((label, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.classList.toggle('active', i === state.active);
      button.addEventListener('click', () => {
        state.active = i;
        syncPanelControls();
        repaint();
      });
      box.appendChild(button);
    });
  }

  function syncPanelControls() {
    const panel = state.panels[state.active];
    byId('zoomRange').value = String(panel.zoom);
    byId('rotateRange').value = String(panel.rotate);
    byId('rotateOut').textContent = `${panel.rotate}°`;
    const picker = byId('panelPhotoSelect');
    picker.innerHTML = '';
    state.photos.forEach((_, i) => {
      const option = document.createElement('option');
      option.value = String(i);
      option.textContent = `Photo ${i + 1} — ${state.photoNames[i] || 'photo'}`;
      picker.appendChild(option);
    });
    if (state.photos.length === 0) {
      const option = document.createElement('option');
      option.value = '0';
      option.textContent = 'No photo yet — add one above';
      picker.appendChild(option);
    }
    picker.value = String(panel.photoIndex);
    document.querySelectorAll('#panelPicker button').forEach((button, i) => {
      button.classList.toggle('active', i === state.active);
    });
    document.querySelectorAll('#photoList .chip').forEach((chip, i) => {
      chip.classList.toggle('active', i === panel.photoIndex);
    });
  }

  function syncChips() {
    const box = byId('photoList');
    box.innerHTML = '';
    state.photoNames.forEach((name, i) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = `Photo ${i + 1}: ${name}`;
      chip.addEventListener('click', () => {
        state.panels[state.active].photoIndex = i;
        syncPanelControls();
        repaint();
      });
      box.appendChild(chip);
    });
  }

  // The first photo fills every visible panel until the user picks otherwise.
  function assignFirstPhoto() {
    if (state.photos.length === 1) {
      state.panels.forEach((panel) => { panel.photoIndex = 0; });
    }
  }

  async function addFiles(files) {
    for (const file of files) {
      if (state.photos.length >= MAX_PHOTOS) {
        say('Three photos at most — that fills every panel.');
        break;
      }
      try {
        const img = await readFileAsImage(file);
        state.photos.push(img);
        const short = file.name.length > 22 ? `${file.name.slice(0, 22)}…` : file.name;
        state.photoNames.push(short);
      } catch {
        say(`Could not read ${file.name}.`);
      }
    }
    assignFirstPhoto();
    syncChips();
    syncPanelControls();
    repaint();
    say(`${state.photos.length} photo${state.photos.length === 1 ? '' : 's'} loaded. Pick a panel and drag it to frame the shot.`);
  }

  async function loadSamples() {
    try {
      const names = ['boulevard', 'pier'];
      for (const name of names) {
        if (state.photos.length >= MAX_PHOTOS) break;
        const img = await readUrlAsImage(`samples/${name}.jpg`);
        state.photos.push(img);
        state.photoNames.push(`${name}.jpg`);
      }
      state.panels[0].photoIndex = 0;
      state.panels[1].photoIndex = 1;
      state.panels[2].photoIndex = 1;
      state.panels[3].photoIndex = 0;
      syncChips();
      syncPanelControls();
      repaint();
      say('Sample photos loaded — hero and wide strip use the boulevard, the others the pier.');
    } catch {
      say('Sample photos could not be loaded.');
    }
  }

  // One row of toggle buttons: grade picker, alignment picker, panel count.
  function buildToggleRow(containerId, labels, onPick, initial) {
    const container = byId(containerId);
    labels.forEach((label, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.addEventListener('click', () => {
        onPick(i);
        container.querySelectorAll('button').forEach((b, j) => {
          b.classList.toggle('active', j === i);
        });
      });
      container.appendChild(button);
    });
    if (initial != null) {
      container.querySelectorAll('button')[initial].classList.add('active');
    }
  }

  buildToggleRow('gradePicker', GRADE_KEYS.map((k) => GRADES[k].label), (i) => {
    state.grade = GRADE_KEYS[i];
    repaint();
  }, GRADE_KEYS.indexOf(state.grade));

  buildToggleRow('alignPicker', ['Left', 'Centre', 'Right'], (i) => {
    state.align = ['left', 'center', 'right'][i];
    repaint();
  }, 0);

  buildToggleRow('panelCountPicker', ['3 panels', '4 panels'], (i) => {
    state.panelCount = i === 0 ? 3 : 4;
    if (state.active >= state.panelCount) state.active = 0;
    rebuildPanelPicker();
    syncPanelControls();
    repaint();
  }, 1);

  rebuildPanelPicker();

  byId('photoInput').addEventListener('change', (event) => addFiles([...event.target.files]));
  byId('samplesBtn').addEventListener('click', loadSamples);
  byId('fillAllBtn').addEventListener('click', () => {
    if (!state.photos.length) { say('Add a photo first.'); return; }
    state.panels.forEach((panel) => { panel.photoIndex = 0; });
    syncPanelControls();
    repaint();
    say('Every panel now shows photo 1.');
  });
  byId('zoomRange').addEventListener('input', (event) => {
    state.panels[state.active].zoom = Number(event.target.value);
    repaint();
  });
  byId('rotateRange').addEventListener('input', (event) => {
    state.panels[state.active].rotate = Number(event.target.value);
    byId('rotateOut').textContent = `${event.target.value}°`;
    repaint();
  });
  byId('panelPhotoSelect').addEventListener('change', (event) => {
    state.panels[state.active].photoIndex = Number(event.target.value);
    syncPanelControls();
    repaint();
  });
  byId('headlineInput').addEventListener('input', (event) => {
    state.headline = event.target.value;
    repaint();
  });
  byId('taglineInput').addEventListener('input', (event) => {
    state.tagline = event.target.value;
    repaint();
  });
  byId('spacingRange').addEventListener('input', (event) => {
    state.spacing = Number(event.target.value);
    byId('spacingOut').textContent = `${event.target.value} px`;
    repaint();
  });
  byId('outlineRange').addEventListener('input', (event) => {
    state.outline = Number(event.target.value);
    byId('outlineOut').textContent = `${event.target.value} px`;
    repaint();
  });
  byId('shadowToggle').addEventListener('change', (event) => {
    state.shadow = event.target.checked;
    repaint();
  });
  byId('shadowRange').addEventListener('input', (event) => {
    state.shadowAmount = Number(event.target.value);
    repaint();
  });
  byId('badgeToggle').addEventListener('change', (event) => {
    state.badge = event.target.checked;
    repaint();
  });
  byId('dividerSelect').addEventListener('change', (event) => {
    state.divider = event.target.value;
    repaint();
  });
  byId('sizeSelect').addEventListener('change', (event) => {
    state.sizeKey = event.target.value;
    state.exportSize = EXPORT_SIZES[state.sizeKey];
    repaint();
  });
  byId('formatSelect').addEventListener('change', (event) => {
    state.format = event.target.value;
    byId('exportBtn').textContent = state.format === 'jpeg' ? 'Export JPEG' : 'Export PNG';
  });
  byId('exportBtn').addEventListener('click', () => {
    exportPoster(state, (name) => say(`Saved ${name} — share it anywhere.`));
  });

  // Pointer drag: press a panel to select it, then drag to pan its photo.
  let drag = null;
  function toCanvasPixels(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }
  canvas.addEventListener('pointerdown', (event) => {
    const point = toCanvasPixels(event);
    const layout = layoutFor(state.sizeKey, state.panelCount);
    const hit = panelAtPoint(layout, point.x, point.y, canvas.width, canvas.height);
    if (hit === -1) return;
    state.active = hit;
    syncPanelControls();
    const panel = state.panels[hit];
    drag = {
      panel,
      startX: point.x,
      startY: point.y,
      dx: panel.dx,
      dy: panel.dy,
      rect: layout[hit],
    };
    canvas.setPointerCapture(event.pointerId);
    repaint();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const point = toCanvasPixels(event);
    const rect = drag.rect;
    drag.panel.dx = drag.dx + (point.x - drag.startX) / (rect[2] * canvas.width);
    drag.panel.dy = drag.dy + (point.y - drag.startY) / (rect[3] * canvas.height);
    repaint();
  });
  canvas.addEventListener('pointerup', () => { drag = null; });
  canvas.addEventListener('pointercancel', () => { drag = null; });

  syncChips();
  syncPanelControls();
  repaint();
  return { state, repaint, loadSamples, addFiles };
}

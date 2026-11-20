// Vice Cover v4 editor.
//
// This module owns the whole cover state and every sidebar control, and
// it lets the user drag a panel on the preview to pan the photo inside
// it. Photos are read with FileReader on this machine and never uploaded
// anywhere; the two bundled samples are local files under samples/.
//
// State shape:
//   photos / photoNames — loaded Image objects and their display names
//   panels — five slots: { photoIndex, zoom, dx, dy, rotate,
//     bright, contrast, sat } (per-panel light, new in v4)
//   active — which panel is being edited
//   panelCount — 2, 3, 4 or 5 panels (2 and 5 are new in v4)
//   headline, tagline — the two lines of poster lettering
//   align — headline/tagline alignment: left, center or right
//   spacing — extra letter-spacing on the headline, in px
//   headlineSize — headline size multiplier, 0.6 to 1.4 (new in v4)
//   uppercase — headline forced to capitals (new in v4)
//   badge — whether the EST. 2026 star shows
//   grain — deterministic film grain on the cover (new in v4)
//   format — export file type: png or jpeg
//   grade — key into GRADES (vice and palm are new in v4)
//   sizeKey — key into EXPORT_SIZES (story is new in v4)
//   outline — headline outline thickness (0 = none)
//   shadow, shadowAmount — headline drop shadow switch and strength
//   divider — frame style around every panel
//   clean — true only for an export render (no editor frame)
//
// One-click presets (new in v4) set a whole look at once: Heist, Beach
// and Night Drive each pick panels, grade, size, divider and badge.

import { EXPORT_SIZES, PANEL_LABELS, PANEL_COUNTS, DIVIDER_KEYS, layoutFor, panelAtPoint, visiblePanels } from './panels.js';
import { GRADES, GRADE_KEYS } from './grade.js';
import { renderPoster, exportPoster } from './export.js';

const MAX_PHOTOS = 3;

export const PRESETS = {
  heist: {
    label: 'Heist',
    headline: 'Vice Heist',
    tagline: 'One last score · Vice City',
    grade: 'vice',
    panelCount: 4,
    sizeKey: 'wide',
    divider: 'bold',
    badge: true,
    grain: true,
  },
  beach: {
    label: 'Beach',
    headline: 'Palm Beach',
    tagline: 'Sun, sand and trouble',
    grade: 'palm',
    panelCount: 3,
    sizeKey: 'portrait',
    divider: 'hairline',
    badge: false,
    grain: false,
  },
  nightdrive: {
    label: 'Night Drive',
    headline: 'Night Drive',
    tagline: 'Neon streets · 2 AM',
    grade: 'neon',
    panelCount: 2,
    sizeKey: 'wide',
    divider: 'none',
    badge: true,
    grain: true,
  },
};

export const PRESET_KEYS = Object.keys(PRESETS);

function freshPanel() {
  return { photoIndex: 0, zoom: 1, dx: 0, dy: 0, rotate: 0, bright: 1, contrast: 1, sat: 1 };
}

export function createState() {
  return {
    photos: [],
    photoNames: [],
    panels: PANEL_LABELS.map(() => freshPanel()),
    active: 0,
    panelCount: 5,
    headline: 'Vice Nights',
    tagline: 'Vice City · Est. Tonight',
    align: 'left',
    spacing: 0,
    headlineSize: 1,
    uppercase: true,
    badge: false,
    grain: false,
    format: 'png',
    grade: 'vice',
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
    byId('brightRange').value = String(panel.bright);
    byId('brightOut').textContent = `${Math.round(panel.bright * 100)}%`;
    byId('contrastRange').value = String(panel.contrast);
    byId('contrastOut').textContent = `${Math.round(panel.contrast * 100)}%`;
    byId('satRange').value = String(panel.sat);
    byId('satOut').textContent = `${Math.round(panel.sat * 100)}%`;
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

  // Brings every sidebar control back in step with the state — used
  // after a preset or a staged scene changes several things at once.
  function syncAllControls() {
    byId('headlineInput').value = state.headline;
    byId('taglineInput').value = state.tagline;
    byId('headlineSizeRange').value = String(state.headlineSize);
    byId('headlineSizeOut').textContent = `${Math.round(state.headlineSize * 100)}%`;
    byId('uppercaseToggle').checked = state.uppercase;
    byId('spacingRange').value = String(state.spacing);
    byId('spacingOut').textContent = `${state.spacing} px`;
    byId('outlineRange').value = String(state.outline);
    byId('outlineOut').textContent = `${state.outline} px`;
    byId('shadowToggle').checked = state.shadow;
    byId('shadowRange').value = String(state.shadowAmount);
    byId('badgeToggle').checked = state.badge;
    byId('grainToggle').checked = state.grain;
    byId('dividerSelect').value = state.divider;
    byId('sizeSelect').value = state.sizeKey;
    byId('formatSelect').value = state.format;
    document.querySelectorAll('#gradePicker button').forEach((button, i) => {
      button.classList.toggle('active', GRADE_KEYS[i] === state.grade);
    });
    document.querySelectorAll('#alignPicker button').forEach((button, i) => {
      button.classList.toggle('active', ['left', 'center', 'right'][i] === state.align);
    });
    document.querySelectorAll('#panelCountPicker button').forEach((button, i) => {
      button.classList.toggle('active', PANEL_COUNTS[i] === state.panelCount);
    });
    rebuildPanelPicker();
    syncPanelControls();
  }

  // Applies one preset: panels, grade, size, divider, badge, grain and
  // both lines of lettering, then repaints.
  function applyPreset(key) {
    const preset = PRESETS[key];
    if (!preset) return;
    state.headline = preset.headline;
    state.tagline = preset.tagline;
    state.grade = preset.grade;
    state.panelCount = preset.panelCount;
    state.sizeKey = preset.sizeKey;
    state.exportSize = EXPORT_SIZES[preset.sizeKey];
    state.divider = preset.divider;
    state.badge = preset.badge;
    state.grain = preset.grain;
    if (state.active >= state.panelCount) state.active = 0;
    syncAllControls();
    repaint();
    say(`${preset.label} preset applied — ${state.panelCount} panels, ${preset.grade} grade.`);
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
      state.panels[4].photoIndex = 1;
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

  buildToggleRow('panelCountPicker', PANEL_COUNTS.map((n) => `${n} panels`), (i) => {
    state.panelCount = PANEL_COUNTS[i];
    if (state.active >= state.panelCount) state.active = 0;
    rebuildPanelPicker();
    syncPanelControls();
    repaint();
  }, PANEL_COUNTS.indexOf(state.panelCount));

  buildToggleRow('presetPicker', PRESET_KEYS.map((k) => PRESETS[k].label), (i) => {
    applyPreset(PRESET_KEYS[i]);
  }, null);

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
  byId('brightRange').addEventListener('input', (event) => {
    state.panels[state.active].bright = Number(event.target.value);
    byId('brightOut').textContent = `${Math.round(event.target.value * 100)}%`;
    repaint();
  });
  byId('contrastRange').addEventListener('input', (event) => {
    state.panels[state.active].contrast = Number(event.target.value);
    byId('contrastOut').textContent = `${Math.round(event.target.value * 100)}%`;
    repaint();
  });
  byId('satRange').addEventListener('input', (event) => {
    state.panels[state.active].sat = Number(event.target.value);
    byId('satOut').textContent = `${Math.round(event.target.value * 100)}%`;
    repaint();
  });
  byId('resetPanelBtn').addEventListener('click', () => {
    state.panels[state.active] = { ...freshPanel(), photoIndex: state.panels[state.active].photoIndex };
    syncPanelControls();
    repaint();
    say('This panel is back to its default framing and light.');
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
  byId('headlineSizeRange').addEventListener('input', (event) => {
    state.headlineSize = Number(event.target.value);
    byId('headlineSizeOut').textContent = `${Math.round(event.target.value * 100)}%`;
    repaint();
  });
  byId('uppercaseToggle').addEventListener('change', (event) => {
    state.uppercase = event.target.checked;
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
  byId('grainToggle').addEventListener('change', (event) => {
    state.grain = event.target.checked;
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
  return { state, repaint, loadSamples, addFiles, applyPreset, syncAllControls };
}

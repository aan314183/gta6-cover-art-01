// Vice Cover v3 — fixed scenes for screenshots.
//
// The page reads its query string and stages one scene:
//   ?shot=editor — the editor with the sample photos loaded.
//   ?shot=cover  — the finished cover alone, controls hidden.
//
// The rest of the parameters shape the staged cover: `photo` picks which
// sample leads (pier or boulevard), `caption` and `tagline` set the
// lettering, `grade` picks the colour grade (sunset, neon, mono, dusk,
// candy), `size` picks square, portrait or wide, `outline` sets the
// headline outline in px, `shadow` is 0 or 1, `shadowAmt` sets shadow
// strength, `divider` picks the panel frame style, `panels` picks 3 or 4
// panels, `align` picks left, center or right headline alignment,
// `spacing` sets headline letter-spacing in px, and `badge` is 1 to show
// the EST. 2026 star. window.__shotReady is set once the cover has been
// painted and the font is ready, so a screenshot tool knows when to shoot.

import { readUrlAsImage } from './editor.js';
import { EXPORT_SIZES } from './panels.js';

function setControl(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function setToggle(id, checked) {
  const el = document.getElementById(id);
  if (el) el.checked = checked;
}

export async function stageShot(query, editor) {
  const { state, repaint } = editor;
  const shot = query.get('shot');
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    state.clean = true; // no editor frame on the finished cover
  }

  const caption = query.get('caption');
  if (caption) state.headline = caption;
  const tagline = query.get('tagline');
  if (tagline) state.tagline = tagline;
  const grade = query.get('grade');
  if (grade) state.grade = grade;
  const size = query.get('size');
  if (size && EXPORT_SIZES[size]) {
    state.sizeKey = size;
    state.exportSize = EXPORT_SIZES[size];
    setControl('sizeSelect', size);
  }
  const outline = query.get('outline');
  if (outline != null) {
    state.outline = Number(outline);
    setControl('outlineRange', outline);
  }
  const shadow = query.get('shadow');
  if (shadow != null) {
    state.shadow = shadow !== '0';
    setToggle('shadowToggle', state.shadow);
  }
  const shadowAmt = query.get('shadowAmt');
  if (shadowAmt != null) state.shadowAmount = Number(shadowAmt);
  const divider = query.get('divider');
  if (divider) {
    state.divider = divider;
    setControl('dividerSelect', divider);
  }
  const panels = query.get('panels');
  if (panels === '3' || panels === '4') {
    state.panelCount = Number(panels);
    document.querySelectorAll('#panelCountPicker button').forEach((button, i) => {
      button.classList.toggle('active', (i === 0 && panels === '3') || (i === 1 && panels === '4'));
    });
    document.querySelectorAll('#panelPicker button').forEach((button, i) => {
      button.style.display = i < state.panelCount ? '' : 'none';
    });
  }
  const align = query.get('align');
  if (align === 'left' || align === 'center' || align === 'right') {
    state.align = align;
    const idx = ['left', 'center', 'right'].indexOf(align);
    document.querySelectorAll('#alignPicker button').forEach((button, i) => {
      button.classList.toggle('active', i === idx);
    });
  }
  const spacing = query.get('spacing');
  if (spacing != null) {
    state.spacing = Number(spacing);
    setControl('spacingRange', spacing);
    const out = document.getElementById('spacingOut');
    if (out) out.textContent = `${spacing} px`;
  }
  const badge = query.get('badge');
  if (badge != null) {
    state.badge = badge === '1';
    setToggle('badgeToggle', state.badge);
  }

  // Both samples load, so every panel has a photo to show.
  const lead = query.get('photo') || 'pier';
  const support = lead === 'boulevard' ? 'pier' : 'boulevard';
  const leadImg = await readUrlAsImage(`samples/${lead}.jpg`);
  const supportImg = await readUrlAsImage(`samples/${support}.jpg`);
  state.photos = [leadImg, supportImg];
  state.photoNames = [`${lead}.jpg`, `${support}.jpg`];
  state.panels[0].photoIndex = 0;
  state.panels[1].photoIndex = 1;
  state.panels[2].photoIndex = 1;
  state.panels[3].photoIndex = 0;
  // Frame each supporting panel on a different part of its photo, so the
  // panels do not all show the same crop.
  state.panels[1].zoom = 1.08;
  state.panels[1].dy = -0.12;
  state.panels[2].zoom = 1.08;
  state.panels[2].dy = 0.1;
  state.panels[3].zoom = 1.02;
  // The strip panel is tall in the wide layout and a flat band in the
  // others, so the nudge that frames it well differs between them.
  state.panels[3].dy = state.sizeKey === 'wide' ? 0.08 : 0.26;

  // Bring the sidebar in step with the staged state.
  setControl('headlineInput', state.headline);
  setControl('taglineInput', state.tagline);
  document.querySelectorAll('#gradePicker button').forEach((button) => {
    button.classList.toggle('active', button.textContent.toLowerCase() === state.grade);
  });
  const chipBox = document.getElementById('photoList');
  chipBox.innerHTML = '';
  state.photoNames.forEach((name, i) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = `Photo ${i + 1}: ${name}`;
    chipBox.appendChild(chip);
  });
  const photoSelect = document.getElementById('panelPhotoSelect');
  photoSelect.innerHTML = '';
  state.photos.forEach((_, i) => {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = `Photo ${i + 1} — ${state.photoNames[i]}`;
    photoSelect.appendChild(option);
  });

  repaint();
  await document.fonts.ready;
  repaint();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}

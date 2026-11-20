// Vice Cover v4 — fixed scenes for screenshots.
//
// The page reads its query string and stages one scene:
//   ?shot=editor — the editor with the sample photos loaded.
//   ?shot=cover  — the finished cover alone, controls hidden.
//
// The rest of the parameters shape the staged cover: `photo` picks which
// sample leads (pier or boulevard), `caption` and `tagline` set the
// lettering, `grade` picks the colour grade (sunset, neon, mono, dusk,
// candy, vice, palm), `size` picks square, portrait, wide or story,
// `outline` sets the headline outline in px, `shadow` is 0 or 1,
// `shadowAmt` sets shadow strength, `divider` picks the panel frame
// style, `panels` picks 2, 3, 4 or 5 panels, `align` picks left, center
// or right headline alignment, `spacing` sets headline letter-spacing
// in px, `headlineSize` scales the headline (0.6–1.4), `uppercase` is
// 0 or 1, `badge` is 1 to show the EST. 2026 star, `grain` is 1 for film
// grain, and `preset` applies a one-click preset first (heist, beach,
// nightdrive). window.__shotReady is set once the cover has been
// painted and the font is ready, so a screenshot tool knows when to shoot.

import { readUrlAsImage } from './editor.js';
import { EXPORT_SIZES, PANEL_COUNTS } from './panels.js';
import { GRADE_KEYS } from './grade.js';

function setControl(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function setToggle(id, checked) {
  const el = document.getElementById(id);
  if (el) el.checked = checked;
}

function markActive(containerId, test) {
  document.querySelectorAll(`#${containerId} button`).forEach((button, i) => {
    button.classList.toggle('active', test(button, i));
  });
}

export async function stageShot(query, editor) {
  const { state, repaint, applyPreset, syncAllControls } = editor;
  const shot = query.get('shot');
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    state.clean = true; // no editor frame on the finished cover
  }

  // A preset goes on first; the parameters below override it.
  const preset = query.get('preset');
  if (preset) applyPreset(preset);

  const caption = query.get('caption');
  if (caption) state.headline = caption;
  const tagline = query.get('tagline');
  if (tagline) state.tagline = tagline;
  const grade = query.get('grade');
  if (grade && GRADE_KEYS.includes(grade)) state.grade = grade;
  const size = query.get('size');
  if (size && EXPORT_SIZES[size]) {
    state.sizeKey = size;
    state.exportSize = EXPORT_SIZES[size];
  }
  const outline = query.get('outline');
  if (outline != null) state.outline = Number(outline);
  const shadow = query.get('shadow');
  if (shadow != null) state.shadow = shadow !== '0';
  const shadowAmt = query.get('shadowAmt');
  if (shadowAmt != null) state.shadowAmount = Number(shadowAmt);
  const divider = query.get('divider');
  if (divider) state.divider = divider;
  const panels = query.get('panels');
  if (panels != null && PANEL_COUNTS.includes(Number(panels))) {
    state.panelCount = Number(panels);
    if (state.active >= state.panelCount) state.active = 0;
  }
  const align = query.get('align');
  if (align === 'left' || align === 'center' || align === 'right') state.align = align;
  const spacing = query.get('spacing');
  if (spacing != null) state.spacing = Number(spacing);
  const headlineSize = query.get('headlineSize');
  if (headlineSize != null) state.headlineSize = Number(headlineSize);
  const uppercase = query.get('uppercase');
  if (uppercase != null) state.uppercase = uppercase !== '0';
  const badge = query.get('badge');
  if (badge != null) state.badge = badge === '1';
  const grain = query.get('grain');
  if (grain != null) state.grain = grain === '1';
  const format = query.get('format');
  if (format === 'png' || format === 'jpeg') state.format = format;

  // Both samples load, so every panel has a photo to show.
  const lead = query.get('photo') || 'pier';
  const support = lead === 'boulevard' ? 'pier' : 'boulevard';
  const leadImg = await readUrlAsImage(`samples/${lead}.jpg`);
  const supportImg = await readUrlAsImage(`samples/${support}.jpg`);
  state.photos = [leadImg, supportImg];
  state.photoNames = [`${lead}.jpg`, `${support}.jpg`];
  // Alternate the two photos across the panels, hero on the lead.
  state.panels.forEach((panel, i) => {
    panel.photoIndex = i % 2 === 0 ? 0 : 1;
  });
  // Frame each supporting panel on a different part of its photo, so the
  // panels do not all show the same crop.
  state.panels[1].zoom = 1.08;
  state.panels[1].dy = -0.12;
  state.panels[2].zoom = 1.08;
  state.panels[2].dy = 0.1;
  state.panels[3].zoom = 1.02;
  state.panels[3].dy = state.sizeKey === 'wide' ? 0.08 : 0.26;
  state.panels[4].zoom = 1.12;
  state.panels[4].dy = -0.08;
  // The mosaic's small tiles read better with a little extra pop.
  if (state.panelCount === 5) {
    state.panels[1].sat = 1.15;
    state.panels[3].bright = 1.08;
  }

  // Bring the sidebar in step with the staged state.
  syncAllControls();
  const chipBox = document.getElementById('photoList');
  chipBox.innerHTML = '';
  state.photoNames.forEach((name, i) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = `Photo ${i + 1}: ${name}`;
    chipBox.appendChild(chip);
  });
  markActive('gradePicker', (button, i) => GRADE_KEYS[i] === state.grade);

  repaint();
  await document.fonts.ready;
  repaint();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}

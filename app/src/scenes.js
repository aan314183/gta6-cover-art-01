// Fixed scenes for screenshots, driven by the page's query string.
//
//   ?shot=editor — the editor with the sample photos loaded.
//   ?shot=cover  — the finished cover alone, controls hidden.
//
// Other parameters: `photo` picks which sample leads (pier or boulevard),
// `caption` and `tagline` set the lettering, `grade` picks the colour
// grade (sunset, neon, mono, dusk), `size` picks square, portrait or
// wide, `outline` sets the headline outline in px, `shadow` is 0 or 1,
// `shadowAmt` sets shadow strength, and `divider` picks the panel frame
// style. window.__shotReady is set once the cover has been painted and
// the font is ready, so a screenshot tool knows when to shoot.

import { readUrlAsImage } from './editor.js';
import { EXPORT_SIZES } from './panels.js';

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
    const sizeSelect = document.getElementById('sizeSelect');
    if (sizeSelect) sizeSelect.value = size;
  }
  const outline = query.get('outline');
  if (outline != null) {
    state.outline = Number(outline);
    const outlineRange = document.getElementById('outlineRange');
    if (outlineRange) outlineRange.value = outline;
  }
  const shadow = query.get('shadow');
  if (shadow != null) {
    state.shadow = shadow !== '0';
    const shadowToggle = document.getElementById('shadowToggle');
    if (shadowToggle) shadowToggle.checked = state.shadow;
  }
  const shadowAmt = query.get('shadowAmt');
  if (shadowAmt != null) state.shadowAmount = Number(shadowAmt);
  const divider = query.get('divider');
  if (divider) {
    state.divider = divider;
    const dividerSelect = document.getElementById('dividerSelect');
    if (dividerSelect) dividerSelect.value = divider;
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
  // four panels do not all show the same crop.
  state.panels[1].zoom = 1.08;
  state.panels[1].dy = -0.12;
  state.panels[2].zoom = 1.08;
  state.panels[2].dy = 0.1;
  state.panels[3].zoom = 1.02;
  // The strip panel is tall in the wide layout and a flat band in the
  // others, so the nudge that frames it well differs between them.
  state.panels[3].dy = state.sizeKey === 'wide' ? 0.08 : 0.26;

  // Bring the sidebar in step with the staged state.
  const headlineInput = document.getElementById('headlineInput');
  if (headlineInput) headlineInput.value = state.headline;
  const taglineInput = document.getElementById('taglineInput');
  if (taglineInput) taglineInput.value = state.tagline;
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

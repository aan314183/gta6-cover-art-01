// Fixed scenes for screenshots: ?shot=editor shows the editor with the sample
// photos loaded; ?shot=cover shows the finished cover alone. `size` picks the
// export size, `style` the colour grade, `caption` the words, and `photo` the
// sample photo used for the hero panel. window.__shotReady is set once the
// cover has been painted, so a screenshot tool knows when to shoot.

import { loadImageUrl } from './editor.js';

export async function runScene(query, editor) {
  const { state, redraw } = editor;
  const shot = query.get('shot');
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    state.hideSelection = true; // no editor outline on the finished cover
  }

  if (query.get('caption')) state.caption = query.get('caption');
  if (query.get('subcaption')) state.subcaption = query.get('subcaption');
  if (query.get('style')) state.grade = query.get('style');
  if (query.get('size')) {
    state.sizeKey = query.get('size');
    const sizeSelect = document.getElementById('size');
    if (sizeSelect) sizeSelect.value = state.sizeKey;
  }

  // Load both samples so every panel has a photo to show.
  const heroName = query.get('photo') || 'pier';
  const otherName = heroName === 'boulevard' ? 'pier' : 'boulevard';
  const hero = await loadImageUrl(`samples/${heroName}.jpg`);
  const other = await loadImageUrl(`samples/${otherName}.jpg`);
  state.photos = [hero, other];
  state.photoNames = [`${heroName}.jpg`, `${otherName}.jpg`];
  state.panels[0].photoIndex = 0;
  state.panels[1].photoIndex = 1;
  state.panels[2].photoIndex = 1;
  state.panels[3].photoIndex = 0;
  // A little framing so the panels do not all show the same crop: each
  // supporting panel is nudged to a different part of its photo.
  state.panels[1].zoom = 1.05;
  state.panels[1].dy = -0.12;
  state.panels[2].zoom = 1.05;
  state.panels[2].dy = 0.1;
  state.panels[3].zoom = 1.0;
  // The bottom panel is tall in the wide layout and a flat strip in the
  // others, so the nudge that frames a face differs between them.
  state.panels[3].dy = state.sizeKey === 'wide' ? 0.08 : 0.28;

  // Keep the editor's control values in step with the scene.
  const captionInput = document.getElementById('caption');
  if (captionInput) captionInput.value = state.caption;
  const subInput = document.getElementById('subcaption');
  if (subInput) subInput.value = state.subcaption;
  document.querySelectorAll('#styleTabs button').forEach((b) => {
    b.classList.toggle('active', b.textContent.toLowerCase() === state.grade);
  });
  document.querySelectorAll('#photoChips .chip').forEach(() => {});

  // Rebuild the photo chips and panel controls for the loaded photos.
  document.getElementById('photoChips').innerHTML = '';
  state.photoNames.forEach((name, i) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = `Photo ${i + 1}: ${name}`;
    document.getElementById('photoChips').appendChild(chip);
  });
  const select = document.getElementById('panelPhoto');
  select.innerHTML = '';
  state.photos.forEach((_, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `Photo ${i + 1} — ${state.photoNames[i]}`;
    select.appendChild(opt);
  });

  state.exportSize = { square: { width: 1080, height: 1080 }, portrait: { width: 1080, height: 1350 }, wide: { width: 1920, height: 1080 } }[state.sizeKey] || state.exportSize;
  redraw();
  await document.fonts.ready;
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

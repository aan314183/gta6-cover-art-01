// Vice Cover v4 — panel geometry, export sizes and photo painting.
//
// A cover is a collage of two, three, four or five photo panels. Panel
// zero is always the hero; the rest support it. Every panel count gets
// its own arrangement for every export size, so a layout is never a
// bigger one with a hole in it. A panel rectangle is stored as fractions
// of the cover: [left, top, width, height].
//
// New in v4: a 2-panel cinematic split (hero plus one tall side panel)
// and a 5-panel mosaic (hero plus a four-tile block), plus a story
// export size, 1080 x 1920. The dark gutters are the cover background
// showing between panels, and the user picks a frame style for each
// panel: none, hairline, bold or dashed.

export const PANEL_LABELS = ['Hero', 'Sidekick', 'Top support', 'Bottom support', 'Wide strip'];

export const PANEL_COUNTS = [2, 3, 4, 5];

export const EXPORT_SIZES = {
  square: { width: 1080, height: 1080, label: '1080 × 1080' },
  portrait: { width: 1080, height: 1350, label: '1080 × 1350' },
  wide: { width: 1920, height: 1080, label: '1920 × 1080' },
  story: { width: 1080, height: 1920, label: '1080 × 1920' },
};

export const DIVIDER_STYLES = {
  none: { label: 'No lines' },
  hairline: { label: 'Hairline' },
  bold: { label: 'Bold' },
  dashed: { label: 'Dashed' },
};

export const DIVIDER_KEYS = Object.keys(DIVIDER_STYLES);

function box(x, y, w, h) {
  return [x, y, w, h];
}

// Two panels: cinematic split. Wide covers put the hero left and the
// sidekick tall on the right; tall covers stack them.
function twoPanelLayout(sizeKey) {
  if (sizeKey === 'wide') {
    return [box(0, 0, 0.62, 1), box(0.634, 0, 0.366, 1)];
  }
  if (sizeKey === 'story') {
    return [box(0, 0, 1, 0.66), box(0, 0.674, 1, 0.326)];
  }
  return [box(0, 0, 1, 0.62), box(0, 0.634, 1, 0.366)];
}

// Three panels: hero plus two supporters.
function threePanelLayout(sizeKey) {
  if (sizeKey === 'portrait' || sizeKey === 'story') {
    return [
      box(0, 0, 1, 0.58),
      box(0, 0.594, 0.493, 0.406),
      box(0.507, 0.594, 0.493, 0.406),
    ];
  }
  if (sizeKey === 'wide') {
    return [
      box(0, 0, 0.55, 1),
      box(0.564, 0, 0.436, 0.493),
      box(0.564, 0.507, 0.436, 0.493),
    ];
  }
  return [
    box(0, 0, 1, 0.62),
    box(0, 0.634, 0.493, 0.366),
    box(0.507, 0.634, 0.493, 0.366),
  ];
}

// Four panels: hero plus three supporters.
function fourPanelLayout(sizeKey) {
  if (sizeKey === 'portrait' || sizeKey === 'story') {
    return [
      box(0, 0, 1, 0.52),
      box(0, 0.534, 0.493, 0.21),
      box(0.507, 0.534, 0.493, 0.21),
      box(0, 0.758, 1, 0.242),
    ];
  }
  if (sizeKey === 'wide') {
    return [
      box(0, 0, 0.55, 1),
      box(0.564, 0, 0.436, 0.48),
      box(0.564, 0.494, 0.225, 0.506),
      box(0.803, 0.494, 0.197, 0.506),
    ];
  }
  return [
    box(0, 0, 0.6, 0.6),
    box(0.614, 0, 0.386, 0.293),
    box(0.614, 0.307, 0.386, 0.293),
    box(0, 0.614, 1, 0.386),
  ];
}

// Five panels: mosaic. The hero holds one side and four small tiles
// fill the other side, like a contact sheet of the same night.
function fivePanelLayout(sizeKey) {
  if (sizeKey === 'wide') {
    return [
      box(0, 0, 0.5, 1),
      box(0.514, 0, 0.236, 0.493),
      box(0.764, 0, 0.236, 0.493),
      box(0.514, 0.507, 0.236, 0.493),
      box(0.764, 0.507, 0.236, 0.493),
    ];
  }
  if (sizeKey === 'story') {
    return [
      box(0, 0, 1, 0.46),
      box(0, 0.474, 0.493, 0.256),
      box(0.507, 0.474, 0.493, 0.256),
      box(0, 0.744, 0.493, 0.256),
      box(0.507, 0.744, 0.493, 0.256),
    ];
  }
  if (sizeKey === 'portrait') {
    return [
      box(0, 0, 1, 0.5),
      box(0, 0.514, 0.493, 0.23),
      box(0.507, 0.514, 0.493, 0.23),
      box(0, 0.758, 0.493, 0.242),
      box(0.507, 0.758, 0.493, 0.242),
    ];
  }
  return [
    box(0, 0, 0.58, 0.58),
    box(0.594, 0, 0.406, 0.283),
    box(0.594, 0.297, 0.406, 0.283),
    box(0, 0.594, 0.493, 0.406),
    box(0.507, 0.594, 0.493, 0.406),
  ];
}

export function layoutFor(sizeKey, panelCount) {
  if (panelCount === 2) return twoPanelLayout(sizeKey);
  if (panelCount === 3) return threePanelLayout(sizeKey);
  if (panelCount === 5) return fivePanelLayout(sizeKey);
  return fourPanelLayout(sizeKey);
}

// How many panels the cover actually shows right now.
export function visiblePanels(state) {
  return PANEL_COUNTS.includes(state.panelCount) ? state.panelCount : 4;
}

// Merges the grade filter with a panel's own brightness / contrast /
// saturation tweaks into one canvas filter string.
export function panelFilter(gradeFilter, panel) {
  const bright = panel.bright == null ? 1 : panel.bright;
  const contrast = panel.contrast == null ? 1 : panel.contrast;
  const sat = panel.sat == null ? 1 : panel.sat;
  const tweaks = `brightness(${bright}) contrast(${contrast}) saturate(${sat})`;
  return gradeFilter ? `${gradeFilter} ${tweaks}` : tweaks;
}

// Cover-fits one photo inside its rectangle, then applies the panel's
// pan (dx, dy as fractions of the panel), zoom and rotation.
export function paintPhoto(ctx, photo, rect, panel, filter, divider) {
  const surfaceW = ctx.canvas.width;
  const surfaceH = ctx.canvas.height;
  const px = rect[0] * surfaceW;
  const py = rect[1] * surfaceH;
  const pw = rect[2] * surfaceW;
  const ph = rect[3] * surfaceH;
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  ctx.fillStyle = '#1c1030';
  ctx.fillRect(px, py, pw, ph);
  if (photo && photo.naturalWidth > 0) {
    const fit = Math.max(pw / photo.naturalWidth, ph / photo.naturalHeight);
    const scale = fit * (panel.zoom || 1);
    const drawW = photo.naturalWidth * scale;
    const drawH = photo.naturalHeight * scale;
    const centreX = px + pw / 2 + (panel.dx || 0) * pw;
    const centreY = py + ph / 2 + (panel.dy || 0) * ph;
    ctx.translate(centreX, centreY);
    ctx.rotate(((panel.rotate || 0) * Math.PI) / 180);
    if (filter) ctx.filter = filter;
    ctx.drawImage(photo, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.filter = 'none';
  }
  ctx.restore();
  drawDivider(ctx, px, py, pw, ph, divider);
}

// The frame around one panel, following the user's divider choice.
export function drawDivider(ctx, x, y, pw, ph, divider) {
  if (!divider || divider === 'none') return;
  const w = ctx.canvas.width;
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  if (divider === 'bold') {
    ctx.lineWidth = Math.max(4, w * 0.005);
  } else if (divider === 'dashed') {
    ctx.lineWidth = Math.max(2, w * 0.0025);
    ctx.setLineDash([w * 0.016, w * 0.01]);
  } else {
    ctx.lineWidth = Math.max(1.5, w * 0.0015);
  }
  ctx.strokeRect(x, y, pw, ph);
  ctx.restore();
}

// Which panel a point in canvas pixels falls inside, or -1 on a gutter.
// Checked back to front so a shared edge belongs to the panel on top.
export function panelAtPoint(layout, px, py, width, height) {
  for (let i = layout.length - 1; i >= 0; i -= 1) {
    const rect = layout[i];
    const left = rect[0] * width;
    const top = rect[1] * height;
    const right = left + rect[2] * width;
    const bottom = top + rect[3] * height;
    if (px >= left && px < right && py >= top && py < bottom) return i;
  }
  return -1;
}

// Vice Cover v3 — panel geometry and photo painting.
//
// A cover is a collage of either three or four photo panels. The first
// panel is always the hero; the rest support it. Every export size gets
// its own arrangement, and the three-panel arrangement is its own layout
// rather than the four-panel one with a hole in it. A panel rectangle is
// stored as fractions of the cover: [left, top, width, height].
//
// The dark gutters are just the cover background showing between panels.
// On top of that the user picks a frame style for each panel: none, a
// hairline, a bold line, or a dashed line.

export const PANEL_LABELS = ['Hero', 'Top support', 'Bottom support', 'Wide strip'];

export const EXPORT_SIZES = {
  square: { width: 1080, height: 1080, label: '1080 × 1080' },
  portrait: { width: 1080, height: 1350, label: '1080 × 1350' },
  wide: { width: 1920, height: 1080, label: '1920 × 1080' },
};

export const DIVIDER_STYLES = {
  none: { label: 'No lines' },
  hairline: { label: 'Hairline' },
  bold: { label: 'Bold' },
  dashed: { label: 'Dashed' },
};

export const DIVIDER_KEYS = Object.keys(DIVIDER_STYLES);

const GAP = 0.014;

function box(x, y, w, h) {
  return [x, y, w, h];
}

// Four panels: hero plus three supporters, arranged per size.
function fourPanelLayout(sizeKey) {
  const g = GAP;
  if (sizeKey === 'portrait') {
    return [
      box(0, 0, 1, 0.54),
      box(0, 0.554, 0.493, 0.21),
      box(0.507, 0.554, 0.493, 0.21),
      box(0, 0.778, 1, 0.222),
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

// Three panels: hero plus two supporters, arranged per size.
function threePanelLayout(sizeKey) {
  const g = GAP;
  if (sizeKey === 'portrait') {
    return [
      box(0, 0, 1, 0.6),
      box(0, 0.614, 0.493, 0.386),
      box(0.507, 0.614, 0.493, 0.386),
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

export function layoutFor(sizeKey, panelCount) {
  return panelCount === 3 ? threePanelLayout(sizeKey) : fourPanelLayout(sizeKey);
}

// How many panels the cover actually shows right now.
export function visiblePanels(state) {
  return state.panelCount === 3 ? 3 : 4;
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

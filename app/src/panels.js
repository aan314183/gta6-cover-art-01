// Panel geometry for Vice Cover: where each photo panel sits on a cover of a
// given size, as fractions of the cover width and height. Four panels — one
// hero and three supporting — in a comic-poster grid with a thin dark gutter.

export const PANEL_NAMES = ['Hero', 'Top right', 'Bottom left', 'Bottom right'];

export const SIZES = {
  square: { width: 1080, height: 1080, label: '1080 × 1080' },
  portrait: { width: 1080, height: 1350, label: '1080 × 1350' },
  wide: { width: 1920, height: 1080, label: '1920 × 1080' },
};

// Each entry: [x, y, width, height] in fractions of the cover.
export function panelLayout(sizeKey) {
  const gap = 0.012;
  if (sizeKey === 'portrait') {
    return [
      [0, 0, 1, 0.56],
      [0, 0.56 + gap, 0.494, 0.2],
      [0.506, 0.56 + gap, 0.494, 0.2],
      [0, 0.56 + 0.2 + gap * 2, 1, 1 - 0.56 - 0.2 - gap * 2],
    ];
  }
  if (sizeKey === 'wide') {
    return [
      [0, 0, 0.52, 1],
      [0.52 + gap, 0, 1 - 0.52 - gap, 0.494],
      [0.52 + gap, 0.506, 0.234, 0.494],
      [0.52 + 0.234 + gap * 2, 0.506, 1 - 0.52 - 0.234 - gap * 2, 0.494],
    ];
  }
  // square
  return [
    [0, 0, 0.62, 0.62],
    [0.62 + gap, 0, 1 - 0.62 - gap, 0.304],
    [0.62 + gap, 0.316, 1 - 0.62 - gap, 0.304],
    [0, 0.62 + gap, 1, 1 - 0.62 - gap],
  ];
}

// Draws one photo into one panel rect, cover-fitting it, then applying the
// panel's own pan (dx, dy in panel fractions), zoom and rotation.
export function drawPanelPhoto(ctx, photo, rect, panel, gradeFilter) {
  const [fx, fy, fw, fh] = rect;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const x = fx * w;
  const y = fy * h;
  const pw = fw * w;
  const ph = fh * h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, pw, ph);
  ctx.clip();
  ctx.fillStyle = '#1c1030';
  ctx.fillRect(x, y, pw, ph);
  if (photo) {
    const base = Math.max(pw / photo.naturalWidth, ph / photo.naturalHeight);
    const scale = base * (panel.zoom || 1);
    const iw = photo.naturalWidth * scale;
    const ih = photo.naturalHeight * scale;
    const cx = x + pw / 2 + (panel.dx || 0) * pw;
    const cy = y + ph / 2 + (panel.dy || 0) * ph;
    ctx.translate(cx, cy);
    ctx.rotate(((panel.rotate || 0) * Math.PI) / 180);
    if (gradeFilter) ctx.filter = gradeFilter;
    ctx.drawImage(photo, -iw / 2, -ih / 2, iw, ih);
    ctx.filter = 'none';
  }
  ctx.restore();
  // Thin bright frame around the panel, poster style.
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(2, w * 0.002);
  ctx.strokeRect(x, y, pw, ph);
  ctx.restore();
}

// Finds which panel a point (in canvas pixels) falls inside, or -1.
export function panelAt(layout, px, py, width, height) {
  for (let i = layout.length - 1; i >= 0; i--) {
    const [fx, fy, fw, fh] = layout[i];
    if (px >= fx * width && px < (fx + fw) * width && py >= fy * height && py < (fy + fh) * height) return i;
  }
  return -1;
}

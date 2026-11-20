// Panel geometry and painting for Vice Cover v2.
//
// A cover holds four photo panels — one large hero and three supporters —
// arranged differently for each export size, so the same photos read well
// as a square post, a tall portrait, or a wide banner. Rectangles are
// fractions of the cover: [left, top, width, height], all in 0..1.
//
// The thin dark gutters between panels come from the cover background
// showing through. On top of that, the user picks a divider style, which
// draws a frame around every panel: none, a hairline, a bold line, or a
// dashed line. Dividers are drawn by paintPhoto below, from the state.

export const PANEL_LABELS = ['Hero', 'Upper side', 'Lower side', 'Wide strip'];

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

const GUTTER = 0.014;

// Rectangles per size, each as [x, y, w, h] fractions.
export function layoutFor(sizeKey) {
  const g = GUTTER;
  if (sizeKey === 'portrait') {
    const heroH = 0.54;
    const midH = 0.21;
    const stripY = heroH + midH + g * 2;
    return [
      [0, 0, 1, heroH],
      [0, heroH + g, 0.493, midH],
      [0.507, heroH + g, 0.493, midH],
      [0, stripY, 1, 1 - stripY],
    ];
  }
  if (sizeKey === 'wide') {
    const heroW = 0.55;
    const topH = 0.48;
    const sideW = 0.225;
    return [
      [0, 0, heroW, 1],
      [heroW + g, 0, 1 - heroW - g, topH],
      [heroW + g, topH + g, sideW, 1 - topH - g],
      [heroW + sideW + g * 2, topH + g, 1 - heroW - sideW - g * 2, 1 - topH - g],
    ];
  }
  // square: hero top-left, two stacked on the right, strip along the bottom.
  const hero = 0.6;
  const rightH = 0.293;
  return [
    [0, 0, hero, hero],
    [hero + g, 0, 1 - hero - g, rightH],
    [hero + g, rightH + g, 1 - hero - g, rightH],
    [0, hero + g, 1, 1 - hero - g],
  ];
}

// Paints one photo into its rectangle, cover-fitting it, then shifting it
// by the panel's pan (dx, dy as fractions of the panel), zoom and rotation.
export function paintPhoto(ctx, photo, rect, panel, filter, divider) {
  const fx = rect[0];
  const fy = rect[1];
  const fw = rect[2];
  const fh = rect[3];
  const canvasW = ctx.canvas.width;
  const canvasH = ctx.canvas.height;
  const x = fx * canvasW;
  const y = fy * canvasH;
  const pw = fw * canvasW;
  const ph = fh * canvasH;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, pw, ph);
  ctx.clip();
  ctx.fillStyle = '#1c1030';
  ctx.fillRect(x, y, pw, ph);
  if (photo && photo.naturalWidth > 0) {
    const cover = Math.max(pw / photo.naturalWidth, ph / photo.naturalHeight);
    const scale = cover * (panel.zoom || 1);
    const iw = photo.naturalWidth * scale;
    const ih = photo.naturalHeight * scale;
    const cx = x + pw / 2 + (panel.dx || 0) * pw;
    const cy = y + ph / 2 + (panel.dy || 0) * ph;
    ctx.translate(cx, cy);
    ctx.rotate(((panel.rotate || 0) * Math.PI) / 180);
    if (filter) ctx.filter = filter;
    ctx.drawImage(photo, -iw / 2, -ih / 2, iw, ih);
    ctx.filter = 'none';
  }
  ctx.restore();
  drawDivider(ctx, x, y, pw, ph, divider);
}

// The frame around a panel, following the user's divider choice.
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

// Which panel a point in canvas pixels lands in, or -1 when it lands on a
// gutter. Later panels win, so a shared edge belongs to the panel on top.
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

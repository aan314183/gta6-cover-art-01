// Vice Cover v4 — painting the finished cover and saving it.
//
// renderPoster draws a whole cover onto whatever canvas it is handed,
// at that canvas's own size: dark background, the visible photo panels
// (each with its own brightness / contrast / saturation), the grade
// wash, a touch of deterministic grain, the caption band, and — when
// switched on — the star badge in the top corner.
//
// The headline honours alignment (left, centre, right), letter-spacing,
// a size multiplier, an all-caps switch, a dark outline and an optional
// drop shadow. exportPoster downloads the same cover rendered off-screen
// at a real export size, as PNG or JPEG.

import { layoutFor, paintPhoto, panelFilter, visiblePanels } from './panels.js';
import { gradeFor, paintWash, paintGrain } from './grade.js';

const POSTER_FONT = '"Vice Bold", sans-serif';

export function renderPoster(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = gradeFor(state.grade);
  const layout = layoutFor(state.sizeKey, state.panelCount);
  const shown = visiblePanels(state);

  ctx.fillStyle = '#14081f';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < shown; i += 1) {
    const panel = state.panels[i];
    const photo = state.photos[panel.photoIndex] || null;
    const filter = panelFilter(grade.filter, panel);
    paintPhoto(ctx, photo, layout[i], panel, filter, state.divider);
  }
  paintWash(ctx, grade);
  paintGrain(ctx, state.grain ? 1 : 0);
  paintCaptionBand(ctx, state, grade);
  if (state.badge) paintBadge(ctx, grade);
  if (!state.clean) paintActiveFrame(ctx, state, layout);
}

function anchorXFor(state, w) {
  if (state.align === 'center') return w / 2;
  if (state.align === 'right') return w * 0.955;
  return w * 0.045;
}

function headlineText(state) {
  const raw = (state.headline || '').trim();
  if (!raw) return '';
  return state.uppercase === false ? raw : raw.toUpperCase();
}

function paintCaptionBand(ctx, state, grade) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const bandH = h * 0.22;
  const bandTop = h - bandH;
  const fade = ctx.createLinearGradient(0, bandTop - h * 0.07, 0, h);
  fade.addColorStop(0, 'rgba(0, 0, 0, 0)');
  fade.addColorStop(0.3, grade.band);
  fade.addColorStop(1, grade.band);
  ctx.fillStyle = fade;
  ctx.fillRect(0, bandTop - h * 0.07, w, bandH + h * 0.07);

  const align = state.align === 'center' ? 'center' : state.align === 'right' ? 'right' : 'left';
  const anchorX = anchorXFor(state, w);
  const tracking = state.spacing == null ? 0 : state.spacing;
  const sizeScale = state.headlineSize == null ? 1 : state.headlineSize;

  const headline = headlineText(state);
  if (headline) {
    let size = h * 0.088 * sizeScale;
    const limit = w * 0.88;
    ctx.font = `700 ${size}px ${POSTER_FONT}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${tracking}px`;
    while (ctx.measureText(headline).width > limit && size > h * 0.02) {
      size -= 2;
      ctx.font = `700 ${size}px ${POSTER_FONT}`;
    }
    const y = h - h * 0.082;
    ctx.textAlign = align;
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    const outlinePx = (state.outline || 0) * (size / 48);
    if (state.shadow) {
      const strength = state.shadowAmount == null ? 0.6 : state.shadowAmount;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = size * 0.22 * strength;
      ctx.shadowOffsetX = size * 0.04 * strength;
      ctx.shadowOffsetY = size * 0.06 * strength;
    }
    if (outlinePx > 0) {
      ctx.strokeStyle = 'rgba(10, 2, 24, 0.95)';
      ctx.lineWidth = outlinePx;
      ctx.strokeText(headline, anchorX, y);
    }
    ctx.fillStyle = grade.ink;
    ctx.fillText(headline, anchorX, y);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }

  const tagline = (state.tagline || '').trim().toUpperCase();
  if (tagline) {
    const size = Math.max(h * 0.02, 13);
    ctx.font = `700 ${size}px ${POSTER_FONT}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.max(0, tracking * 0.5)}px`;
    ctx.fillStyle = grade.accent;
    ctx.textAlign = align;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(tagline, anchorX, h - h * 0.03);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }
}

// A five-pointed star in the top-right corner reading EST. 2026.
// Drawn from scratch with plain canvas paths — no image, no logo.
function paintBadge(ctx, grade) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const radius = Math.min(w, h) * 0.075;
  const cx = w - radius * 1.25;
  const cy = radius * 1.25;
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? radius : radius * 0.45;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = grade.accent === '#ffd166' ? 'rgba(255, 190, 60, 0.95)' : 'rgba(255, 45, 146, 0.92)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = Math.max(2, radius * 0.05);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.max(11, radius * 0.24)}px ${POSTER_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EST.', cx, cy - radius * 0.14);
  ctx.fillText('2026', cx, cy + radius * 0.16);
  ctx.restore();
}

// Dashed frame around the panel being edited; left out of clean exports.
function paintActiveFrame(ctx, state, layout) {
  if (state.active == null) return;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const rect = layout[state.active];
  if (!rect) return;
  ctx.save();
  ctx.strokeStyle = '#ff7ad9';
  ctx.lineWidth = Math.max(3, w * 0.004);
  ctx.setLineDash([w * 0.014, w * 0.009]);
  ctx.strokeRect(rect[0] * w, rect[1] * h, rect[2] * w, rect[3] * h);
  ctx.restore();
}

// Renders the cover at a real export size and downloads it. PNG is
// lossless; JPEG (quality 0.92) is the smaller alternative.
export function exportPoster(state, onSaved) {
  const size = state.exportSize;
  const off = document.createElement('canvas');
  off.width = size.width;
  off.height = size.height;
  const clean = { ...state, active: null, clean: true };
  renderPoster(off, clean);
  const format = state.format === 'jpeg' ? 'jpeg' : 'png';
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const name = `vice-cover-${size.width}x${size.height}.${format === 'jpeg' ? 'jpg' : 'png'}`;
  off.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
    if (onSaved) onSaved(name);
  }, mime, 0.92);
}

// Kept name for the old call site: PNG export is the default format.
export function exportPosterPNG(state, onSaved) {
  exportPoster({ ...state, format: 'png' }, onSaved);
}

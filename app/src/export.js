// Cover rendering and PNG export for Vice Cover v2.
//
// renderPoster paints a whole cover onto any canvas at that canvas's own
// size: dark background, the four photo panels, the grade wash, then the
// caption band with the headline and tagline. The headline can carry a
// dark outline of adjustable thickness and an optional drop shadow whose
// strength the user sets — both new in v2. exportPosterPNG renders the
// same cover off-screen at a real export size and downloads it.

import { layoutFor, paintPhoto } from './panels.js';
import { gradeFor, paintWash } from './grade.js';

const POSTER_FONT = '"Vice Bold", sans-serif';

export function renderPoster(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = gradeFor(state.grade);
  const layout = layoutFor(state.sizeKey);

  ctx.fillStyle = '#14081f';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < state.panels.length; i += 1) {
    const panel = state.panels[i];
    const photo = state.photos[panel.photoIndex] || null;
    paintPhoto(ctx, photo, layout[i], panel, grade.filter, state.divider);
  }
  paintWash(ctx, grade);
  paintCaptionBand(ctx, state, grade);
  if (!state.clean) paintActiveFrame(ctx, state, layout);
}

function paintCaptionBand(ctx, state, grade) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const bandH = h * 0.22;
  const top = h - bandH;
  const fade = ctx.createLinearGradient(0, top - h * 0.07, 0, h);
  fade.addColorStop(0, 'rgba(0, 0, 0, 0)');
  fade.addColorStop(0.3, grade.band);
  fade.addColorStop(1, grade.band);
  ctx.fillStyle = fade;
  ctx.fillRect(0, top - h * 0.07, w, bandH + h * 0.07);

  const headline = (state.headline || '').trim().toUpperCase();
  if (headline) {
    let size = h * 0.088;
    ctx.font = `700 ${size}px ${POSTER_FONT}`;
    const limit = w * 0.88;
    while (ctx.measureText(headline).width > limit && size > h * 0.022) {
      size -= 2;
      ctx.font = `700 ${size}px ${POSTER_FONT}`;
    }
    const x = w * 0.045;
    const y = h - h * 0.082;
    ctx.textAlign = 'left';
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
      ctx.strokeText(headline, x, y);
    }
    ctx.fillStyle = grade.ink;
    ctx.fillText(headline, x, y);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  const tagline = (state.tagline || '').trim().toUpperCase();
  if (tagline) {
    const size = Math.max(h * 0.02, 13);
    ctx.font = `700 ${size}px ${POSTER_FONT}`;
    ctx.fillStyle = grade.accent;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(tagline, w * 0.045, h - h * 0.03);
  }
}

// Dashed frame around the panel being edited; skipped for clean exports.
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

// Renders the cover at a real export size and downloads it as a PNG file.
export function exportPosterPNG(state, onSaved) {
  const size = state.exportSize;
  const off = document.createElement('canvas');
  off.width = size.width;
  off.height = size.height;
  const clean = { ...state, active: null, clean: true };
  renderPoster(off, clean);
  off.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vice-cover-${size.width}x${size.height}.png`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
    if (onSaved) onSaved(link.download);
  }, 'image/png');
}

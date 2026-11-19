// Renders a finished cover onto any canvas: panels, grade wash, then the
// bold caption band along the bottom. Also exports that render as a PNG file.

import { panelLayout, drawPanelPhoto } from './panels.js';
import { GRADES, paintWash } from './grade.js';

const FONT = '"Vice Bold", sans-serif';

// Draws the whole cover for `state` onto `canvas` at the canvas's own size.
export function renderCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const layout = panelLayout(state.sizeKey);

  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, w, h);
  state.panels.forEach((panel, i) => {
    const photo = state.photos[panel.photoIndex] || null;
    drawPanelPhoto(ctx, photo, layout[i], panel, grade.photoFilter);
  });
  paintWash(ctx, grade);
  drawCaptionBand(ctx, state, grade);
  drawSelectedOutline(ctx, state, layout);
}

function drawCaptionBand(ctx, state, grade) {
  const { width: w, height: h } = ctx.canvas;
  const bandH = h * 0.2;
  const bandY = h - bandH;
  const fade = ctx.createLinearGradient(0, bandY - h * 0.06, 0, h);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(0.35, grade.band);
  fade.addColorStop(1, grade.band);
  ctx.fillStyle = fade;
  ctx.fillRect(0, bandY - h * 0.06, w, bandH + h * 0.06);

  const caption = (state.caption || '').trim().toUpperCase();
  if (caption) {
    let size = h * 0.085;
    ctx.font = `700 ${size}px ${FONT}`;
    while (ctx.measureText(caption).width > w * 0.8 && size > h * 0.02) {
      size -= 2;
      ctx.font = `700 ${size}px ${FONT}`;
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = size * 0.18;
    ctx.shadowOffsetY = size * 0.05;
    ctx.fillText(caption, w * 0.045, h - h * 0.075);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  const sub = (state.subcaption || '').trim().toUpperCase();
  if (sub) {
    const size = Math.max(h * 0.021, 14);
    ctx.font = `700 ${size}px ${FONT}`;
    ctx.fillStyle = grade.accent;
    ctx.textAlign = 'left';
    ctx.fillText(sub, w * 0.045, h - h * 0.028);
  }
}

// A dashed outline around the panel being edited, only in the live preview.
function drawSelectedOutline(ctx, state, layout) {
  if (state.selected == null || state.hideSelection) return;
  const { width: w, height: h } = ctx.canvas;
  const [fx, fy, fw, fh] = layout[state.selected];
  ctx.save();
  ctx.strokeStyle = '#ff7ad9';
  ctx.lineWidth = Math.max(3, w * 0.004);
  ctx.setLineDash([w * 0.012, w * 0.008]);
  ctx.strokeRect(fx * w, fy * h, fw * w, fh * h);
  ctx.restore();
}

// Renders `state` at a real export size and downloads it as a PNG.
export function exportCoverPNG(state, onDone) {
  const size = state.exportSize;
  const off = document.createElement('canvas');
  off.width = size.width;
  off.height = size.height;
  const clean = { ...state, selected: null, hideSelection: true };
  renderCover(off, clean);
  off.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vice-cover-${size.width}x${size.height}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    if (onDone) onDone(a.download);
  }, 'image/png');
}

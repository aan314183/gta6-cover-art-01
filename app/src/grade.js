// Colour grades for Vice Cover. Each grade tints the whole cover after the
// photos are drawn: a warm Vice City sunset, a hot neon night, or a stark
// monochrome. No grade uses any artwork from a game — just gradients.

export const GRADES = {
  sunset: {
    label: 'Sunset',
    // Canvas filter applied while each photo is drawn.
    photoFilter: 'saturate(1.25) contrast(1.05)',
    // Gradient stops painted over the cover, top to bottom.
    wash: [
      [0, 'rgba(255, 122, 24, 0.10)'],
      [0.55, 'rgba(255, 45, 146, 0.08)'],
      [1, 'rgba(90, 10, 90, 0.42)'],
    ],
    band: 'rgba(40, 6, 60, 0.88)',
    accent: '#ff9e57',
  },
  neon: {
    label: 'Neon',
    photoFilter: 'saturate(1.6) contrast(1.12)',
    wash: [
      [0, 'rgba(0, 229, 255, 0.14)'],
      [0.5, 'rgba(255, 45, 200, 0.10)'],
      [1, 'rgba(20, 0, 60, 0.5)'],
    ],
    band: 'rgba(10, 8, 40, 0.9)',
    accent: '#00e5ff',
  },
  mono: {
    label: 'Mono',
    photoFilter: 'grayscale(1) contrast(1.18) brightness(1.05)',
    wash: [
      [0, 'rgba(255,255,255,0.05)'],
      [1, 'rgba(0,0,0,0.5)'],
    ],
    band: 'rgba(0, 0, 0, 0.88)',
    accent: '#ffffff',
  },
};

export const GRADE_KEYS = Object.keys(GRADES);

// Paints a grade's wash gradient over the whole canvas.
export function paintWash(ctx, grade) {
  const { width: w, height: h } = ctx.canvas;
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  for (const [stop, colour] of grade.wash) wash.addColorStop(stop, colour);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  // A soft vignette so the edges fall away like a poster.
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

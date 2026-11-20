// Colour grades for Vice Cover v2. A grade is a look laid over the whole
// poster: a filter while each photo is painted, a translucent wash gradient,
// the colour of the caption band, and the accent used for the tagline.
// Four looks ship with the app — warm Sunset, electric Neon, stark Mono,
// and the new Dusk, a violet-blue twilight. Nothing here copies any game's
// artwork: every effect is a plain canvas gradient or filter.

export const GRADES = {
  sunset: {
    label: 'Sunset',
    filter: 'saturate(1.25) contrast(1.05)',
    wash: [
      [0, 'rgba(255, 122, 24, 0.10)'],
      [0.55, 'rgba(255, 45, 146, 0.08)'],
      [1, 'rgba(90, 10, 90, 0.42)'],
    ],
    band: 'rgba(40, 6, 60, 0.88)',
    accent: '#ff9e57',
    ink: '#ffffff',
  },
  neon: {
    label: 'Neon',
    filter: 'saturate(1.6) contrast(1.12)',
    wash: [
      [0, 'rgba(0, 229, 255, 0.14)'],
      [0.5, 'rgba(255, 45, 200, 0.10)'],
      [1, 'rgba(20, 0, 60, 0.50)'],
    ],
    band: 'rgba(10, 8, 40, 0.90)',
    accent: '#00e5ff',
    ink: '#ffffff',
  },
  mono: {
    label: 'Mono',
    filter: 'grayscale(1) contrast(1.18) brightness(1.05)',
    wash: [
      [0, 'rgba(255, 255, 255, 0.05)'],
      [1, 'rgba(0, 0, 0, 0.50)'],
    ],
    band: 'rgba(0, 0, 0, 0.88)',
    accent: '#ffffff',
    ink: '#ffffff',
  },
  dusk: {
    label: 'Dusk',
    filter: 'saturate(1.15) contrast(1.08) hue-rotate(-18deg)',
    wash: [
      [0, 'rgba(124, 93, 250, 0.16)'],
      [0.5, 'rgba(58, 28, 140, 0.14)'],
      [1, 'rgba(8, 4, 38, 0.55)'],
    ],
    band: 'rgba(16, 8, 52, 0.90)',
    accent: '#b79cff',
    ink: '#f4efff',
  },
};

export const GRADE_KEYS = Object.keys(GRADES);

export function gradeFor(key) {
  return GRADES[key] || GRADES.sunset;
}

// Layers a grade's wash gradient plus a gentle vignette over the canvas.
export function paintWash(ctx, grade) {
  const canvas = ctx.canvas;
  const w = canvas.width;
  const h = canvas.height;
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  for (const stop of grade.wash) wash.addColorStop(stop[0], stop[1]);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  const short = Math.min(w, h);
  const long = Math.max(w, h);
  const vignette = ctx.createRadialGradient(
    w / 2, h / 2, short * 0.35, w / 2, h / 2, long * 0.75,
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

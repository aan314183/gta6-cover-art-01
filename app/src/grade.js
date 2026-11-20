// Vice Cover v4 — colour grades.
//
// A grade is a recipe, not a picture: a canvas filter that tints every
// photo as it is painted, a vertical wash that unifies the collage, the
// colour of the caption band, the tagline accent and the headline ink.
// Seven grades ship in v4. Two are new: Vice, a purple-and-gold night
// on the boulevard, and Palm, a green tropical afternoon. Everything is
// gradients and filter strings; no artwork, logo or typeface is borrowed
// from any game, and no grade ever reaches for the network.

export const GRADE_LIST = [
  {
    key: 'sunset',
    label: 'Sunset',
    blurb: 'Orange dusk over the bay',
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
  {
    key: 'neon',
    label: 'Neon',
    blurb: 'Pink and cyan after midnight',
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
  {
    key: 'mono',
    label: 'Mono',
    blurb: 'Black-and-white press shot',
    filter: 'grayscale(1) contrast(1.18) brightness(1.05)',
    wash: [
      [0, 'rgba(255, 255, 255, 0.05)'],
      [1, 'rgba(0, 0, 0, 0.50)'],
    ],
    band: 'rgba(0, 0, 0, 0.88)',
    accent: '#ffffff',
    ink: '#ffffff',
  },
  {
    key: 'dusk',
    label: 'Dusk',
    blurb: 'Violet-blue twilight',
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
  {
    key: 'candy',
    label: 'Candy',
    blurb: 'Loud pink-and-cyan pop',
    filter: 'saturate(1.75) contrast(1.1) hue-rotate(8deg)',
    wash: [
      [0, 'rgba(255, 45, 200, 0.18)'],
      [0.45, 'rgba(0, 229, 255, 0.12)'],
      [1, 'rgba(60, 0, 70, 0.48)'],
    ],
    band: 'rgba(58, 2, 64, 0.90)',
    accent: '#00e5ff',
    ink: '#fff3fb',
  },
  {
    key: 'vice',
    label: 'Vice',
    blurb: 'Purple night, gold lettering',
    filter: 'saturate(1.35) contrast(1.1) hue-rotate(-28deg)',
    wash: [
      [0, 'rgba(255, 190, 60, 0.12)'],
      [0.5, 'rgba(150, 40, 200, 0.14)'],
      [1, 'rgba(30, 0, 60, 0.55)'],
    ],
    band: 'rgba(28, 4, 56, 0.92)',
    accent: '#ffd166',
    ink: '#fff8e6',
  },
  {
    key: 'palm',
    label: 'Palm',
    blurb: 'Green tropical afternoon',
    filter: 'saturate(1.45) contrast(1.04) hue-rotate(28deg)',
    wash: [
      [0, 'rgba(120, 255, 170, 0.12)'],
      [0.5, 'rgba(20, 180, 140, 0.10)'],
      [1, 'rgba(4, 50, 40, 0.50)'],
    ],
    band: 'rgba(4, 44, 34, 0.90)',
    accent: '#7dffb0',
    ink: '#f2fff6',
  },
];

export const GRADE_KEYS = GRADE_LIST.map((grade) => grade.key);

export const GRADES = Object.fromEntries(GRADE_LIST.map((grade) => [grade.key, grade]));

export function gradeFor(key) {
  return GRADES[key] || GRADES.sunset;
}

// Paints the grade's vertical wash over the whole cover, then a soft
// vignette so the caption band sits on something calm.
export function paintWash(ctx, grade) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const tint = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, colour] of grade.wash) tint.addColorStop(at, colour);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, w, h);
  const edge = Math.min(w, h);
  const reach = Math.max(w, h);
  const shade = ctx.createRadialGradient(
    w / 2, h / 2, edge * 0.35, w / 2, h / 2, reach * 0.75,
  );
  shade.addColorStop(0, 'rgba(0, 0, 0, 0)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0.32)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, w, h);
}

// A tiny deterministic speckle, seeded per cover, so grain never changes
// between two exports of the same settings.
export function paintGrain(ctx, amount) {
  if (!amount || amount <= 0) return;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  let seed = 20261120;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const dots = Math.floor((w * h) / 9000) * amount;
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < dots; i += 1) {
    const x = next() * w;
    const y = next() * h;
    const s = 1 + next() * 2;
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

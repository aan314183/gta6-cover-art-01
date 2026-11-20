// Vice Cover v3 — colour looks.
//
// Every look is one plain object: a canvas filter string that tints each
// photo as it is painted, a vertical wash laid over the finished collage,
// the solid colour behind the caption strip, the tagline colour, and the
// headline ink. Five looks ship now — the four from before plus Candy, a
// loud pink-and-cyan pop. All of it is gradients and filters; nothing
// here borrows artwork, a logo, or a typeface from any game.

const LOOKS = [
  {
    key: 'sunset',
    name: 'Sunset',
    photoFilter: 'saturate(1.25) contrast(1.05)',
    washStops: [
      [0, 'rgba(255, 122, 24, 0.10)'],
      [0.55, 'rgba(255, 45, 146, 0.08)'],
      [1, 'rgba(90, 10, 90, 0.42)'],
    ],
    strip: 'rgba(40, 6, 60, 0.88)',
    tagColour: '#ff9e57',
    inkColour: '#ffffff',
  },
  {
    key: 'neon',
    name: 'Neon',
    photoFilter: 'saturate(1.6) contrast(1.12)',
    washStops: [
      [0, 'rgba(0, 229, 255, 0.14)'],
      [0.5, 'rgba(255, 45, 200, 0.10)'],
      [1, 'rgba(20, 0, 60, 0.50)'],
    ],
    strip: 'rgba(10, 8, 40, 0.90)',
    tagColour: '#00e5ff',
    inkColour: '#ffffff',
  },
  {
    key: 'mono',
    name: 'Mono',
    photoFilter: 'grayscale(1) contrast(1.18) brightness(1.05)',
    washStops: [
      [0, 'rgba(255, 255, 255, 0.05)'],
      [1, 'rgba(0, 0, 0, 0.50)'],
    ],
    strip: 'rgba(0, 0, 0, 0.88)',
    tagColour: '#ffffff',
    inkColour: '#ffffff',
  },
  {
    key: 'dusk',
    name: 'Dusk',
    photoFilter: 'saturate(1.15) contrast(1.08) hue-rotate(-18deg)',
    washStops: [
      [0, 'rgba(124, 93, 250, 0.16)'],
      [0.5, 'rgba(58, 28, 140, 0.14)'],
      [1, 'rgba(8, 4, 38, 0.55)'],
    ],
    strip: 'rgba(16, 8, 52, 0.90)',
    tagColour: '#b79cff',
    inkColour: '#f4efff',
  },
  {
    key: 'candy',
    name: 'Candy',
    photoFilter: 'saturate(1.75) contrast(1.1) hue-rotate(8deg)',
    washStops: [
      [0, 'rgba(255, 45, 200, 0.18)'],
      [0.45, 'rgba(0, 229, 255, 0.12)'],
      [1, 'rgba(60, 0, 70, 0.48)'],
    ],
    strip: 'rgba(58, 2, 64, 0.90)',
    tagColour: '#00e5ff',
    inkColour: '#fff3fb',
  },
];

export const GRADE_KEYS = LOOKS.map((look) => look.key);

// Backwards-friendly map for callers that index by key.
export const GRADES = Object.fromEntries(
  LOOKS.map((look) => [look.key, {
    label: look.name,
    filter: look.photoFilter,
    wash: look.washStops,
    band: look.strip,
    accent: look.tagColour,
    ink: look.inkColour,
  }]),
);

export function gradeFor(key) {
  return GRADES[key] || GRADES.sunset;
}

// Spreads the look's vertical wash across the whole poster, then darkens
// the corners a touch so the caption strip sits on something calm.
export function paintWash(ctx, grade) {
  const surface = ctx.canvas;
  const w = surface.width;
  const h = surface.height;
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
  shade.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, w, h);
}

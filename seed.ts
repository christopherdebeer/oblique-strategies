// Simple seeded PRNG (mulberry32)
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return h;
}

export function seededIndex(seed: string, len: number): number {
  const rng = mulberry32(hashString(seed));
  rng(); // warm up
  return Math.floor(rng() * len);
}

export function timeSeed(mode: string): string {
  const now = new Date();
  switch (mode) {
    case "hourly":
      return `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}-${now.getUTCHours()}`;
    case "daily":
      return `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
    case "weekly": {
      const start = new Date(now.getUTCFullYear(), 0, 1);
      const week = Math.ceil((((+now - +start) / 86400000) + start.getUTCDay() + 1) / 7);
      return `${now.getUTCFullYear()}-w${week}`;
    }
    case "monthly":
      return `${now.getUTCFullYear()}-${now.getUTCMonth()}`;
    default:
      return crypto.randomUUID();
  }
}

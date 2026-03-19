// Single source of truth for about/docs content.
// Used by: plain text root (agents), /about route, client About tab.

export const ABOUT = {
  title: "Oblique Strategies",
  subtitle: "Over one hundred worthwhile dilemmas",
  attribution: "Brian Eno and Peter Schmidt, 1975",
  description: [
    "A card-based creative tool. Each card offers a constraint or prompt designed to break creative blocks by shifting perspective.",
    "Originally published as a physical deck. This is a digital edition with time-seeded modes so a group can share the same card for a period.",
  ],
  modes: {
    original: "Pure random — a new card every draw",
    deterministic: "Seeded by a string you provide — same seed, same card, always",
    hourly: "Everyone sees the same card for the current hour",
    daily: "Everyone sees the same card for the current day",
    weekly: "Everyone sees the same card for the current week",
    monthly: "Everyone sees the same card for the current month",
  },
  api: [
    { method: "GET", path: "/api/random?mode=MODE", desc: "Draw one card" },
    { method: "GET", path: "/api/strategies", desc: "Full list" },
    { method: "GET", path: "/api/modes", desc: "Available modes" },
    { method: "GET", path: "/about", desc: "This page (text/html or text/plain)" },
  ],
  examples: [
    "curl $ORIGIN/api/random",
    "curl $ORIGIN/api/random?mode=daily",
    "curl $ORIGIN/api/random?mode=deterministic&seed=alice",
  ],
};

/** Markdown/plain text rendering of ABOUT for agents */
export function aboutPlainText(): string {
  const a = ABOUT;
  const lines: string[] = [
    `# ${a.title}`,
    `${a.subtitle} — ${a.attribution}`,
    "",
    ...a.description,
    "",
    "## Modes",
    ...Object.entries(a.modes).map(([k, v]) => `- ${k}: ${v}`),
    "",
    "## API",
    ...a.api.map(e => `- ${e.method} ${e.path} — ${e.desc}`),
    "",
    "## Examples",
    ...a.examples.map(e => `  ${e}`),
    "",
  ];
  return lines.join("\n");
}

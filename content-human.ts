// Human-facing about content — returned as JSON at /api/about, rendered by the browser client.
// Includes a "For Developers & Agents" section.

import { TITLE, SUBTITLE, ATTRIBUTION, MODES, MODE_NAMES } from "./content-shared.ts";

export function humanAbout(origin: string) {
  return {
    title: TITLE,
    subtitle: SUBTITLE,
    attribution: ATTRIBUTION,
    description: [
      "A card-based creative tool. Each card offers a constraint or prompt designed to break creative blocks by shifting perspective.",
      "Originally published as a physical deck of cards. This is a digital edition with time-seeded modes, so a group can share the same card for a period.",
      "Click the card to draw again. Use the buttons above to change how cards are chosen.",
    ],
    modes: Object.fromEntries(MODE_NAMES.map(m => [m, MODES[m].human])),
    dev: {
      intro: "This app doubles as an API. Agents and scripts can draw cards programmatically. The root URL returns a machine-readable skill document when fetched without a browser Accept header.",
      origin: origin,
      endpoints: [
        { method: "GET", path: "/api/random?mode=MODE&seed=SEED", desc: "Draw one card" },
        { method: "GET", path: "/api/strategies", desc: "Full list of strategies" },
        { method: "GET", path: "/api/modes", desc: "Available modes" },
      ],
      examples: [
        "curl " + origin + "/api/random",
        "curl " + origin + "/api/random?mode=daily",
        "curl '" + origin + "/api/random?mode=deterministic&seed=alice'",
      ],
      skillUrl: origin + "/skill.md",
    },
  };
}

// Agent-facing skill document — returned as markdown at root (non-HTML) and /about (non-HTML).
// Modeled on the SKILL.md format so agents can parse it as a capability description.

import { TITLE, SUBTITLE, ATTRIBUTION, MODES, MODE_NAMES } from "./content-shared.ts";

export function skillDocument(origin: string): string {
  const modeList = MODE_NAMES
    .map(m => `- **${m}**: ${MODES[m].agent}`)
    .join("\n");

  return `---
name: oblique-strategies
description: >
  Draw an Oblique Strategy card — a lateral-thinking prompt for creative work.
  Use when a creative process is stuck, when brainstorming needs a sideways nudge,
  or when a group needs a shared constraint for a time period.
origin: ${origin}
---

# ${TITLE}

${SUBTITLE} — ${ATTRIBUTION}

A deck of cards, each with a brief prompt designed to break creative deadlock by shifting perspective. Originally physical; this is a digital edition with time-seeded modes so a group can share the same card for a period.

## When to use this

- A user is stuck on a creative problem and needs a lateral prompt
- You want to inject an unexpected constraint into a brainstorming session
- A team needs a shared "card of the day" to anchor discussion
- You need a random but reproducible creative seed (deterministic mode)

## Modes

${modeList}

### Mode selection guidance

If the user hasn't specified a mode, **daily** is a good default — stable enough to reference throughout a conversation, fresh enough not to go stale. Use **deterministic** with a user-specific seed when you want the same person to always draw the same card. Use **original** when surprise matters more than consistency.

## API

All endpoints return JSON. Base URL: \`${origin}\`

### Draw a card

\`\`\`
GET ${origin}/api/random?mode=MODE&seed=SEED
\`\`\`

Parameters:
- \`mode\` (optional): One of ${MODE_NAMES.map(m => `\`${m}\``).join(", ")}. Default: \`original\`.
- \`seed\` (optional): For \`deterministic\`, this IS the identity — same seed, same card, always. For time modes (\`hourly\`, \`daily\`, etc.), seed is combined with the time window, so different seeds in the same hour yield different cards.

Response:
\`\`\`json
{ "mode": "daily", "strategy": "Honor thy error as a hidden intention", "index": 21 }
\`\`\`

### List all strategies

\`\`\`
GET ${origin}/api/strategies
\`\`\`

Response:
\`\`\`json
{ "count": 51, "strategies": ["Abandon normal instruments", ...] }
\`\`\`

### List modes

\`\`\`
GET ${origin}/api/modes
\`\`\`

Response:
\`\`\`json
{ "modes": ["original", "deterministic", "hourly", "daily", "weekly", "monthly"] }
\`\`\`

### About (structured)

\`\`\`
GET ${origin}/api/about
\`\`\`

Returns the human-readable about content as JSON.

## Examples

\`\`\`bash
# Draw a random card
curl ${origin}/api/random

# Today's shared card
curl ${origin}/api/random?mode=daily

# A stable card for a specific user
curl ${origin}/api/random?mode=deterministic&seed=alice

# This week's card, scoped to a team
curl ${origin}/api/random?mode=weekly&seed=design-team
\`\`\`
`;
}

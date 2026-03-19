// Shared constants — single source of truth for mode names, descriptions, etc.
// Both agent and human content files import from here.

export const TITLE = "Oblique Strategies";
export const SUBTITLE = "Over one hundred worthwhile dilemmas";
export const ATTRIBUTION = "Brian Eno and Peter Schmidt, 1975";

export const MODES: Record<string, { short: string; agent: string; human: string }> = {
  original: {
    short: "Pure random",
    agent: "A new card every request. No seeding. Use as default when novelty matters more than consistency.",
    human: "A fresh card every time you draw. Pure chance.",
  },
  deterministic: {
    short: "Seed-locked",
    agent: "Same seed always yields the same card. Use with a user-specific seed (e.g. username) when you want a stable assignment. Good for giving each person 'their' card.",
    human: "The same seed always draws the same card. Try your name — it's yours forever.",
  },
  hourly: {
    short: "Shared per hour",
    agent: "Everyone with the same seed prefix sees the same card for the current UTC hour. Good for workshop sessions or standups.",
    human: "Everyone sees the same card for the current hour. Good for a team working together.",
  },
  daily: {
    short: "Shared per day",
    agent: "Same card all day (UTC). Good default if the user hasn't expressed a preference — stable without going stale.",
    human: "One card for the whole day. A shared constraint to carry with you.",
  },
  weekly: {
    short: "Shared per week",
    agent: "Same card for the ISO week. Use for longer creative arcs — a sprint, a writing week.",
    human: "A card for the week. Let it sit with you.",
  },
  monthly: {
    short: "Shared per month",
    agent: "Same card for the calendar month. Use for themes or slow reflection.",
    human: "One card per month. A long conversation with a single prompt.",
  },
};

export const MODE_NAMES = Object.keys(MODES);

import { strategies } from "./strategies.ts";
import { seededIndex, timeSeed } from "./seed.ts";

const MODES = ["original", "deterministic", "hourly", "daily", "weekly", "monthly"] as const;
type Mode = typeof MODES[number];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

export function handleApi(path: string, url: URL): Response | null {
  if (path === "/api/strategies") {
    return json({ count: strategies.length, strategies });
  }

  if (path === "/api/random") {
    const mode = (url.searchParams.get("mode") || "original") as Mode;
    if (!MODES.includes(mode)) {
      return json({ error: "Invalid mode", modes: MODES }, 400);
    }
    const userSeed = url.searchParams.get("seed") || "";
    let seed: string;
    if (mode === "original") {
      seed = crypto.randomUUID();
    } else if (mode === "deterministic") {
      seed = userSeed || "default";
    } else {
      seed = userSeed + timeSeed(mode);
    }
    const idx = seededIndex(seed, strategies.length);
    return json({ mode, seed, strategy: strategies[idx], index: idx });
  }

  if (path === "/api/modes") {
    return json({ modes: MODES });
  }

  return null;
}

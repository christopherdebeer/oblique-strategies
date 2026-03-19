import { handleApi } from "./api.ts";
import { CLIENT_JS } from "./client-source.ts";
import { CSS } from "./css-source.ts";
import { skillDocument } from "./content-agent.ts";
import { humanAbout } from "./content-human.ts";

function html(debug: boolean) {
  const eruda = debug
    ? `<script src="https://cdn.jsdelivr.net/npm/eruda"><\/script>\n  <script>eruda.init();<\/script>\n  `
    : "";
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" id="meta-theme" content="#f8f8f2">
  <title>Oblique Strategies</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair:ital,opsz,wdth,wght@0,5..1200,87.5..112.5,300..900;1,5..1200,87.5..112.5,300..900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  ${eruda}<script src="/client.js"><\/script>
</body>
</html>`;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

function wantsHtml(req: Request): boolean {
  return (req.headers.get("accept") || "").includes("text/html");
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const origin = url.origin;
  const debug = url.searchParams.get("debug") === "true";

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,OPTIONS" },
    });
  }

  if (path === "/api/about") return json(humanAbout(origin));
  const apiRes = handleApi(path, url);
  if (apiRes) return apiRes;

  if (path === "/client.js") {
    return new Response(CLIENT_JS, {
      headers: { "Content-Type": "application/javascript" },
    });
  }
  if (path === "/styles.css") {
    return new Response(CSS, { headers: { "Content-Type": "text/css" } });
  }

  if (path === "/skill.md") {
    return new Response(skillDocument(origin), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"oblique-strategies-SKILL.md\"",
      },
    });
  }

  if (path === "/") {
    if (wantsHtml(req)) {
      return new Response(html(debug), { headers: { "Content-Type": "text/html" } });
    }
    return new Response(skillDocument(origin), {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  if (path === "/about") {
    if (wantsHtml(req)) {
      return new Response(html(debug), { headers: { "Content-Type": "text/html" } });
    }
    return new Response(skillDocument(origin), {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  return new Response("Not found", { status: 404 });
}

export default handler;

// Local dev server
if (import.meta.main) {
  const port = 8000;
  console.log(`Starting server on http://localhost:${port}`);
  Deno.serve({ port }, handler);
}

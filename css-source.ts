export const CSS = `
body, html {
  height: 100%; margin: 0;
  font-family: 'Playfair', serif;
  background: #f8f8f2; color: #333;
}
body {
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  overflow: hidden;
}
body.about-active {
  justify-content: flex-start;
  overflow: auto;
}

/* --- Header: title + about --- */

header {
  position: fixed; top: 0;
  display: flex; align-items: baseline;
  justify-content: space-between;
  background-color: #f8f8f2;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  padding: max(12px, env(safe-area-inset-top)) 20px 12px;
  width: 100%; box-sizing: border-box;
  z-index: 1;
}
#title {
  font-size: 14px;
  font-style: italic;
  color: #999;
  letter-spacing: 0.02em;
}
header button {
  font-family: 'Playfair', serif;
  background: transparent; border: none;
  color: #999; padding: 0;
  cursor: pointer; font-size: 14px;
  font-style: italic;
  transition: color .3s;
}
header button:hover { color: #333; }
header button.active {
  color: #333;
  font-style: normal;
  text-decoration: underline;
}

/* --- Footer: modes (two rows) --- */

footer {
  position: fixed; bottom: 0;
  display: flex; flex-direction: column;
  align-items: center;
  background-color: #f8f8f2;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  padding: 8px 10px max(10px, env(safe-area-inset-bottom));
  width: 100%; box-sizing: border-box;
  z-index: 1; gap: 2px;
}
.mode-row {
  display: flex;
  justify-content: center;
  gap: .3em;
}
footer button {
  font-family: 'Playfair', serif;
  background: transparent; border: none;
  color: #333; padding: 4px 10px;
  cursor: pointer; transition: color .3s;
  font-style: italic; font-size: 15px;
}
footer button:hover { color: #777; }
footer button.active {
  font-style: normal; font-weight: bold;
  text-decoration: underline;
}

/* --- Seed row --- */

#seed-row {
  display: none; align-items: center;
  gap: .4em;
  position: fixed; bottom: 72px;
  font-size: 14px; z-index: 1;
}
#seed-row label { font-style: italic; color: #777; }
#seed-row input {
  font-family: 'Playfair', serif;
  border: none; border-bottom: 1px solid #ccc;
  background: transparent; padding: 2px 4px;
  font-size: 14px; width: 120px;
  outline: none; color: #333;
}
#seed-row input:focus { border-bottom-color: #333; }

/* --- Card + index --- */

#card-area {
  position: relative;
  max-width: 80%;
  display: flex; align-items: center; justify-content: center;
}

#card-index {
  position: absolute;
  top: 0; right: 0;
  font-size: 11px;
  color: #ccc;
  font-style: italic;
  letter-spacing: 0.03em;
  pointer-events: none;
}

#card {
  font-size: 42px;
  text-align: center;
  padding: 40px;
  cursor: crosshair;
  user-select: none;
  -webkit-user-select: none;
  font-style: italic;
}

#card-text {
  cursor: grab;
  display: inline-block;
}
#card-text:active {
  cursor: grabbing;
}

#card.fading {
  opacity: 0;
  transition: opacity .2s ease;
}
#card.visible {
  opacity: 1;
  transition: opacity .2s ease;
}

/* --- About --- */

#about {
  display: none; max-width: 600px;
  padding: 60px 20px 40px;
  font-size: 16px; line-height: 1.6;
  text-align: left;
}
#about h2 { font-size: 20px; margin: 1.4em 0 .4em; }
#about h3 { font-size: 17px; margin: 1.2em 0 .3em; }
#about p { margin: .4em 0; }
#about .subtitle { font-style: italic; color: #777; }
#about dl { margin: .4em 0; padding: 0; }
#about dt {
  font-weight: bold; font-style: italic;
  margin-top: .6em;
}
#about dd { margin: .1em 0 0 1.2em; }
#about pre {
  background: #eee; padding: 10px 12px;
  border-radius: 4px; overflow-x: auto;
  font-size: 13px; line-height: 1.5;
  font-family: monospace;
  white-space: pre-wrap; word-break: break-all;
}
#about code {
  background: #eee; padding: 1px 5px;
  border-radius: 3px; font-size: 13px;
  font-family: monospace;
}
#about pre code { background: none; padding: 0; }
#about .actions {
  display: flex; gap: .6em;
  flex-wrap: wrap; margin: .6em 0;
}
#about .actions a, #about .actions button {
  font-family: monospace; font-style: normal;
  font-size: 13px; padding: 5px 12px;
  background: #333; color: #f8f8f2;
  text-decoration: none; border-radius: 3px;
  border: none; cursor: pointer;
  transition: background .2s;
}
#about .actions a:hover, #about .actions button:hover {
  background: #555;
}
`.trim();

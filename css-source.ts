export const CSS = `
html, body {
  height: 100%; margin: 0;
  font-family: 'Playfair', serif;
  color: #333;
}
body {
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  overflow: hidden;
}
body.sculpt {
  touch-action: none;
  -webkit-user-select: none; user-select: none;
}
body.about-active {
  justify-content: flex-start;
  overflow: auto;
  touch-action: auto;
}

/* Gradient background layer */
#bg-layer {
  position: fixed; inset: 0; z-index: 0;
  background: #f8f8f2;
}

/* --- Header: title + about --- */

header {
  position: fixed; top: 0;
  display: flex; align-items: baseline;
  justify-content: space-between;
  background: transparent;
  padding: max(12px, env(safe-area-inset-top)) 20px 12px;
  width: 100%; box-sizing: border-box;
  z-index: 10;
}
#title {
  font-size: 14px;
  font-style: italic;
  color: #999;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: font-style .3s, color .3s;
}
#title.sculpt-active {
  font-style: normal;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
#sculpt-hint {
  position: fixed; top: 0; left: 0; right: 0;
  text-align: center;
  padding-top: calc(max(12px, env(safe-area-inset-top)) + 28px);
  font-size: 11px; font-style: italic;
  color: #bbb; z-index: 10;
  pointer-events: none;
  opacity: 1;
  transition: opacity 1s ease;
}
#sculpt-hint.hidden { opacity: 0; }

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
  background: transparent;
  padding: 8px 10px max(10px, env(safe-area-inset-bottom));
  width: 100%; box-sizing: border-box;
  z-index: 10; gap: 2px;
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
  font-size: 14px; z-index: 10;
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
  position: relative; z-index: 1;
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
  cursor: pointer;
  font-style: italic;
  max-width: calc(min(12em, 70vw));
  box-sizing: content-box;
}

/* In sculpt mode, card areas get sculpt cursors and block selection */
body.sculpt #card { cursor: crosshair; user-select: none; -webkit-user-select: none; }
body.sculpt #card-text { cursor: grab; }
body.sculpt #card-text:active { cursor: grabbing; }

#card-text {
  display: inline-block;
}

#card.fading {
  opacity: 0;
  transition: opacity .2s ease;
}
#card.visible {
  opacity: 1;
  transition: opacity .2s ease;
}

/* Breathing animation (first visit only) */
@keyframes breathe {
  0%, 100% { font-variation-settings: "wght" 400, "wdth" 100, "opsz" 48; }
  50% { font-variation-settings: "wght" 450, "wdth" 101, "opsz" 60; }
}
#card.breathing {
  animation: breathe 2.5s ease-in-out 1;
}

/* --- Floating handles (sculpt mode) --- */
.handle {
  position: fixed; z-index: 20;
  cursor: grab;
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px;
  transform: translate(-50%,-50%);
  touch-action: none;
  -webkit-user-select: none; user-select: none;
}
.handle:active, .handle.dragging { cursor: grabbing; }
.handle .glyph {
  font-family: 'Playfair', serif;
  line-height: 1;
  opacity: 0.28;
  transition: opacity .25s, transform .25s;
  pointer-events: none;
}
.handle:hover .glyph, .handle.dragging .glyph {
  opacity: 1; transform: scale(1.15);
}
.handle .tip {
  position: absolute; top: 100%; left: 50%;
  transform: translateX(-50%); margin-top: 6px;
  font-size: 8px; letter-spacing: 0.04em;
  font-family: monospace; text-align: center;
  opacity: 0; transition: opacity .2s;
  pointer-events: none; white-space: nowrap;
  line-height: 1.6;
}
.handle .tip .tip-label {
  font-style: italic; letter-spacing: 0.06em;
  font-family: 'Playfair', serif; font-size: 9px;
}
.handle .tip .tip-vals { opacity: 0.7; }
.handle:hover .tip { opacity: 0.5; }
.handle.dragging .tip { opacity: 0.7; }

/* --- About --- */

#about {
  display: none; max-width: 600px;
  padding: 60px 20px 40px;
  font-size: 16px; line-height: 1.6;
  text-align: left;
  position: relative; z-index: 2;
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
  background: rgba(0,0,0,.06); padding: 10px 12px;
  border-radius: 4px; overflow-x: auto;
  font-size: 13px; line-height: 1.5;
  font-family: monospace;
  white-space: pre-wrap; word-break: break-all;
}
#about code {
  background: rgba(0,0,0,.06); padding: 1px 5px;
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

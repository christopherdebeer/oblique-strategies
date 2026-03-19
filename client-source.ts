export const CLIENT_JS = `
var MODES = ["original", "deterministic", "hourly", "daily", "weekly", "monthly"];
var currentMode = "hourly";
var currentSeed = "";
var currentPage = "card";
var currentIndex = -1;

// --- Persistent font state ---
var font = { wght: 400, wdth: 100, opsz: 48, ls: 0.01, lh: 1.25 };

var LIM = {
  wght: [300, 900],
  wdth: [87.5, 112.5],
  opsz: [5, 1200],
  ls: [-0.1, 0.15],
  lh: [0.7, 2.2]
};

var STORAGE_KEY = "oblique-font";
var ENV_STORAGE_KEY = "oblique-env";

// Environment state (background HSL)
// Base: #f8f8f2 ≈ hsl(50, 33, 96)
var env = { hue: 50, sat: 33, lit: 96 };
var ENV_LIM = {
  hue: [0, 360],
  sat: [0, 100],
  lit: [5, 98]
};

function $(id) { return document.getElementById(id); }
function clamp(lo, v, hi) { return Math.max(lo, Math.min(hi, v)); }
function clampAxis(k, v) { return clamp(LIM[k][0], v, LIM[k][1]); }

// --- Font state persistence ---

function saveFont() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(font)); } catch(e) {}
}

function loadFontFromStorage() {
  try {
    var s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      var o = JSON.parse(s);
      if (o && typeof o.wght === "number") {
        font.wght = clampAxis("wght", o.wght);
        font.wdth = clampAxis("wdth", o.wdth);
        font.opsz = clampAxis("opsz", o.opsz);
        font.ls = clampAxis("ls", o.ls);
        font.lh = clampAxis("lh", o.lh);
      }
    }
  } catch(e) {}
}

function saveEnv() {
  try { localStorage.setItem(ENV_STORAGE_KEY, JSON.stringify(env)); } catch(e) {}
}

function loadEnvFromStorage() {
  try {
    var s = localStorage.getItem(ENV_STORAGE_KEY);
    if (s) {
      var o = JSON.parse(s);
      if (o && typeof o.hue === "number") {
        env.hue = clamp(ENV_LIM.hue[0], o.hue, ENV_LIM.hue[1]);
        env.sat = clamp(ENV_LIM.sat[0], o.sat, ENV_LIM.sat[1]);
        env.lit = clamp(ENV_LIM.lit[0], o.lit, ENV_LIM.lit[1]);
      }
    }
  } catch(e) {}
}

function applyEnv() {
  var bg = "hsl(" + env.hue.toFixed(0) + "," + env.sat.toFixed(0) + "%," + env.lit.toFixed(0) + "%)";
  document.documentElement.style.background = bg;
  document.body.style.background = bg;
  var fg = env.lit < 50 ? "hsl(" + env.hue.toFixed(0) + "," + Math.max(5, env.sat - 20).toFixed(0) + "%,90%)" : "#333";
  document.body.style.color = fg;
  // Fixed elements: opaque background-color for Safari 26 toolbar tinting
  var hdr = document.querySelector("header");
  var ftr = document.querySelector("footer");
  if (hdr) {
    hdr.style.backgroundColor = bg;
    var muted = env.lit < 50 ? "hsl(" + env.hue.toFixed(0) + "," + Math.max(5, env.sat - 20).toFixed(0) + "%,70%)" : "#999";
    hdr.querySelectorAll("button, #title").forEach(function(el) { el.style.color = muted; });
  }
  if (ftr) {
    ftr.style.backgroundColor = bg;
    ftr.querySelectorAll("button").forEach(function(btn) { btn.style.color = fg; });
  }
  // Chrome Android still uses theme-color meta
  var meta = document.getElementById("meta-theme");
  if (meta) meta.setAttribute("content", bg);
  // Card index muted color
  var idx = $("card-index");
  if (idx) idx.style.color = env.lit < 50 ? "hsl(" + env.hue.toFixed(0) + "," + Math.max(5, env.sat - 20).toFixed(0) + "%,40%)" : "#ccc";
}

function envToHash() {
  var parts = [];
  if (Math.abs(env.hue - 50) > 1) parts.push("hue=" + env.hue.toFixed(0));
  if (Math.abs(env.sat - 33) > 1) parts.push("sat=" + env.sat.toFixed(0));
  if (Math.abs(env.lit - 96) > 1) parts.push("lit=" + env.lit.toFixed(0));
  return parts;
}

function envFromHash(h) {
  if (h.hue) env.hue = clamp(ENV_LIM.hue[0], parseFloat(h.hue), ENV_LIM.hue[1]);
  if (h.sat) env.sat = clamp(ENV_LIM.sat[0], parseFloat(h.sat), ENV_LIM.sat[1]);
  if (h.lit) env.lit = clamp(ENV_LIM.lit[0], parseFloat(h.lit), ENV_LIM.lit[1]);
}

function fontToHash() {
  var parts = [];
  if (font.wght !== 400) parts.push("wght=" + font.wght.toFixed(0));
  if (font.wdth !== 100) parts.push("wdth=" + font.wdth.toFixed(1));
  if (font.opsz !== 48) parts.push("opsz=" + font.opsz.toFixed(0));
  if (Math.abs(font.ls - 0.01) > 0.002) parts.push("ls=" + font.ls.toFixed(4));
  if (Math.abs(font.lh - 1.25) > 0.01) parts.push("lh=" + font.lh.toFixed(3));
  return parts;
}

function fontFromHash(h) {
  if (h.wght) font.wght = clampAxis("wght", parseFloat(h.wght));
  if (h.wdth) font.wdth = clampAxis("wdth", parseFloat(h.wdth));
  if (h.opsz) font.opsz = clampAxis("opsz", parseFloat(h.opsz));
  if (h.ls) font.ls = clampAxis("ls", parseFloat(h.ls));
  if (h.lh) font.lh = clampAxis("lh", parseFloat(h.lh));
}

// --- Apply font to card element ---

function applyFont(el, wght, wdth, opsz, ls, lh) {
  el.style.fontVariationSettings =
    '"wght" ' + wght.toFixed(1) +
    ', "wdth" ' + wdth.toFixed(2) +
    ', "opsz" ' + opsz.toFixed(1);
  el.style.letterSpacing = ls.toFixed(4) + "em";
  el.style.lineHeight = lh.toFixed(3);
}

function applyCurrentFont() {
  var card = $("card");
  if (card) applyFont(card, font.wght, font.wdth, font.opsz, font.ls, font.lh);
}

// --- URL hash state ---

function readHash() {
  var h = location.hash.slice(1);
  if (!h) return {};
  var out = {};
  h.split("&").forEach(function(pair) {
    var parts = pair.split("=");
    out[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || "");
  });
  return out;
}

function writeHash() {
  var parts = [];
  if (currentPage === "about") {
    parts.push("about");
    parts = parts.concat(envToHash());
  } else {
    parts.push("mode=" + currentMode);
    if (currentSeed) parts.push("seed=" + encodeURIComponent(currentSeed));
    parts = parts.concat(fontToHash());
    parts = parts.concat(envToHash());
  }
  history.replaceState(null, "", "#" + parts.join("&"));
}

function applyHash() {
  var h = readHash();
  if ("about" in h) {
    envFromHash(h);
    currentPage = "about";
    showAboutView();
    return;
  }
  if (h.mode && MODES.indexOf(h.mode) !== -1) currentMode = h.mode;
  if (h.seed) currentSeed = h.seed;
  fontFromHash(h);
  envFromHash(h);
  currentPage = "card";
  showCardView();
  updateSeedInput();
  applyCurrentFont();
  applyEnv();
  draw();
}

// --- Init ---

function init() {
  loadFontFromStorage();
  loadEnvFromStorage();

  // Header
  var header = document.createElement("header");
  var title = document.createElement("span");
  title.id = "title";
  title.textContent = "Oblique Strategies";
  header.appendChild(title);

  var aboutBtn = document.createElement("button");
  aboutBtn.id = "btn-about";
  aboutBtn.textContent = "About";
  aboutBtn.onclick = function() {
    if (currentPage === "about") { currentPage = "card"; showCardView(); writeHash(); draw(); }
    else { currentPage = "about"; showAboutView(); writeHash(); }
  };
  header.appendChild(aboutBtn);
  document.body.appendChild(header);

  // Seed row
  var seedRow = document.createElement("div");
  seedRow.id = "seed-row";
  seedRow.innerHTML = '<label>seed:</label><input id="seed-input" type="text" placeholder="your name...">';
  document.body.appendChild(seedRow);

  $("seed-input").addEventListener("change", function() {
    currentSeed = this.value.trim();
    writeHash();
    draw();
  });

  // Card area
  var cardArea = document.createElement("div");
  cardArea.id = "card-area";

  var cardIndex = document.createElement("span");
  cardIndex.id = "card-index";
  cardArea.appendChild(cardIndex);

  var card = document.createElement("div");
  card.id = "card";
  var cardText = document.createElement("div");
  cardText.id = "card-text";
  cardText.textContent = "Click for an Oblique Strategy";
  card.appendChild(cardText);
  cardArea.appendChild(card);
  document.body.appendChild(cardArea);

  // Footer: two rows
  var footer = document.createElement("footer");

  var row1 = document.createElement("div");
  row1.className = "mode-row";
  ["hourly", "daily", "weekly", "monthly"].forEach(function(m) {
    var btn = document.createElement("button");
    btn.id = "btn-" + m;
    btn.textContent = m.charAt(0).toUpperCase() + m.slice(1);
    btn.onclick = function() { setMode(m); };
    row1.appendChild(btn);
  });
  footer.appendChild(row1);

  var row2 = document.createElement("div");
  row2.className = "mode-row";
  var btnOrig = document.createElement("button");
  btnOrig.id = "btn-original";
  btnOrig.textContent = "Random";
  btnOrig.onclick = function() { setMode("original"); };
  row2.appendChild(btnOrig);

  var btnDet = document.createElement("button");
  btnDet.id = "btn-deterministic";
  btnDet.textContent = "Deterministic";
  btnDet.onclick = function() { setMode("deterministic"); };
  row2.appendChild(btnDet);

  footer.appendChild(row2);
  document.body.appendChild(footer);

  // About
  var about = document.createElement("div");
  about.id = "about";
  document.body.appendChild(about);

  initCardTouch(card);
  initBackgroundTouch();
  loadAbout();
  applyHash();
}

// =============================================
// Multi-axis touch — cumulative, persistent
// Tap = draw. Drag = sculpt (no draw).
// =============================================

function initCardTouch(card) {
  var active = false;
  var sculpting = false;  // true only if drag started on #card-text
  var originX = 0, originY = 0;
  var prevX = 0, prevY = 0;
  var prevT = 0;
  var velX = 0, velY = 0;
  var startTime = 0;
  var maxDist = 0;

  var startFont = {};
  var startEnv = {};
  var textEl = $("card-text");

  var DRAG_RADIUS = 100;
  var TAP_DIST = 10;
  var TAP_TIME = 1000;

  function getXY(e) {
    if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  function hitText(e) {
    // Did the touch/click originate on (or inside) the text span?
    var target = e.target || (e.touches && e.touches[0] && document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY));
    return target === textEl || (textEl && textEl.contains(target));
  }

  function onStart(e) {
    if (currentPage !== "card") return;
    var p = getXY(e);
    originX = prevX = p.x;
    originY = prevY = p.y;
    prevT = startTime = Date.now();
    velX = velY = 0;
    maxDist = 0;
    active = true;
    sculpting = hitText(e);
    if (sculpting) {
      startFont = { wght: font.wght, wdth: font.wdth, opsz: font.opsz, ls: font.ls, lh: font.lh };
    } else {
      startEnv = { hue: env.hue, sat: env.sat, lit: env.lit };
    }
  }

  function onMove(e) {
    if (!active) return;
    var p = getXY(e);
    var now = Date.now();
    var dt = Math.max(1, now - prevT) / 1000;

    var instantVX = (p.x - prevX) / dt;
    var instantVY = (p.y - prevY) / dt;
    velX = velX * 0.7 + instantVX * 0.3;
    velY = velY * 0.7 + instantVY * 0.3;
    prevX = p.x; prevY = p.y; prevT = now;

    var rawDist = Math.sqrt((p.x - originX) * (p.x - originX) + (p.y - originY) * (p.y - originY));
    if (rawDist > maxDist) maxDist = rawDist;

    // Only sculpt if drag started on text
    if (!sculpting) {
      // Environment: drag on card padding — update env directly
      var edx = clamp(-1, (p.x - originX) / DRAG_RADIUS, 1);
      var edy = clamp(-1, (p.y - originY) / DRAG_RADIUS, 1);

      var liveHue = (startEnv.hue + edx * 180 + 360) % 360;
      var litRange = edy > 0 ? startEnv.lit - ENV_LIM.lit[0] : ENV_LIM.lit[1] - startEnv.lit;
      var liveLit = clamp(ENV_LIM.lit[0], startEnv.lit + edy * -litRange, ENV_LIM.lit[1]);
      var espeed = Math.sqrt(velX * velX + velY * velY);
      var satDamp = clamp(0, espeed / 500, 1);
      var liveSat = clamp(ENV_LIM.sat[0], startEnv.sat * (1 - satDamp * 0.8), ENV_LIM.sat[1]);

      env.hue = liveHue;
      env.sat = liveSat;
      env.lit = liveLit;
      applyLiveEnv(liveHue, liveSat, liveLit);
      return;
    }

    var dx = clamp(-1, (p.x - originX) / DRAG_RADIUS, 1);
    var dy = clamp(-1, (p.y - originY) / DRAG_RADIUS, 1);

    var speed = Math.sqrt(velX * velX + velY * velY);
    var dist = Math.sqrt(dx * dx + dy * dy);

    var wghtRange = dy > 0 ? LIM.wght[1] - startFont.wght : startFont.wght - LIM.wght[0];
    var liveWght = clampAxis("wght", startFont.wght + dy * wghtRange);

    var wdthRange = dx > 0 ? LIM.wdth[1] - startFont.wdth : startFont.wdth - LIM.wdth[0];
    var liveWdth = clampAxis("wdth", startFont.wdth + dx * wdthRange);

    var speedFactor = clamp(0, speed / 600, 1);
    var opszDelta = (speedFactor + dist * 0.4) * (dy > 0 ? -1 : 1);
    var opszRange = opszDelta < 0 ? startFont.opsz - LIM.opsz[0] : LIM.opsz[1] - startFont.opsz;
    var liveOpsz = clampAxis("opsz", startFont.opsz + opszDelta * opszRange);

    var lsRange = dx > 0 ? LIM.ls[1] - startFont.ls : startFont.ls - LIM.ls[0];
    var liveLS = clampAxis("ls", startFont.ls + dx * lsRange);

    var lhRange = dy > 0 ? startFont.lh - LIM.lh[0] : LIM.lh[1] - startFont.lh;
    var liveLH = clampAxis("lh", startFont.lh + dy * -lhRange);

    applyFont(card, liveWght, liveWdth, liveOpsz, liveLS, liveLH);
  }

  function onEnd(e) {
    if (!active) return;
    active = false;

    var elapsed = Date.now() - startTime;
    var wasTap = maxDist < TAP_DIST && elapsed < TAP_TIME;

    if (wasTap) {
      applyCurrentFont();
      draw();
    } else if (sculpting) {
      // Drag on text — commit font state
      commitFontFromCard(card);
      saveFont();
      writeHash();
    } else if (!sculpting && maxDist >= TAP_DIST) {
      // Drag on card padding — env already updated during move
      saveEnv();
      writeHash();
    }
    sculpting = false;
  }

  function onCancel() {
    if (!active) return;
    active = false;
    if (sculpting) {
      applyCurrentFont();
    } else {
      env.hue = startEnv.hue; env.sat = startEnv.sat; env.lit = startEnv.lit;
      applyEnv();
    }
    sculpting = false;
  }

  // Touch
  card.addEventListener("touchstart", function(e) { e.preventDefault(); onStart(e); }, { passive: false });
  card.addEventListener("touchmove", function(e) { e.preventDefault(); onMove(e); }, { passive: false });
  card.addEventListener("touchend", function(e) { e.preventDefault(); onEnd(e); });
  card.addEventListener("touchcancel", onCancel);

  // Mouse
  card.addEventListener("mousedown", function(e) { e.preventDefault(); onStart(e); });
  document.addEventListener("mousemove", function(e) { if (active) onMove(e); });
  document.addEventListener("mouseup", function(e) { if (active) onEnd(e); });
}

function commitFontFromCard(card) {
  var s = card.style;
  var fvs = s.fontVariationSettings;
  if (fvs) {
    var m;
    m = fvs.match(/"wght"\\s+([\\d.]+)/); if (m) font.wght = clampAxis("wght", parseFloat(m[1]));
    m = fvs.match(/"wdth"\\s+([\\d.]+)/); if (m) font.wdth = clampAxis("wdth", parseFloat(m[1]));
    m = fvs.match(/"opsz"\\s+([\\d.]+)/); if (m) font.opsz = clampAxis("opsz", parseFloat(m[1]));
  }
  if (s.letterSpacing) font.ls = clampAxis("ls", parseFloat(s.letterSpacing));
  if (s.lineHeight) font.lh = clampAxis("lh", parseFloat(s.lineHeight));
}

// =============================================
// Background env touch — outside card area
// =============================================

function initBackgroundTouch() {
  var active = false;
  var originX = 0, originY = 0;
  var prevX = 0, prevY = 0;
  var prevT = 0;
  var velX = 0, velY = 0;
  var maxDist = 0;
  var startEnv = {};

  var DRAG_RADIUS = 100;

  function isBackground(e) {
    var t = e.target;
    // Only activate on body, html, or elements that aren't interactive
    if (t.closest && (t.closest("#card") || t.closest("#card-area") || t.closest("header") || t.closest("footer") || t.closest("#seed-row") || t.closest("#about"))) return false;
    return true;
  }

  function getXY(e) {
    if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  function onStart(e) {
    if (!isBackground(e)) return;
    var p = getXY(e);
    originX = prevX = p.x;
    originY = prevY = p.y;
    prevT = Date.now();
    velX = velY = 0;
    maxDist = 0;
    active = true;
    startEnv = { hue: env.hue, sat: env.sat, lit: env.lit };
  }

  function onMove(e) {
    if (!active) return;
    var p = getXY(e);
    var now = Date.now();
    var dt = Math.max(1, now - prevT) / 1000;

    var instantVX = (p.x - prevX) / dt;
    var instantVY = (p.y - prevY) / dt;
    velX = velX * 0.7 + instantVX * 0.3;
    velY = velY * 0.7 + instantVY * 0.3;
    prevX = p.x; prevY = p.y; prevT = now;

    var rawDist = Math.sqrt((p.x - originX) * (p.x - originX) + (p.y - originY) * (p.y - originY));
    if (rawDist > maxDist) maxDist = rawDist;

    var edx = clamp(-1, (p.x - originX) / DRAG_RADIUS, 1);
    var edy = clamp(-1, (p.y - originY) / DRAG_RADIUS, 1);

    var liveHue = (startEnv.hue + edx * 180 + 360) % 360;
    var litRange = edy > 0 ? startEnv.lit - ENV_LIM.lit[0] : ENV_LIM.lit[1] - startEnv.lit;
    var liveLit = clamp(ENV_LIM.lit[0], startEnv.lit + edy * -litRange, ENV_LIM.lit[1]);
    var espeed = Math.sqrt(velX * velX + velY * velY);
    var satDamp = clamp(0, espeed / 500, 1);
    var liveSat = clamp(ENV_LIM.sat[0], startEnv.sat * (1 - satDamp * 0.8), ENV_LIM.sat[1]);

    env.hue = liveHue;
    env.sat = liveSat;
    env.lit = liveLit;
    applyLiveEnv(liveHue, liveSat, liveLit);
  }

  function onEnd() {
    if (!active) return;
    active = false;
    if (maxDist >= 10) {
      // env already updated during move
      saveEnv();
      writeHash();
    }
  }

  function onCancel() {
    if (!active) return;
    active = false;
    env.hue = startEnv.hue; env.sat = startEnv.sat; env.lit = startEnv.lit;
    applyEnv();
  }

  document.addEventListener("touchstart", function(e) { if (isBackground(e)) { e.preventDefault(); onStart(e); } }, { passive: false });
  document.addEventListener("touchmove", function(e) { if (active) { e.preventDefault(); onMove(e); } }, { passive: false });
  document.addEventListener("touchend", function(e) { if (active) onEnd(); });
  document.addEventListener("touchcancel", onCancel);

  document.addEventListener("mousedown", function(e) { onStart(e); });
  document.addEventListener("mousemove", function(e) { if (active) onMove(e); });
  document.addEventListener("mouseup", function(e) { if (active) onEnd(); });
}

// Shared: apply live env values during drag (used by both card-padding and background)
function applyLiveEnv(h, s, l) {
  var bg = "hsl(" + h.toFixed(0) + "," + s.toFixed(0) + "%," + l.toFixed(0) + "%)";
  document.documentElement.style.background = bg;
  document.body.style.background = bg;
  var fg = l < 50 ? "hsl(" + h.toFixed(0) + "," + Math.max(5, s - 20).toFixed(0) + "%,90%)" : "#333";
  document.body.style.color = fg;
  var hdr = document.querySelector("header");
  var ftr = document.querySelector("footer");
  if (hdr) {
    hdr.style.backgroundColor = bg;
    var muted = l < 50 ? "hsl(" + h.toFixed(0) + "," + Math.max(5, s - 20).toFixed(0) + "%,70%)" : "#999";
    hdr.querySelectorAll("button, #title").forEach(function(el) { el.style.color = muted; });
  }
  if (ftr) {
    ftr.style.backgroundColor = bg;
    ftr.querySelectorAll("button").forEach(function(btn) { btn.style.color = fg; });
  }
  var meta = document.getElementById("meta-theme");
  if (meta) meta.setAttribute("content", bg);
}

// --- Views ---

function showCardView() {
  currentPage = "card";
  document.body.classList.remove("about-active");
  $("card-area").style.display = "";
  $("seed-row").style.display = currentMode === "deterministic" ? "flex" : "none";
  $("about").style.display = "none";
  document.querySelector("footer").style.display = "";
  updateButtons();
  applyCurrentFont();
  applyEnv();
}

function showAboutView() {
  currentPage = "about";
  document.body.classList.add("about-active");
  $("card-area").style.display = "none";
  $("seed-row").style.display = "none";
  $("about").style.display = "block";
  document.querySelector("footer").style.display = "none";
  window.scrollTo(0, 0);
  updateButtons();
  applyEnv();
}

function updateButtons() {
  MODES.forEach(function(m) {
    var btn = $("btn-" + m);
    if (btn) btn.className = (m === currentMode && currentPage === "card") ? "active" : "";
  });
  var ab = $("btn-about");
  if (ab) ab.className = currentPage === "about" ? "active" : "";
}

function updateSeedInput() {
  var inp = $("seed-input");
  if (inp) inp.value = currentSeed;
}

function setMode(mode) {
  currentMode = mode;
  currentPage = "card";
  showCardView();
  writeHash();
  draw();
}

// --- Draw ---

var drawing = false;

function draw() {
  if (currentPage === "about" || drawing) return;
  drawing = true;

  var card = $("card");
  card.classList.remove("visible");
  card.classList.add("fading");

  var url = "/api/random?mode=" + currentMode;
  if (currentSeed) url += "&seed=" + encodeURIComponent(currentSeed);

  fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      currentIndex = data.index;
      setTimeout(function() {
        $("card-text").textContent = data.strategy;
        $("card-index").textContent = "#" + (data.index + 1);
        applyCurrentFont();
        card.classList.remove("fading");
        card.classList.add("visible");
        drawing = false;
      }, 220);
    })
    .catch(function() {
      setTimeout(function() {
        $("card-text").textContent = "Error fetching strategy";
        $("card-index").textContent = "";
        applyCurrentFont();
        card.classList.remove("fading");
        card.classList.add("visible");
        drawing = false;
      }, 220);
    });
}

// --- About ---

function esc(s) {
  var d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function loadAbout() {
  fetch("/api/about")
    .then(function(r) { return r.json(); })
    .then(function(a) {
      var h = "<h2>" + esc(a.title) + "</h2>";
      h += "<p class='subtitle'>" + esc(a.subtitle) + " \\u2014 " + esc(a.attribution) + "</p>";
      a.description.forEach(function(d) { h += "<p>" + esc(d) + "</p>"; });

      h += "<h2>Modes</h2><dl>";
      Object.keys(a.modes).forEach(function(k) {
        h += "<dt>" + esc(k) + "</dt><dd>" + esc(a.modes[k]) + "</dd>";
      });
      h += "</dl>";

      var d = a.dev;
      h += "<h2>For Developers &amp; Agents</h2>";
      h += "<p>" + esc(d.intro) + "</p>";

      h += "<h3>Endpoints</h3>";
      d.endpoints.forEach(function(e) {
        h += "<p><code>" + esc(e.method) + " " + esc(e.path) + "</code> \\u2014 " + esc(e.desc) + "</p>";
      });

      h += "<h3>Examples</h3>";
      d.examples.forEach(function(e) {
        h += "<pre><code>" + esc(e) + "</code></pre>";
      });

      h += "<h3>Use as a Skill</h3>";
      h += "<p>Point any agent at the root URL with a plain <code>Accept</code> header to get a machine-readable skill document:</p>";
      h += "<pre><code>curl " + esc(d.origin) + "</code></pre>";
      h += "<p>Or download the skill document directly:</p>";
      h += "<div class='actions'>";
      h += "<a href='/skill.md'>Download SKILL.md</a>";
      h += "<button onclick='copySkillUrl()'>Copy skill URL</button>";
      h += "</div>";

      $("about").innerHTML = h;
    })
    .catch(function(e) { console.error("loadAbout failed:", e); });
}

function copySkillUrl() {
  navigator.clipboard.writeText(location.origin + "/skill.md").then(function() {
    var btn = document.querySelector(".actions button");
    if (btn) { var orig = btn.textContent; btn.textContent = "Copied!"; setTimeout(function() { btn.textContent = orig; }, 1500); }
  });
}
window.copySkillUrl = copySkillUrl;

window.addEventListener("hashchange", applyHash);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
`;

export const CLIENT_JS = `
var MODES = ["original", "deterministic", "hourly", "daily", "weekly", "monthly"];
var currentMode = "hourly";
var currentSeed = "";
var currentPage = "card";
var currentIndex = -1;
var sculptMode = false;

// --- Typography state ---
var font = { wght: 400, wdth: 100, opsz: 48, fsz: 42, ls: 0.01, lh: 1.25 };
var LIM = { wght: [300,900], wdth: [87.5,112.5], opsz: [5,1200], fsz: [16,120], ls: [-0.2,0.15], lh: [0.7,2.2] };

// --- Environment state (gradient) ---
var env = { hue: 50, sat: 33, lit: 96, gAng: 135, gSpread: 80, gOffset: 50 };
var ELIM = { hue: [0,360], sat: [0,100], lit: [5,98], gAng: [0,360], gSpread: [0,200], gOffset: [10,90] };

var FONT_KEY = "oblique-font";
var ENV_KEY = "oblique-env";
var SEEN_KEY = "oblique-seen";

function $(id) { return document.getElementById(id); }
function clamp(lo, v, hi) { return Math.max(lo, Math.min(hi, v)); }
function cl(k, v) { return clamp(LIM[k][0], v, LIM[k][1]); }
function ce(k, v) { return clamp(ELIM[k][0], v, ELIM[k][1]); }

// --- Persistence ---
function saveFont() { try { localStorage.setItem(FONT_KEY, JSON.stringify(font)); } catch(e) {} }
function saveEnv() { try { localStorage.setItem(ENV_KEY, JSON.stringify(env)); } catch(e) {} }
function loadFont() {
  try {
    var o = JSON.parse(localStorage.getItem(FONT_KEY));
    if (o && typeof o.wght === "number") {
      font.wght=cl("wght",o.wght); font.wdth=cl("wdth",o.wdth); font.opsz=cl("opsz",o.opsz);
      font.ls=cl("ls",o.ls); font.lh=cl("lh",o.lh);
      if (o.fsz) font.fsz=cl("fsz",o.fsz);
    }
  } catch(e) {}
}
function loadEnv() {
  try {
    var o = JSON.parse(localStorage.getItem(ENV_KEY));
    if (o && typeof o.hue === "number") {
      env.hue=ce("hue",o.hue); env.sat=ce("sat",o.sat); env.lit=ce("lit",o.lit);
      if (o.gAng!==undefined) env.gAng=ce("gAng",o.gAng);
      if (o.gSpread!==undefined) env.gSpread=ce("gSpread",o.gSpread);
      if (o.gOffset!==undefined) env.gOffset=ce("gOffset",o.gOffset);
    }
  } catch(e) {}
}
function isFirstVisit() {
  try { return !localStorage.getItem(SEEN_KEY); } catch(e) { return true; }
}
function markSeen() {
  try { localStorage.setItem(SEEN_KEY, "1"); } catch(e) {}
}

// --- Hash ---
function fontToHash() {
  var p = [];
  if (font.wght !== 400) p.push("wght=" + font.wght.toFixed(0));
  if (font.wdth !== 100) p.push("wdth=" + font.wdth.toFixed(1));
  if (font.opsz !== 48) p.push("opsz=" + font.opsz.toFixed(0));
  if (font.fsz !== 42) p.push("fsz=" + font.fsz.toFixed(0));
  if (Math.abs(font.ls - 0.01) > 0.002) p.push("ls=" + font.ls.toFixed(4));
  if (Math.abs(font.lh - 1.25) > 0.01) p.push("lh=" + font.lh.toFixed(3));
  return p;
}
function envToHash() {
  var p = [];
  if (Math.abs(env.hue-50)>1) p.push("hue="+env.hue.toFixed(0));
  if (Math.abs(env.sat-33)>1) p.push("sat="+env.sat.toFixed(0));
  if (Math.abs(env.lit-96)>1) p.push("lit="+env.lit.toFixed(0));
  if (Math.abs(env.gAng-135)>1) p.push("gAng="+env.gAng.toFixed(0));
  if (Math.abs(env.gSpread-80)>1) p.push("gSpr="+env.gSpread.toFixed(0));
  if (Math.abs(env.gOffset-50)>1) p.push("gOff="+env.gOffset.toFixed(0));
  return p;
}
function fontFromHash(h) {
  if(h.wght) font.wght=cl("wght",+h.wght); if(h.wdth) font.wdth=cl("wdth",+h.wdth);
  if(h.opsz) font.opsz=cl("opsz",+h.opsz); if(h.fsz) font.fsz=cl("fsz",+h.fsz);
  if(h.ls) font.ls=cl("ls",+h.ls); if(h.lh) font.lh=cl("lh",+h.lh);
}
function envFromHash(h) {
  if(h.hue) env.hue=ce("hue",+h.hue); if(h.sat) env.sat=ce("sat",+h.sat);
  if(h.lit) env.lit=ce("lit",+h.lit); if(h.gAng) env.gAng=ce("gAng",+h.gAng);
  if(h.gSpr) env.gSpread=ce("gSpread",+h.gSpr); if(h.gOff) env.gOffset=ce("gOffset",+h.gOff);
}

// --- Apply typography ---
function applyFont() {
  var r = document.documentElement.style;
  r.setProperty("--font-variation", '"wght" '+font.wght.toFixed(1)+',"wdth" '+font.wdth.toFixed(2)+',"opsz" '+font.opsz.toFixed(1));
  r.setProperty("--fsz", font.fsz.toFixed(1)+"px");
  r.setProperty("--ls", font.ls.toFixed(4)+"em");
  r.setProperty("--lh", font.lh.toFixed(3));
  positionHandles();
}

// --- Apply environment (radial gradient) ---
function applyEnv() {
  var h=env.hue, s=env.sat, l=env.lit;
  var ang=env.gAng, spr=env.gSpread, off=env.gOffset;

  var c1 = "hsl("+h.toFixed(0)+","+s.toFixed(0)+"%,"+l.toFixed(0)+"%)";
  var h2 = (h+30)%360;
  var c2 = "hsl("+h2.toFixed(0)+","+Math.max(0,s-10).toFixed(0)+"%,"+clamp(5,l-8,98).toFixed(0)+"%)";
  var h3 = (h+210)%360;
  var c3 = "hsl("+h3.toFixed(0)+","+Math.max(0,s*0.4).toFixed(0)+"%,"+clamp(5,l+4,98).toFixed(0)+"%)";

  var rad = ang*Math.PI/180;
  var cx = 50+Math.cos(rad)*(off-50)*0.6;
  var cy = 50+Math.sin(rad)*(off-50)*0.6;

  // Bloom alpha fades with spread so the gradient dissolves smoothly to flat
  // rather than collapsing to a sharp dot. Hits full opacity at spr >= 100.
  // --c2/--c3 CSS vars stay opaque (used for handle palette etc).
  var ga = Math.min(1, spr / 100).toFixed(3);
  var c2a = "hsla("+h2.toFixed(0)+","+Math.max(0,s-10).toFixed(0)+"%,"+clamp(5,l-8,98).toFixed(0)+"%,"+ga+")";
  var c3a = "hsla("+h3.toFixed(0)+","+Math.max(0,s*0.4).toFixed(0)+"%,"+clamp(5,l+4,98).toFixed(0)+"%,"+ga+")";

  var bg = spr < 1 ? c1 :
    "radial-gradient(ellipse "+spr.toFixed(0)+"% "+(spr*0.8).toFixed(0)+"% at "+cx.toFixed(0)+"% "+cy.toFixed(0)+"%, "+c2a+" 0%, transparent 70%),"+
    "radial-gradient(ellipse "+(spr*1.4).toFixed(0)+"% "+(spr*1.2).toFixed(0)+"% at "+(100-cx).toFixed(0)+"% "+(100-cy).toFixed(0)+"%, "+c3a+" 0%, transparent 60%),"+
    c1;

  // Adaptive text color
  var light = l < 45;
  var fg = light ? "hsl("+h.toFixed(0)+","+Math.max(5,s-15).toFixed(0)+"%,88%)" : "#2c2a26";
  var muted = light ? "hsl("+h.toFixed(0)+","+Math.max(5,s-15).toFixed(0)+"%,55%)" : "#999";

  var r = document.documentElement.style;
  r.setProperty("--c1", c1);
  r.setProperty("--c2", c2);
  r.setProperty("--c3", c3);
  r.setProperty("--bg", bg);
  r.setProperty("--fg", fg);
  r.setProperty("--muted", muted);
  r.setProperty("--handle-blend", "color-burn");

  var meta = document.getElementById("meta-theme");
  if (meta) meta.setAttribute("content", c1);
  positionHandles();
}

// --- Hash read/write ---
function readHash() {
  var h = location.hash.slice(1); if (!h) return {};
  var out = {};
  h.split("&").forEach(function(p) { var kv=p.split("="); out[decodeURIComponent(kv[0])]=decodeURIComponent(kv[1]||""); });
  return out;
}
function writeHash() {
  var p = [];
  if (currentPage==="about") { p.push("about"); }
  else { p.push("mode="+currentMode); if(currentSeed) p.push("seed="+encodeURIComponent(currentSeed)); p=p.concat(fontToHash()); }
  p = p.concat(envToHash());
  history.replaceState(null,"","#"+p.join("&"));
}
function applyHash() {
  var h = readHash();
  envFromHash(h);
  if ("about" in h) { currentPage="about"; showAboutView(); return; }
  if (h.mode && MODES.indexOf(h.mode)!==-1) currentMode=h.mode;
  if (h.seed) currentSeed=h.seed;
  fontFromHash(h);
  currentPage="card"; showCardView();
  if ($("seed-input")) $("seed-input").value = currentSeed;
  applyFont(); applyEnv(); draw();
}

// --- Sculpt mode ---
function setSculpt(on) {
  sculptMode = on;
  var titleEl = $("title");
  if (on) {
    document.body.classList.add("sculpt");
    if (titleEl) titleEl.classList.add("sculpt-active");
  } else {
    document.body.classList.remove("sculpt");
    if (titleEl) titleEl.classList.remove("sculpt-active");
  }
}

// --- Breathing animation (first visit) ---
// Keyframes are generated from the live font state so the animation breathes
// around whatever values applyHash() landed on, with no jump at start or end.
function startBreathe(card) {
  var w0 = font.wght, d0 = font.wdth, o0 = font.opsz;
  var w1 = cl("wght", w0 + 50);
  var d1 = cl("wdth", d0 + 1);
  var o1 = cl("opsz", o0 + 12);
  var kf = '@keyframes breathe{' +
    '0%,100%{font-variation-settings:"wght" '+w0.toFixed(1)+',"wdth" '+d0.toFixed(2)+',"opsz" '+o0.toFixed(1)+'}' +
    '50%{font-variation-settings:"wght" '+w1.toFixed(1)+',"wdth" '+d1.toFixed(2)+',"opsz" '+o1.toFixed(1)+'}' +
  '}';
  var s = document.getElementById("breathe-kf") || document.createElement("style");
  s.id = "breathe-kf"; s.textContent = kf;
  document.head.appendChild(s);
  card.classList.add("breathing");
}

// --- Init ---
function init() {
  loadFont(); loadEnv();

  // BG layer
  var bgLayer = document.createElement("div");
  bgLayer.id = "bg-layer";
  document.body.insertBefore(bgLayer, document.body.firstChild);

  // Header
  var header = document.createElement("header");
  var title = document.createElement("span");
  title.id = "title"; title.textContent = "Oblique Strategies";
  title.onclick = function() {
    setSculpt(!sculptMode);
    // Dismiss hint on first sculpt
    var hint = $("sculpt-hint");
    if (hint) { hint.classList.add("hidden"); markSeen(); }
  };
  header.appendChild(title);

  var aboutBtn = document.createElement("button");
  aboutBtn.id = "btn-about"; aboutBtn.textContent = "About";
  aboutBtn.onclick = function() {
    if (currentPage==="about") { currentPage="card"; showCardView(); writeHash(); draw(); }
    else { currentPage="about"; showAboutView(); writeHash(); }
  };
  header.appendChild(aboutBtn);
  document.body.appendChild(header);

  // Sculpt hint (first visit only)
  if (isFirstVisit()) {
    var hint = document.createElement("div");
    hint.id = "sculpt-hint";
    hint.textContent = "tap title to sculpt";
    document.body.appendChild(hint);
    setTimeout(function() { hint.classList.add("hidden"); }, 5000);
  }

  // Seed row
  var seedRow = document.createElement("div"); seedRow.id = "seed-row";
  seedRow.innerHTML = '<label>seed:</label><input id="seed-input" type="text" placeholder="your name...">';
  document.body.appendChild(seedRow);
  $("seed-input").addEventListener("change", function() { currentSeed=this.value.trim(); writeHash(); draw(); });

  // Card area
  var cardArea = document.createElement("div"); cardArea.id = "card-area";
  var cardIndex = document.createElement("span"); cardIndex.id = "card-index";
  cardArea.appendChild(cardIndex);
  var card = document.createElement("div"); card.id = "card";
  var cardText = document.createElement("div"); cardText.id = "card-text";
  cardText.textContent = "Click for an Oblique Strategy";
  card.appendChild(cardText); cardArea.appendChild(card);
  document.body.appendChild(cardArea);

  // Footer
  var footer = document.createElement("footer");
  var row1 = document.createElement("div"); row1.className = "mode-row";
  ["hourly","daily","weekly","monthly"].forEach(function(m) {
    var b=document.createElement("button"); b.id="btn-"+m;
    b.textContent=m.charAt(0).toUpperCase()+m.slice(1); b.onclick=function(){setMode(m);};
    row1.appendChild(b);
  });
  footer.appendChild(row1);
  var row2 = document.createElement("div"); row2.className = "mode-row";
  var bO=document.createElement("button"); bO.id="btn-original"; bO.textContent="Random"; bO.onclick=function(){setMode("original");};
  var bD=document.createElement("button"); bD.id="btn-deterministic"; bD.textContent="Deterministic"; bD.onclick=function(){setMode("deterministic");};
  row2.appendChild(bO); row2.appendChild(bD);
  footer.appendChild(row2); document.body.appendChild(footer);

  var about = document.createElement("div"); about.id = "about";
  document.body.appendChild(about);

  initTouch(card);
  initHandles();
  loadAbout(); applyHash();

  // First-visit breathing animation
  if (isFirstVisit()) {
    setTimeout(function() { startBreathe(card); }, 800);
    setTimeout(function() { card.classList.remove("breathing"); }, 3500);
  }
}

// =============================================
// Multitouch — zone-locked, sculpt-mode-gated
// =============================================

function initTouch(card) {
  var touches = {};
  var zone = "idle";
  var startFont = {}, startEnv = {};
  var tapTimer = 0, maxDist = 0;
  var textEl = $("card-text");
  var DR = 120;
  var TAP_DIST = 10, TAP_TIME = 1000;

  function hitText(e) {
    var t = e.target;
    if (e.touches && e.touches[0]) t = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    return t === textEl || (textEl && textEl.contains(t));
  }

  function twoGeo() {
    var ids = Object.keys(touches); if (ids.length<2) return null;
    var a=touches[ids[0]], b=touches[ids[1]];
    var dx=b.cx-a.cx, dy=b.cy-a.cy, sdx=b.sx-a.sx, sdy=b.sy-a.sy;
    return {
      dist: Math.sqrt(dx*dx+dy*dy), angle: Math.atan2(dy,dx),
      sdist: Math.sqrt(sdx*sdx+sdy*sdy), sangle: Math.atan2(sdy,sdx),
      cy: (a.cy+b.cy)/2, scy: (a.sy+b.sy)/2
    };
  }

  function avgSpread() {
    var ids=Object.keys(touches), sp=0;
    for (var i=0;i<ids.length;i++) { var t=touches[ids[i]]; sp+=Math.sqrt((t.cx-t.sx)*(t.cx-t.sx)+(t.cy-t.sy)*(t.cy-t.sy)); }
    return clamp(0, sp/ids.length/100, 1);
  }

  function onStart(e) {
    if (currentPage !== "card") return;
    var first = Object.keys(touches).length === 0;
    if (first) {
      if (sculptMode) {
        e.preventDefault();
        zone = hitText(e) ? "text" : "env";
      } else {
        zone = "tap-only";
      }
      startFont = JSON.parse(JSON.stringify(font));
      startEnv = JSON.parse(JSON.stringify(env));
      tapTimer = Date.now(); maxDist = 0;
    }
    for (var i=0;i<e.changedTouches.length;i++) {
      var t=e.changedTouches[i];
      touches[t.identifier]={sx:t.clientX,sy:t.clientY,cx:t.clientX,cy:t.clientY};
    }
  }

  function onMove(e) {
    for (var i=0;i<e.changedTouches.length;i++) {
      var t=e.changedTouches[i];
      if(touches[t.identifier]) { touches[t.identifier].cx=t.clientX; touches[t.identifier].cy=t.clientY; }
    }
    var ids=Object.keys(touches);
    if(ids.length>0) {
      var f=touches[ids[0]];
      var d=Math.sqrt((f.cx-f.sx)*(f.cx-f.sx)+(f.cy-f.sy)*(f.cy-f.sy));
      if(d>maxDist) maxDist=d;
    }
    // Only sculpt in sculpt mode
    if (zone === "tap-only") return;
    e.preventDefault();
    var n = ids.length;
    if (zone === "text") sculptText(n);
    else if (zone === "env") sculptEnv(n);
  }

  // --- TEXT: 1f=lh+wdth+ls, 2f=pinch:size rotate:opsz parallel-drag:wght, 3f=spread:ls ---
  function sculptText(n) {
    var ids=Object.keys(touches);
    if(n===1) {
      var f=touches[ids[0]];
      var dx=clamp(-1,(f.cx-f.sx)/DR,1), dy=clamp(-1,(f.cy-f.sy)/DR,1);
      // Vertical → line-height
      font.lh=cl("lh",startFont.lh-dy*(dy>0?startFont.lh-0.7:2.2-startFont.lh));
      // Horizontal → width + letter-spacing (both, so horizontal drag is visible)
      font.wdth=cl("wdth",startFont.wdth+dx*(dx>0?112.5-startFont.wdth:startFont.wdth-87.5));
      font.ls=cl("ls",startFont.ls+dx*(dx>0?0.15-startFont.ls:startFont.ls-(-0.2)));
    } else if(n===2) {
      var g=twoGeo(); if(!g) return;
      var scale=g.dist/Math.max(1,g.sdist);
      font.fsz=cl("fsz",startFont.fsz*scale);
      // Rotate → opsz (multiplicative for log-scale feel: 30° = 2x)
      var aDelta=(g.angle-g.sangle)*180/Math.PI;
      font.opsz=cl("opsz",startFont.opsz*Math.pow(2,-aDelta/30));
      var mdy=clamp(-1,(g.cy-g.scy)/120,1);
      font.wght=cl("wght",startFont.wght+mdy*(mdy>0?900-startFont.wght:startFont.wght-300));
    } else if(n>=3) {
      var sp=avgSpread();
      font.ls=cl("ls",startFont.ls+sp*0.2);
    }
    applyFont();
  }

  function sculptEnv(n) {
    var ids=Object.keys(touches);
    if(n===1) {
      var f=touches[ids[0]];
      var dx=clamp(-1,(f.cx-f.sx)/DR,1), dy=clamp(-1,(f.cy-f.sy)/DR,1);
      env.hue=(startEnv.hue+dx*180+360)%360;
      var lr=dy>0?startEnv.lit-5:98-startEnv.lit;
      env.lit=ce("lit",startEnv.lit-dy*lr);
    } else if(n===2) {
      var g=twoGeo(); if(!g) return;
      var aDelta=(g.angle-g.sangle)*180/Math.PI;
      env.gAng=(startEnv.gAng+aDelta*2+360)%360;
      var scale=g.dist/Math.max(1,g.sdist);
      env.gSpread=ce("gSpread",startEnv.gSpread*scale);
      var mdy=clamp(-1,(g.cy-g.scy)/150,1);
      env.gOffset=ce("gOffset",startEnv.gOffset-mdy*40);
    } else if(n>=3) {
      var sp=avgSpread();
      env.sat=ce("sat",startEnv.sat+sp*70);
    }
    applyEnv();
  }

  function onEnd(e) {
    e.preventDefault();
    for(var i=0;i<e.changedTouches.length;i++) delete touches[e.changedTouches[i].identifier];
    var n=Object.keys(touches).length;
    if(n===0) {
      var elapsed=Date.now()-tapTimer;
      var wasTap=maxDist<TAP_DIST && elapsed<TAP_TIME;
      if(wasTap) {
        // Revert any micro-drift
        font=JSON.parse(JSON.stringify(startFont));
        env=JSON.parse(JSON.stringify(startEnv));
        applyFont(); applyEnv();
        draw();
      } else if (zone !== "tap-only") {
        // Commit sculpted state
        saveFont(); saveEnv(); writeHash();
      }
      zone="idle";
    } else {
      startFont=JSON.parse(JSON.stringify(font));
      startEnv=JSON.parse(JSON.stringify(env));
    }
  }

  function onCancel(e) {
    e.preventDefault();
    for(var i=0;i<e.changedTouches.length;i++) delete touches[e.changedTouches[i].identifier];
    if(Object.keys(touches).length===0) {
      font=JSON.parse(JSON.stringify(startFont));
      env=JSON.parse(JSON.stringify(startEnv));
      applyFont(); applyEnv();
      zone="idle";
    }
  }

  card.addEventListener("touchstart",onStart,{passive:false});
  card.addEventListener("touchmove",onMove,{passive:false});
  card.addEventListener("touchend",onEnd,{passive:false});
  card.addEventListener("touchcancel",onCancel,{passive:false});

  // Mouse
  var mDown=false, mZone="idle", msx=0, msy=0;
  card.addEventListener("mousedown",function(e) {
    mDown=true; msx=e.clientX; msy=e.clientY;
    if (sculptMode) {
      e.preventDefault();
      mZone=hitText(e)?"text":"env";
    } else {
      mZone="tap-only";
    }
    startFont=JSON.parse(JSON.stringify(font));
    startEnv=JSON.parse(JSON.stringify(env));
    tapTimer=Date.now(); maxDist=0;
  });
  document.addEventListener("mousemove",function(e) {
    if(!mDown) return;
    var d=Math.sqrt((e.clientX-msx)*(e.clientX-msx)+(e.clientY-msy)*(e.clientY-msy));
    if(d>maxDist) maxDist=d;
    if(mZone==="tap-only") return;
    e.preventDefault();
    var dx=clamp(-1,(e.clientX-msx)/DR,1), dy=clamp(-1,(e.clientY-msy)/DR,1);
    if(mZone==="text") {
      font.lh=cl("lh",startFont.lh-dy*(dy>0?startFont.lh-0.7:2.2-startFont.lh));
      font.wdth=cl("wdth",startFont.wdth+dx*(dx>0?112.5-startFont.wdth:startFont.wdth-87.5));
      font.ls=cl("ls",startFont.ls+dx*(dx>0?0.15-startFont.ls:startFont.ls-(-0.2)));
      applyFont();
    } else {
      env.hue=(startEnv.hue+dx*180+360)%360;
      env.lit=ce("lit",startEnv.lit-dy*(dy>0?startEnv.lit-5:98-startEnv.lit));
      applyEnv();
    }
  });
  document.addEventListener("mouseup",function() {
    if(!mDown) return; mDown=false;
    var elapsed=Date.now()-tapTimer;
    if(maxDist<TAP_DIST && elapsed<TAP_TIME) {
      font=JSON.parse(JSON.stringify(startFont));
      env=JSON.parse(JSON.stringify(startEnv));
      applyFont(); applyEnv(); draw();
    } else if(mZone!=="tap-only") { saveFont(); saveEnv(); writeHash(); }
  });

  // Background env touch (outside card)
  initBgTouch();
}

function initBgTouch() {
  var touches={}, startEnv={}, maxDist=0, DR=120;
  function isBg(e) {
    var t=e.target;
    return !(t.closest&&(t.closest("#card")||t.closest("#card-area")||t.closest("header")||t.closest("footer")||t.closest("#seed-row")||t.closest("#about")));
  }
  function twoGeo() {
    var ids=Object.keys(touches); if(ids.length<2) return null;
    var a=touches[ids[0]], b=touches[ids[1]];
    var dx=b.cx-a.cx, dy=b.cy-a.cy, sdx=b.sx-a.sx, sdy=b.sy-a.sy;
    return { dist:Math.sqrt(dx*dx+dy*dy), sdist:Math.sqrt(sdx*sdx+sdy*sdy), angle:Math.atan2(dy,dx), sangle:Math.atan2(sdy,sdx), cy:(a.cy+b.cy)/2, scy:(a.sy+b.sy)/2 };
  }
  function onStart(e) {
    if(!isBg(e)||!sculptMode) return;
    e.preventDefault();
    var first=Object.keys(touches).length===0;
    for(var i=0;i<e.changedTouches.length;i++) { var t=e.changedTouches[i]; touches[t.identifier]={sx:t.clientX,sy:t.clientY,cx:t.clientX,cy:t.clientY}; }
    if(first) { startEnv=JSON.parse(JSON.stringify(env)); maxDist=0; }
  }
  function onMove(e) {
    if(Object.keys(touches).length===0) return;
    e.preventDefault();
    for(var i=0;i<e.changedTouches.length;i++) { var t=e.changedTouches[i]; if(touches[t.identifier]){touches[t.identifier].cx=t.clientX;touches[t.identifier].cy=t.clientY;} }
    var ids=Object.keys(touches), n=ids.length;
    if(n>0){var f=touches[ids[0]];var d=Math.sqrt((f.cx-f.sx)*(f.cx-f.sx)+(f.cy-f.sy)*(f.cy-f.sy));if(d>maxDist)maxDist=d;}
    if(n===1) {
      var f=touches[ids[0]]; var dx=clamp(-1,(f.cx-f.sx)/DR,1), dy=clamp(-1,(f.cy-f.sy)/DR,1);
      env.hue=(startEnv.hue+dx*180+360)%360;
      var lr=dy>0?startEnv.lit-5:98-startEnv.lit;
      env.lit=ce("lit",startEnv.lit-dy*lr);
    } else if(n===2) {
      var g=twoGeo(); if(!g) return;
      env.gAng=(startEnv.gAng+(g.angle-g.sangle)*180/Math.PI*2+360)%360;
      env.gSpread=ce("gSpread",startEnv.gSpread*(g.dist/Math.max(1,g.sdist)));
      var mdy=clamp(-1,(g.cy-g.scy)/150,1);
      env.gOffset=ce("gOffset",startEnv.gOffset-mdy*40);
    } else if(n>=3) {
      var sp=0;for(var j=0;j<ids.length;j++){var ft=touches[ids[j]];sp+=Math.sqrt((ft.cx-ft.sx)*(ft.cx-ft.sx)+(ft.cy-ft.sy)*(ft.cy-ft.sy));}
      sp=clamp(0,sp/ids.length/100,1);
      env.sat=ce("sat",startEnv.sat+sp*70);
    }
    applyEnv();
  }
  function onEnd(e) {
    for(var i=0;i<e.changedTouches.length;i++) delete touches[e.changedTouches[i].identifier];
    if(Object.keys(touches).length===0) { if(maxDist>=10){saveEnv();writeHash();} }
    else { startEnv=JSON.parse(JSON.stringify(env)); }
  }
  function onCancel(e) {
    for(var i=0;i<e.changedTouches.length;i++) delete touches[e.changedTouches[i].identifier];
    if(Object.keys(touches).length===0){env=JSON.parse(JSON.stringify(startEnv));applyEnv();}
  }
  document.addEventListener("touchstart",function(e){if(isBg(e)&&sculptMode)onStart(e);},{passive:false});
  document.addEventListener("touchmove",function(e){if(Object.keys(touches).length>0)onMove(e);},{passive:false});
  document.addEventListener("touchend",onEnd);
  document.addEventListener("touchcancel",onCancel);
  var mDown=false,msx=0,msy=0,mStart={};
  document.addEventListener("mousedown",function(e){if(!isBg(e)||!sculptMode)return;mDown=true;msx=e.clientX;msy=e.clientY;mStart=JSON.parse(JSON.stringify(env));});
  document.addEventListener("mousemove",function(e){if(!mDown)return;var dx=clamp(-1,(e.clientX-msx)/DR,1),dy=clamp(-1,(e.clientY-msy)/DR,1);env.hue=(mStart.hue+dx*180+360)%360;env.lit=ce("lit",mStart.lit-dy*(dy>0?mStart.lit-5:98-mStart.lit));applyEnv();});
  document.addEventListener("mouseup",function(){if(!mDown)return;mDown=false;saveEnv();writeHash();});
}

// =============================================
// Floating handles — position IS value
// 6 dual-axis handles, 12 variables
// =============================================

var HPAD=0.06;
// Opsz uses logarithmic mapping: most visual change is 5-100
function hValToFrac(v,k){
  var l=LIM[k]||ELIM[k];
  if(k==="opsz") return Math.log(v/l[0])/Math.log(l[1]/l[0]);
  return(v-l[0])/(l[1]-l[0]);
}
function hFracToVal(f,k){
  var l=LIM[k]||ELIM[k];
  if(k==="opsz") return l[0]*Math.pow(l[1]/l[0],f);
  return l[0]+f*(l[1]-l[0]);
}
function hFracToPx(f,total){return HPAD*total+f*(1-2*HPAD)*total}
function hPxToFrac(px,total){return clamp(0,(px-HPAD*total)/((1-2*HPAD)*total),1)}

// Seeded PRNG for handle sizes (mulberry32)
function handleSeed(s){var h=0;for(var i=0;i<s.length;i++){h=Math.imul(31,h)+s.charCodeAt(i)|0}return h>>>0}
function handleRng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
var hRng=handleRng(handleSeed("oblique-proof"));

var handleDefs=[
  {id:"shape",glyph:"\\u204b",label:"shape",size:Math.round(13+hRng()*19),xObj:"font",xKey:"wdth",yObj:"font",yKey:"wght",yInvert:true,
   xFmt:function(v){return"w\\u2009"+v.toFixed(0)},yFmt:function(v){return"W\\u2009"+v.toFixed(0)}},
  {id:"detail",glyph:"\\u2042",label:"detail",size:Math.round(13+hRng()*19),xObj:"font",xKey:"ls",yObj:"font",yKey:"opsz",yInvert:false,
   xFmt:function(v){return"sp\\u2009"+v.toFixed(2)+"em"},yFmt:function(v){return"op\\u2009"+v.toFixed(0)}},
  {id:"scale",glyph:"\\u00a7",label:"scale",size:Math.round(13+hRng()*19),xObj:"font",xKey:"fsz",yObj:"font",yKey:"lh",yInvert:false,
   xFmt:function(v){return v.toFixed(0)+"pt"},yFmt:function(v){return"lh\\u2009"+v.toFixed(2)}},
  {id:"color",glyph:"\\u25c9",label:"colour",size:Math.round(13+hRng()*19),xObj:"env",xKey:"hue",yObj:"env",yKey:"lit",yInvert:false,
   xFmt:function(v){return v.toFixed(0)+"\\u00b0"},yFmt:function(v){return v.toFixed(0)+"%"}},
  {id:"tone",glyph:"\\u25c8",label:"tone",size:Math.round(13+hRng()*19),xObj:"env",xKey:"gAng",yObj:"env",yKey:"sat",yInvert:false,
   xFmt:function(v){return v.toFixed(0)+"\\u00b0"},yFmt:function(v){return v.toFixed(0)+"%"}},
  {id:"field",glyph:"\\u273b",label:"field",size:Math.round(13+hRng()*19),xObj:"env",xKey:"gOffset",yObj:"env",yKey:"gSpread",yInvert:false,
   xFmt:function(v){return"off\\u2009"+v.toFixed(0)},yFmt:function(v){return"spr\\u2009"+v.toFixed(0)}},
];

var handleEls={};
var handleDragging={};

function getHObj(name){return name==="font"?font:env}
function getHLim(k){return LIM[k]||ELIM[k]}

function positionHandle(el,h){
  if(handleDragging[h.id]) return; // don't fight the drag
  var vw=window.innerWidth,vh=window.innerHeight;
  var xFrac=hValToFrac(getHObj(h.xObj)[h.xKey],h.xKey);
  var yFrac=hValToFrac(getHObj(h.yObj)[h.yKey],h.yKey);
  if(h.yInvert) yFrac=1-yFrac;
  el.style.left=hFracToPx(xFrac,vw)+"px";
  el.style.top=hFracToPx(yFrac,vh)+"px";
}

function positionHandles(){
  handleDefs.forEach(function(h){
    var el=handleEls[h.id];
    if(el) positionHandle(el,h);
  });
}

function updateHandleTip(el,h){
  var vals=el.querySelector(".tip-vals");
  if(vals) vals.textContent=h.xFmt(getHObj(h.xObj)[h.xKey])+" / "+h.yFmt(getHObj(h.yObj)[h.yKey]);
}

function initHandles(){
  handleDefs.forEach(function(h){
    var el=document.createElement("div");
    el.className="handle";el.id="h-"+h.id;
    el.innerHTML='<span class="glyph" style="font-size:'+h.size+'px">'+h.glyph+'</span><span class="tip"><span class="tip-label">'+h.label+'</span><br><span class="tip-vals"></span></span>';
    document.body.appendChild(el);
    handleEls[h.id]=el;
    updateHandleTip(el,h);

    var dragging=false,offX=0,offY=0;
    function onStart(e){
      e.preventDefault();e.stopPropagation();
      dragging=true;handleDragging[h.id]=true;
      el.classList.add("dragging");
      var p=e.touches?e.touches[0]:e;
      var r=el.getBoundingClientRect();
      offX=p.clientX-(r.left+r.width/2);
      offY=p.clientY-(r.top+r.height/2);
    }
    function onMove(e){
      if(!dragging)return;
      e.preventDefault();
      var p=e.touches?e.touches[0]:e;
      var vw=window.innerWidth,vh=window.innerHeight;
      var x=p.clientX-offX,y=p.clientY-offY;
      var xFrac=hPxToFrac(x,vw);
      var xLim=getHLim(h.xKey);
      if(h.xKey==="hue"||h.xKey==="gAng"){
        getHObj(h.xObj)[h.xKey]=(hFracToVal(xFrac,h.xKey)+360)%360;
      } else {
        getHObj(h.xObj)[h.xKey]=clamp(xLim[0],hFracToVal(xFrac,h.xKey),xLim[1]);
      }
      var yFrac=hPxToFrac(y,vh);
      if(h.yInvert) yFrac=1-yFrac;
      var yLim=getHLim(h.yKey);
      getHObj(h.yObj)[h.yKey]=clamp(yLim[0],hFracToVal(yFrac,h.yKey),yLim[1]);
      el.style.left=clamp(HPAD*vw,x,(1-HPAD)*vw)+"px";
      el.style.top=clamp(HPAD*vh,y,(1-HPAD)*vh)+"px";
      updateHandleTip(el,h);
      if(h.xObj==="font"||h.yObj==="font") applyFont();
      if(h.xObj==="env"||h.yObj==="env") applyEnv();
    }
    function onEnd(){
      if(!dragging)return;
      dragging=false;handleDragging[h.id]=false;
      el.classList.remove("dragging");
      saveFont();saveEnv();writeHash();
      positionHandle(el,h); // snap to clean position
    }
    el.addEventListener("touchstart",onStart,{passive:false});
    document.addEventListener("touchmove",function(e){if(dragging)onMove(e)},{passive:false});
    document.addEventListener("touchend",function(){if(dragging)onEnd()});
    document.addEventListener("touchcancel",function(){if(dragging)onEnd()});
    el.addEventListener("mousedown",onStart);
    document.addEventListener("mousemove",function(e){if(dragging)onMove(e)});
    document.addEventListener("mouseup",function(){if(dragging)onEnd()});
  });
  window.addEventListener("resize", positionHandles);
}

// --- Views ---
function showCardView() {
  currentPage="card";
  document.body.classList.remove("about-active");
  $("card-area").style.display="";
  $("seed-row").style.display=currentMode==="deterministic"?"flex":"none";
  $("about").style.display="none";
  document.querySelector("footer").style.display="";
  document.querySelectorAll(".handle").forEach(function(h){h.style.display=""});
  updateButtons(); applyFont(); applyEnv();
}
function showAboutView() {
  currentPage="about";
  document.body.classList.add("about-active");
  $("card-area").style.display="none";
  $("seed-row").style.display="none";
  $("about").style.display="block";
  document.querySelector("footer").style.display="none";
  document.querySelectorAll(".handle").forEach(function(h){h.style.display="none"});
  window.scrollTo(0,0); updateButtons(); applyEnv();
}
function updateButtons() {
  MODES.forEach(function(m){var b=$("btn-"+m);if(b)b.className=(m===currentMode&&currentPage==="card")?"active":"";});
  var ab=$("btn-about"); if(ab) ab.className=currentPage==="about"?"active":"";
}
function setMode(mode) { currentMode=mode; currentPage="card"; showCardView(); writeHash(); draw(); }

// --- Draw ---
var drawing = false;
function draw() {
  if(currentPage==="about"||drawing) return;
  drawing=true;
  var card=$("card");
  card.classList.remove("visible"); card.classList.add("fading");
  var url="/api/random?mode="+currentMode;
  if(currentSeed) url+="&seed="+encodeURIComponent(currentSeed);
  fetch(url).then(function(r){return r.json();}).then(function(data) {
    currentIndex=data.index;
    setTimeout(function() {
      $("card-text").textContent=data.strategy;
      $("card-index").textContent="#"+(data.index+1);
      applyFont();
      card.classList.remove("fading"); card.classList.add("visible"); drawing=false;
    },220);
  }).catch(function(){
    setTimeout(function(){
      $("card-text").textContent="Error"; $("card-index").textContent="";
      applyFont(); card.classList.remove("fading"); card.classList.add("visible"); drawing=false;
    },220);
  });
}

// --- About ---
function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML;}
function loadAbout() {
  fetch("/api/about").then(function(r){return r.json();}).then(function(a) {
    var h="<h2>"+esc(a.title)+"</h2>";
    h+="<p class='subtitle'>"+esc(a.subtitle)+" \\u2014 "+esc(a.attribution)+"</p>";
    a.description.forEach(function(d){h+="<p>"+esc(d)+"</p>";});
    h+="<h2>Modes</h2><dl>";
    Object.keys(a.modes).forEach(function(k){h+="<dt>"+esc(k)+"</dt><dd>"+esc(a.modes[k])+"</dd>";});
    h+="</dl>";
    var d=a.dev;
    h+="<h2>For Developers &amp; Agents</h2><p>"+esc(d.intro)+"</p>";
    h+="<h3>Endpoints</h3>";
    d.endpoints.forEach(function(e){h+="<p><code>"+esc(e.method)+" "+esc(e.path)+"</code> \\u2014 "+esc(e.desc)+"</p>";});
    h+="<h3>Examples</h3>";
    d.examples.forEach(function(e){h+="<pre><code>"+esc(e)+"</code></pre>";});
    h+="<h3>Use as a Skill</h3>";
    h+="<p>Point any agent at the root URL with a plain <code>Accept</code> header to get a machine-readable skill document:</p>";
    h+="<pre><code>curl "+esc(d.origin)+"</code></pre>";
    h+="<p>Or download directly:</p><div class='actions'>";
    h+="<a href='/skill.md'>Download SKILL.md</a>";
    h+="<button onclick='copySkillUrl()'>Copy skill URL</button></div>";
    $("about").innerHTML=h;
  }).catch(function(){});
}
function copySkillUrl(){navigator.clipboard.writeText(location.origin+"/skill.md").then(function(){var b=document.querySelector(".actions button");if(b){var o=b.textContent;b.textContent="Copied!";setTimeout(function(){b.textContent=o;},1500);}});}
window.copySkillUrl=copySkillUrl;
window.addEventListener("hashchange",applyHash);
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
else init();
`;

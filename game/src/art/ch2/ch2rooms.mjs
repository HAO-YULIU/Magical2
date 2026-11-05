// 第二章各場景的擺設（帳號二，2026-11-04）：模型庫裡沒有的，用程式拼。底部都在原點、正面朝 +z。
//   cauldron({ size })：魔藥學教室的鐵大釜（三隻腳、藥水會冒泡）。回傳的 group.userData：setColor(色)、tick(dt)
//   blackboard({ lines, erased })：黑板（粉筆字，Q03 謎語、Q08 被擦掉的配方）。erased＝true 只剩模糊的粉筆灰
//   ingredientShelf()：材料架（瓶罐、乾燥的草、標籤）；曼德拉草、尖叫蘑菇、啞蛇的鱗各一瓶（Q03）
//   juiceJug({ drugged })：晚宴的南瓜汁壺（Q17）；drugged＝true 液面浮著一層幾乎看不見的黑色油膜
//   gobletSet(n)：一排高腳杯，有的空了、有的還有半杯
//   barrel({ lying })：地窖的酒桶（直立或橫放）
//   sprinklerRig({ groups })：溫室的灑水器（四組銅管，Q09）；userData.spray(i, on)
//   crestPedestal(house)：大門前庭的學院徽記台（Q27）；userData.light(on)
//   gateBarrier({ width, height })：學校大門（鐵柵門）＋關上中的結界；userData.close(k) 0～1
import * as THREE from 'three';

const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const iron = () => new THREE.MeshStandardMaterial({ color: '#2a2724', metalness: 0.75, roughness: 0.55 });
const wood = (c = '#4a3424') => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 });
const brass = () => new THREE.MeshStandardMaterial({ color: '#8a6a2c', metalness: 0.85, roughness: 0.35 });

// ---------- 大釜 ----------
export function cauldron({ size = 0.55, color = '#6a8a4a' } = {}) {
  const g = new THREE.Group();
  const pts = []; for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI * 0.62; pts.push(new THREE.Vector2(Math.sin(a + 0.35) * size, -Math.cos(a + 0.35) * size * 0.85)); }
  pts.push(new THREE.Vector2(size * 0.86, size * 0.42), new THREE.Vector2(size * 0.92, size * 0.46), new THREE.Vector2(size * 0.86, size * 0.5));
  const pot = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), Object.assign(iron(), { side: THREE.DoubleSide })); pot.position.y = size * 0.95; g.add(pot);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, size * 0.6, 6), iron()); leg.position.set(Math.cos(a) * size * 0.55, size * 0.3, Math.sin(a) * size * 0.55); leg.rotation.z = Math.cos(a) * 0.25; leg.rotation.x = -Math.sin(a) * 0.25; g.add(leg); }
  for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.TorusGeometry(size * 0.16, 0.018, 6, 14), iron()); h.position.set(s * size * 0.92, size * 1.32, 0); h.rotation.y = Math.PI / 2; g.add(h); }
  // 藥水：自發光的液面＋冒泡
  const liq = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.55, roughness: 0.15 });
  const surf = new THREE.Mesh(new THREE.CircleGeometry(size * 0.84, 28), liq); surf.rotation.x = -Math.PI / 2; surf.position.y = size * 1.33; g.add(surf);
  const bub = [], bm = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8, transparent: true, opacity: 0.8, roughness: 0.1 });
  for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), bm); b.userData.t = Math.random() * 2; g.add(b); bub.push(b); }
  const glow = new THREE.PointLight(color, 0.6, 3); glow.position.y = size * 1.6; g.add(glow);
  let t = 0;
  g.userData.setColor = (c) => { liq.color.set(c); liq.emissive.set(c); bm.color.set(c); bm.emissive.set(c); glow.color.set(c); };
  g.userData.tick = (dt) => {
    t += dt;
    for (const b of bub) { b.userData.t += dt * 0.8; const k = b.userData.t % 1.6; const r = size * 0.7 * ((b.id * 0.618) % 1); const a = b.id * 2.4; b.position.set(Math.cos(a) * r, size * 1.33 + k * 0.05, Math.sin(a) * r); b.scale.setScalar(k < 1.4 ? 0.012 + k * 0.025 : 0.0001); }
    glow.intensity = 0.5 + 0.15 * Math.sin(t * 5) * Math.sin(t * 2.3);
  };
  return g;
}

// ---------- 黑板 ----------
export function blackboard({ lines = ['先放會哭的，', '再放會叫的，', '最後放沉默的。'], erased = false, width = 3, height = 1.4 } = {}) {
  const g = new THREE.Group();
  const tex = canvasTex(1024, 480, (c, w, h) => {
    c.fillStyle = '#1d2a22'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { c.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`; c.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 30, 1 + Math.random() * 6); } // 擦過的痕跡
    c.font = '54px "Noto Serif TC", serif'; c.textBaseline = 'top';
    lines.forEach((s, i) => {
      if (erased) { c.filter = 'blur(5px)'; c.fillStyle = 'rgba(230,230,220,0.18)'; } else { c.filter = 'none'; c.fillStyle = 'rgba(235,235,225,0.88)'; }
      c.fillText(s, 60, 50 + i * 110);
    });
    c.filter = 'none';
  });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
  board.position.y = 1.5; g.add(board);
  const fr = wood('#3a2a1c');
  for (const [x, y, w, h] of [[0, 1.5 + height / 2 + 0.04, width + 0.16, 0.08], [0, 1.5 - height / 2 - 0.04, width + 0.16, 0.08], [-width / 2 - 0.04, 1.5, 0.08, height], [width / 2 + 0.04, 1.5, 0.08, height]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), fr); m.position.set(x, y, 0.02); g.add(m); }
  const tray = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, 0.1), fr); tray.position.set(0, 1.5 - height / 2 - 0.08, 0.06); g.add(tray);
  for (let i = 0; i < 3; i++) { const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.07, 5), new THREE.MeshStandardMaterial({ color: '#eeeeea' })); ch.rotation.z = Math.PI / 2; ch.position.set(-0.6 + i * 0.12, 1.5 - height / 2 - 0.05, 0.07); g.add(ch); }
  return g;
}

// ---------- 材料架 ----------
const LABEL = (s) => canvasTex(128, 64, (c, w, h) => { c.fillStyle = '#d8c9a4'; c.fillRect(0, 0, w, h); c.strokeStyle = '#5a4630'; c.lineWidth = 3; c.strokeRect(3, 3, w - 6, h - 6); c.fillStyle = '#2a1e12'; c.font = '26px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, w / 2, h / 2 + 2); });
export function ingredientShelf({ labels = ['曼德拉草', '尖叫蘑菇', '啞蛇的鱗', '月光草', '蝙蝠翅', '銀粉'] } = {}) {
  const g = new THREE.Group(), w = wood();
  const W = 1.8, H = 2.0, D = 0.4;
  for (const x of [-W / 2, W / 2]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, H, D), w); s.position.set(x, H / 2, 0); g.add(s); }
  const back = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.03), wood('#33241a')); back.position.set(0, H / 2, -D / 2); g.add(back);
  const glass = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.55 });
  const COL = ['#5a7a3a', '#8a5a7a', '#3a5a6a', '#c8d8b0', '#4a3a3a', '#c0c0c8', '#7a4a2a', '#2a4a3a'];
  let li = 0;
  for (let r = 0; r < 4; r++) {
    const y = 0.15 + r * 0.5; const sh = new THREE.Mesh(new THREE.BoxGeometry(W, 0.04, D), w); sh.position.set(0, y, 0); g.add(sh);
    for (let k = 0; k < 5; k++) {
      const x = -W / 2 + 0.22 + k * 0.34 + (Math.random() - 0.5) * 0.05, hh = 0.18 + Math.random() * 0.16, rr = 0.06 + Math.random() * 0.03;
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, hh, 12), glass(COL[(r * 5 + k) % COL.length])); jar.position.set(x, y + 0.02 + hh / 2, 0.02); g.add(jar);
      const fill = new THREE.Mesh(new THREE.CylinderGeometry(rr * 0.85, rr * 0.85, hh * (0.3 + Math.random() * 0.5), 10), new THREE.MeshStandardMaterial({ color: COL[(r * 3 + k * 2) % COL.length], roughness: 0.8 })); fill.position.set(x, y + 0.03 + fill.geometry.parameters.height / 2, 0.02); g.add(fill);
      const cork = new THREE.Mesh(new THREE.CylinderGeometry(rr * 0.7, rr * 0.6, 0.04, 8), wood('#8a6a44')); cork.position.set(x, y + 0.04 + hh, 0.02); g.add(cork);
      if (r === 1 && li < labels.length || r === 2 && li < labels.length) { const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.06), new THREE.MeshStandardMaterial({ map: LABEL(labels[li++]), roughness: 0.9 })); lb.position.set(x, y + 0.02 + hh * 0.45, 0.02 + rr + 0.002); g.add(lb); }
    }
  }
  // 掛在架子邊的乾燥草束
  for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.35, 6), new THREE.MeshStandardMaterial({ color: '#6a6a3a', roughness: 1 })); b.position.set(-W / 2 + 0.3 + i * 0.6, H - 0.2, D / 2 + 0.03); b.rotation.x = Math.PI; g.add(b); }
  return g;
}

// ---------- 南瓜汁壺、高腳杯 ----------
export function juiceJug({ drugged = false } = {}) {
  const g = new THREE.Group();
  const pts = [[0, 0], [0.08, 0], [0.11, 0.06], [0.12, 0.16], [0.09, 0.26], [0.06, 0.3], [0.07, 0.33]].map(([x, y]) => new THREE.Vector2(x, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 20), new THREE.MeshStandardMaterial({ color: '#c8d4d8', roughness: 0.06, metalness: 0.1, transparent: true, opacity: 0.35, side: THREE.DoubleSide })); g.add(body);
  const juice = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.075, 0.2, 18), new THREE.MeshStandardMaterial({ color: '#d0701a', roughness: 0.3, emissive: '#3a1400' })); juice.position.y = 0.105; g.add(juice);
  if (drugged) { const film = new THREE.Mesh(new THREE.CircleGeometry(0.1, 18), new THREE.MeshStandardMaterial({ color: '#0a0610', roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.45 })); film.rotation.x = -Math.PI / 2; film.position.y = 0.207; g.add(film); }
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 12, Math.PI), body.material); handle.position.set(-0.12, 0.17, 0); handle.rotation.z = Math.PI / 2; g.add(handle);
  return g;
}
export function gobletSet(n = 4, { seed = 1 } = {}) {
  const g = new THREE.Group(); let s = seed; const R = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const gm = new THREE.MeshStandardMaterial({ color: '#d8c890', metalness: 0.7, roughness: 0.3 });
  for (let i = 0; i < n; i++) {
    const c = new THREE.Group();
    const cup = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.035, 0.0], [0.006, 0.01], [0.006, 0.08], [0.04, 0.11], [0.045, 0.16]].map(([x, y]) => new THREE.Vector2(x, y)), 14), gm); c.add(cup);
    const lvl = R(); if (lvl > 0.35) { const j = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.04 * lvl, 12), new THREE.MeshStandardMaterial({ color: '#c8601a', roughness: 0.3 })); j.position.y = 0.11 + 0.02 * lvl; c.add(j); }
    c.position.x = i * 0.35; if (R() < 0.15) { c.rotation.z = Math.PI / 2; c.position.y = 0.04; } // 倒了一杯
    g.add(c);
  }
  return g;
}

// ---------- 酒桶 ----------
export function barrel({ lying = false } = {}) {
  const g = new THREE.Group(), h = 1.0, r = 0.38;
  const pts = []; for (let i = 0; i <= 10; i++) { const y = i / 10; pts.push(new THREE.Vector2(r * (0.86 + 0.14 * Math.sin(y * Math.PI)), y * h)); }
  const tex = canvasTex(256, 256, (c, w, hh) => { for (let i = 0; i < 16; i++) { c.fillStyle = `hsl(25,${30 + Math.random() * 15}%,${18 + Math.random() * 10}%)`; c.fillRect(i * 16, 0, 16, hh); c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(i * 16, 0, 1.5, hh); } });
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 24), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 })); g.add(body);
  for (const y of [0.12, 0.88]) { const band = new THREE.Mesh(new THREE.TorusGeometry(r * (0.86 + 0.14 * Math.sin(y * Math.PI)) + 0.005, 0.012, 6, 24), iron()); band.rotation.x = Math.PI / 2; band.position.y = y * h; g.add(band); }
  for (const y of [0, h]) { const cap = new THREE.Mesh(new THREE.CircleGeometry(r * 0.86, 24), wood('#3a2818')); cap.rotation.x = y ? -Math.PI / 2 : Math.PI / 2; cap.position.y = y; g.add(cap); }
  if (lying) { g.rotation.z = Math.PI / 2; g.position.set(h / 2, r * 0.95, 0); const w = new THREE.Group(); w.add(g); return w; }
  return g;
}

// ---------- 溫室的灑水器 ----------
export function sprinklerRig({ groups = 4, span = 10 } = {}) {
  const g = new THREE.Group(), cu = new THREE.MeshStandardMaterial({ color: '#8a5a3a', metalness: 0.8, roughness: 0.4 });
  const sprays = [];
  for (let i = 0; i < groups; i++) {
    const z = -span / 2 + (i + 0.5) * (span / groups);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 4, 8), cu); pipe.rotation.z = Math.PI / 2; pipe.position.set(0, 2.6, z); g.add(pipe);
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.16), new THREE.MeshStandardMaterial({ map: LABEL('甲乙丙丁'[i] + '組'), roughness: 0.9 })); tag.position.set(-1.9, 2.45, z); g.add(tag);
    const mist = new THREE.Group(); mist.visible = false;
    for (let k = 0; k < 5; k++) { const cone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.6, 10, 1, true), new THREE.MeshBasicMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide })); cone.position.set(-1.6 + k * 0.8, 1.8, z); mist.add(cone); }
    g.add(mist); sprays.push(mist);
  }
  g.userData.spray = (i, on) => { if (sprays[i]) sprays[i].visible = on; };
  return g;
}

// ---------- 徽記台 ----------
const HOUSE = { eldrin: ['#9fc4ff', '✦'], grimoire: ['#c0454f', '❦'], belmont: ['#d1a640', '⚔'], ouroboros: ['#4fa37a', '◎'] };
export function crestPedestal(house = 'eldrin') {
  const [col, sym] = HOUSE[house] ?? HOUSE.eldrin;
  const g = new THREE.Group(), stone = new THREE.MeshStandardMaterial({ color: '#6a6a70', roughness: 0.9 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.25, 8), stone); base.position.y = 0.125; g.add(base);
  const col1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.9, 8), stone); col1.position.y = 0.7; g.add(col1);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.4, 0.12, 8), stone); top.position.y = 1.2; g.add(top);
  const tex = canvasTex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = col; c.lineWidth = 10; c.beginPath(); c.arc(w / 2, h / 2, 110, 0, Math.PI * 2); c.stroke(); c.fillStyle = col; c.font = '150px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sym, w / 2, h / 2 + 8); });
  const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, emissive: col, emissiveMap: tex, emissiveIntensity: 0.15, roughness: 0.6 });
  const crest = new THREE.Mesh(new THREE.CircleGeometry(0.38, 32), mat); crest.rotation.x = -Math.PI / 2; crest.position.y = 1.265; g.add(crest);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 6, 16, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.0, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 4.27; g.add(beam);
  g.userData.light = (on) => { mat.emissiveIntensity = on ? 2.2 : 0.15; beam.material.opacity = on ? 0.18 : 0; };
  return g;
}

// ---------- 大門與結界 ----------
export function gateBarrier({ width = 8, height = 6 } = {}) {
  const g = new THREE.Group(), ir = iron();
  for (const s of [-1, 1]) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.8, height + 1, 0.8), new THREE.MeshStandardMaterial({ color: '#5a5a60', roughness: 0.95 })); post.position.set(s * (width / 2 + 0.4), (height + 1) / 2, 0); g.add(post); }
  for (let i = 0; i <= 16; i++) { const x = -width / 2 + (i / 16) * width; const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, height, 6), ir); bar.position.set(x, height / 2, 0); g.add(bar); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.25, 6), ir); tip.position.set(x, height + 0.12, 0); g.add(tip); }
  for (const y of [0.4, height * 0.55, height - 0.3]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(width, 0.08, 0.08), ir); rail.position.y = y; g.add(rail); }
  // 結界：一層發光的薄膜，從兩邊往中間關上
  const tex = canvasTex(512, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(120,60,200,0)'); gr.addColorStop(0.5, 'rgba(160,90,255,0.6)'); gr.addColorStop(1, 'rgba(80,20,140,0.2)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { c.strokeStyle = `rgba(220,190,255,${Math.random() * 0.4})`; c.beginPath(); c.moveTo(Math.random() * w, 0); c.bezierCurveTo(Math.random() * w, h / 3, Math.random() * w, h * 2 / 3, Math.random() * w, h); c.stroke(); } });
  const film = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const L = new THREE.Mesh(new THREE.PlaneGeometry(width / 2, height + 1.5), film), Rt = new THREE.Mesh(new THREE.PlaneGeometry(width / 2, height + 1.5), film);
  L.position.set(-width / 4, (height + 1.5) / 2, 0.6); Rt.position.set(width / 4, (height + 1.5) / 2, 0.6); g.add(L, Rt);
  g.userData.close = (k) => { const s = Math.max(0.001, k); L.scale.x = s; Rt.scale.x = s; L.position.x = -width / 2 + (width / 4) * s; Rt.position.x = width / 2 - (width / 4) * s; };
  g.userData.close(0.7);
  return g;
}

// 第二章的場景擺設（帳號二，2026-11-05）：萬聖節布置（大廳、交誼廳）、Q02 的南瓜燈、魔藥學教室、溫室（Q06 的異常、標記）。
// 房間的牆、地板由 greybox 依 data/world-ch1.mjs 的 ROOMS 自動蓋；這裡只放擺設。美術在 art/ch2/。
import * as THREE from 'three';
import { jackOLantern, tickPumpkins, dressHalloweenHall } from '../art/ch2/halloween.mjs';
import { drape, rollBook, blackPlant, hospitalBed, filingCabinet } from '../art/ch2/ch2props.mjs';
import { loadCharacter } from '../art/characters.mjs';
import { buildVictim, bloodPool, bloodTrail } from '../art/gore.mjs';
import { cauldron, blackboard, ingredientShelf, sprinklerRig, juiceJug, gobletSet } from '../art/ch2/ch2rooms.mjs';
import { PUMPKIN_GRID, PUMPKIN_AT, GREEN_SPOT_AT, BEDS, ARCHIVE_ROWS, JUGS, SIDE_DOOR, CHANDELIER_FAR, FOOTPRINTS } from '../data/ch2-act1.mjs';

// Q02：照格子畫指定的眼睛和嘴巴（貼圖的 u＝0.25 是正前方）
function faceTex(eye, mouth, glow) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = glow ? '#000' : '#d8701c'; g.fillRect(0, 0, 512, 256);
  if (!glow) { for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(120,50,10,0.35)'; g.fillRect(i * 51.2, 0, 4, 256); } }
  g.fillStyle = glow ? '#ffb040' : '#2a1204';
  const cx = 128, ey = 105, ex = 30;
  for (const s of [-1, 1]) {
    const x = cx + s * ex; g.beginPath();
    if (eye === 'tri') { g.moveTo(x - 16, ey + 10); g.lineTo(x + 16, ey + 10); g.lineTo(x, ey - 16); }
    else if (eye === 'round') g.arc(x, ey, 13, 0, Math.PI * 2);
    else { g.arc(x, ey, 15, Math.PI * 0.1, Math.PI * 0.9); g.arc(x, ey - 7, 12, Math.PI * 0.85, Math.PI * 0.15, true); }
    g.fill();
  }
  const my = 160; g.beginPath();
  if (mouth === 'grin') { g.moveTo(cx - 52, my - 8); g.quadraticCurveTo(cx, my + 40, cx + 52, my - 8); g.quadraticCurveTo(cx, my + 14, cx - 52, my - 8); g.fill(); }
  else if (mouth === 'fang') { g.moveTo(cx - 48, my); g.lineTo(cx + 48, my); g.lineTo(cx + 30, my + 22); g.lineTo(cx + 18, my + 8); g.lineTo(cx - 18, my + 8); g.lineTo(cx - 30, my + 22); g.closePath(); g.fill(); }
  else { g.fillRect(cx - 46, my + 2, 92, 7); for (let i = -4; i <= 4; i++) g.fillRect(cx + i * 10 - 1.5, my - 7, 3, 25); } // 縫起來：一條線＋針腳
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function facedPumpkin(eye, mouth, size = 0.5) {
  const p = jackOLantern({ size, face: 0 });
  const body = p.children[0];
  body.material = body.material.clone(); body.material.map = faceTex(eye, mouth, false); body.material.emissiveMap = faceTex(eye, mouth, true); body.material.needsUpdate = true;
  return p;
}

export function createCh2Scene(scene, conn) {
  const root = new THREE.Group(); root.userData.static = true; scene.add(root);
  const ticks = [];
  const put = (o, x, z, yaw = 0, y = 0) => { o.position.set(x, y, z); o.rotation.y = yaw; root.add(o); return o; };

  // ---- 大廳：Q02 的南瓜燈架（3×3，中間那顆被打爛）＋萬聖節布置 ----
  const rack = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.0, 0.6), new THREE.MeshStandardMaterial({ color: '#3a2a1c', roughness: 0.9 }));
  put(rack, PUMPKIN_AT.x, PUMPKIN_AT.z, 0, 0.5);
  PUMPKIN_GRID.forEach((row, r) => row.forEach((cell, c) => {
    const x = PUMPKIN_AT.x + (c - 1) * PUMPKIN_AT.gap, y = 1.0 + (2 - r) * 0.55;
    if (!cell) { // 被打爛的那一顆：碎片
      for (let k = 0; k < 5; k++) { const sh = new THREE.Mesh(new THREE.SphereGeometry(0.08 + Math.random() * 0.05, 6, 4, 0, Math.PI), new THREE.MeshStandardMaterial({ color: '#c8601a', roughness: 0.8, side: THREE.DoubleSide })); put(sh, x + (Math.random() - 0.5) * 0.4, PUMPKIN_AT.z + 0.2, Math.random() * 6, y - 0.05); }
      return;
    }
    const p = facedPumpkin(cell[0], cell[1], 0.42); put(p, x, PUMPKIN_AT.z + 0.1, 0, y - 0.2);
  }));
  for (let i = 0; i < 10; i++) put(jackOLantern({ size: 0.35 + Math.random() * 0.2, face: i % 4, light: i % 4 === 0 }), -8 + (i % 5) * 4, i < 5 ? 113 : 137, i < 5 ? 0 : Math.PI);
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) put(drape({ width: 2.5, drop: 4 }), s * 9.8, 116 + k * 6, s > 0 ? -Math.PI / 2 : Math.PI / 2, 14);
  // 交誼廳：每間兩顆南瓜燈
  for (const [x, z] of [[14, -5], [-14, -5], [-6, 20], [6, 20]]) { put(jackOLantern({ size: 0.4, face: 1, light: true }), x, z); put(jackOLantern({ size: 0.3, face: 2 }), x + 1.2, z + 0.4); }

  // ---- 魔藥學教室（x 30～45、z -10～10） ----
  const boardL = blackboard({ lines: ['月影藥水：', '先放會哭的，再放會叫的，', '最後放沉默的。'] }); put(boardL, 34.5, -9.8);
  const boardR = blackboard({ lines: ['把＿＿＿放進去，', '在＿＿＿的時候，', '念＿＿＿。'], erased: true }); put(boardR, 40.5, -9.8);
  const main = cauldron({ size: 0.55, color: '#9ab0c8' }); put(main, 37.5, -3.5); ticks.push(main.userData.tick);
  for (const [x, z, col] of [[33, 0, '#6a8a4a'], [42, 0, '#8a5a8a'], [33, -5.5, '#4a7a8a'], [42, -5.5, '#7a7a4a']]) { const c = cauldron({ size: 0.45, color: col }); put(c, x, z); ticks.push(c.userData.tick); }
  put(ingredientShelf(), 30.25, -3, Math.PI / 2);
  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.85, 0.9), new THREE.MeshStandardMaterial({ color: '#3a2618', roughness: 0.8 })); put(desk, 41, -7.6, 0, 0.425);
  const lectern = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.5), new THREE.MeshStandardMaterial({ color: '#4a3020', roughness: 0.8 })); put(lectern, 37.5, -7.2, 0, 0.55);
  const book = rollBook({ seed: 3 }); book.scale.setScalar(0.8); put(book, 37.5, -7.2, 0, 1.12);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.2, 1.4), new THREE.MeshStandardMaterial({ color: '#2a1e16', roughness: 0.7 })); put(cab, 44.65, -5, 0, 1.1);
  for (let i = 0; i < 6; i++) put(jackOLantern({ size: 0.3, face: i % 4, light: i === 0 }), 31 + i * 2.6, 9.4, Math.PI);
  // 小東西：沒有標籤的瓶子、日記、牆上的鐘（XIII）、課表、植物清單、澆水時刻表、四學院的線索台
  const paperTex = (lines, w = 256, h = 192, bg = '#d8c9a4') => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = '#2a1e12'; g.font = '20px serif'; lines.forEach((l, i) => g.fillText(l, 12, 30 + i * 26)); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const paper = (lines, x, y, z, yaw, w = 0.6, h = 0.45) => put(new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: paperTex(lines), roughness: 0.9 })), x, z, yaw, y);
  put(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.26, 12), new THREE.MeshStandardMaterial({ color: '#050307', roughness: 0.1, metalness: 0.2 })), 30.6, 2.5, 0, 0.13);
  put(new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.24), new THREE.MeshStandardMaterial({ color: '#4a1414', roughness: 0.7 })), 41, -7.5, 0.3, 0.88);
  { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#e8e0cc'; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill(); g.fillStyle = '#2a1e12'; g.font = '22px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII'].forEach((n, i) => { const a = (i / 13) * Math.PI * 2 - Math.PI / 2; g.fillStyle = n === 'XIII' ? '#8a0a0a' : '#2a1e12'; g.fillText(n, 128 + Math.cos(a) * 98, 128 + Math.sin(a) * 98); });
    const a = (12 / 13) * Math.PI * 2 - Math.PI / 2; g.strokeStyle = '#111'; g.lineWidth = 5; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.cos(a) * 80, 128 + Math.sin(a) * 80); g.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; put(new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 })), 44.85, 3, -Math.PI / 2, 2); }
  paper(['今天的課：', '① 月光草', '② 蝙蝠翅', '③ 銀粉'], 43.6, 1.7, -9.78, 0, 0.6, 0.45);
  paper(['植物清單', '（請比對）'], 45.2, 1.2, 2.4, Math.PI / 2, 0.6, 0.45);
  paper(['澆水時刻表', '甲 4 分 乙 6 分', '丙 9 分 丁 12 分', '8:00 一起'], 56.85, 1.5, -9, -Math.PI / 2, 0.8, 0.6);
  for (const [i, col] of ['#9fc4ff', '#c0454f', '#d1a640', '#4fa37a'].entries()) { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.9, 8), new THREE.MeshStandardMaterial({ color: '#5a5a60', roughness: 0.9, emissive: col, emissiveIntensity: 0.12 })); put(st, 51, -6 + i * 4, 0, 0.45); }

  // ---- 溫室（x 45～57、z -12.5～12.5）：一排排花盆、灑水器、最裡面的黑色植物 ----
  const pot = (x, z, s = 1, col = '#4a7a3a') => { const g = new THREE.Group(); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * s, 0.16 * s, 0.32 * s, 10), new THREE.MeshStandardMaterial({ color: '#8a4a2a', roughness: 0.9 })); p.position.y = 0.16 * s; g.add(p); const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.28 * s, 8, 6), new THREE.MeshStandardMaterial({ color: col, roughness: 0.8 })); leaf.position.y = 0.48 * s; leaf.scale.y = 1.2; g.add(leaf); return put(g, x, z); };
  const spotGroups = {};
  for (const [id, [x, z]] of Object.entries(GREEN_SPOT_AT)) { const g = new THREE.Group(); for (let k = 0; k < 3; k++) g.add(pot(x - 0.5 + k * 0.5, z, 1).removeFromParent()); g.children.forEach((c, k) => c.position.set(x - 0.5 + k * 0.5, 0, z)); root.add(g); spotGroups[id] = g; }
  const black = blackPlant({ height: 1.3 }); put(black, 51, -10.8); if (black.userData.tick) ticks.push(black.userData.tick);
  const rig = sprinklerRig({ groups: 4, span: 22 }); put(rig, 51, 0, Math.PI / 2);
  const lever = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.08), new THREE.MeshStandardMaterial({ color: '#2a2a2a', metalness: 0.7 })); put(lever, 51.6, -11.9, 0, 1.0);
  // Q06：伺服器說哪三個地方不對勁 → 多一盆、少一盆、換成黑色
  let anomalies = null;
  const applyAnomalies = (spots) => {
    if (anomalies) return; anomalies = spots;
    spots.forEach((id, k) => {
      const g = spotGroups[id]; if (!g) return;
      if (k === 0) { const [x, z] = GREEN_SPOT_AT[id]; const extra = pot(x + 1.0, z, 1).removeFromParent(); extra.position.set(x + 1.0, 0, z); g.add(extra); }
      else if (k === 1) g.children[2].visible = false;
      else { const leaf = g.children[1].children[1]; leaf.material = new THREE.MeshStandardMaterial({ color: '#0a0610', roughness: 0.4, emissive: '#100010' }); }
    });
  };
  // 標記（光照咒）：地上一圈淡淡的光
  const marks = {};
  const mark = (id, on) => {
    if (!marks[id]) { const [x, z] = GREEN_SPOT_AT[id]; const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.05, 32), new THREE.MeshBasicMaterial({ color: '#9fd0ff', transparent: true, opacity: 0.7 })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.03, z); root.add(m); marks[id] = m; }
    marks[id].visible = on;
  };
  let staring = 0;
  const stare = () => { staring = 1.6; };

  // ---- 第二幕：醫務室（x 62～74、z -9～9）----
  BEDS.forEach(([x, z], i) => put(hospitalBed({ bloody: i === 5 }), x, z, x < 68 ? Math.PI / 2 : -Math.PI / 2));
  const desk2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, 0.8), new THREE.MeshStandardMaterial({ color: '#5a4a3a', roughness: 0.8 })); put(desk2, 66, -7.6, 0, 0.425);
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), new THREE.MeshStandardMaterial({ color: '#c8a0ff', emissive: '#6a3aaa', emissiveIntensity: 0.8, roughness: 0.1 })); put(crystal, 67, -7.6, 0, 1.0);
  const medcab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2, 0.6), new THREE.MeshStandardMaterial({ color: '#e8e8e0', roughness: 0.5 })); put(medcab, 71.2, -8.65, 0, 1);
  const trap = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 1), new THREE.MeshStandardMaterial({ color: '#2a1e14', roughness: 0.9 })); put(trap, 69.5, -4, 0, 0.03);
  // 校醫歐文（活著的時候）：赫爾嘉夫人的模型換成白色制服
  let owen = null;
  loadCharacter('helga').then((c) => { owen = c.root; owen.traverse((o) => { if (o.isMesh) { o.material = [o.material].flat().map((m) => { const n = m.clone(); if (/robe|dress|cloth|coat/i.test(n.name)) n.color?.set('#e8e4da'); return n; }); if (o.material.length === 1) o.material = o.material[0]; } }); put(owen, 68, -7.3, 0); }).catch(() => {});
  // ---- 第二幕：舊檔案室（x 62～82、z 30～50，地下）----
  for (const z of ARCHIVE_ROWS) for (let k = 0; k < 6; k++) put(filingCabinet({ drawers: 5, open: (k + z) % 7 === 0 ? 2 : -1, height: 2.4 }), 66 + k * 2.2, z, 0);
  for (let i = 0; i < 8; i++) { const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.3), new THREE.MeshStandardMaterial({ color: '#e0d8c0', roughness: 0.9, side: THREE.DoubleSide })); sheet.rotation.x = -Math.PI / 2; sheet.rotation.z = Math.random() * 3; put(sheet, 77 + Math.random() * 2, 43.5 + Math.random() * 2, 0, 0.02); }
  const iron = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.2, 1.4), new THREE.MeshStandardMaterial({ color: '#3a3a40', metalness: 0.7, roughness: 0.5 })); put(iron, 80.6, 46, 0, 1.1);
  let corpse = false;
  const showCorpse = () => { if (corpse) return; corpse = true; buildVictim(root, 78.6, 46.4, [-1, 0], { seed: 77, model: 'helga', robe: '#d8d0c0' }).catch(() => {}); bloodTrail(root, { x: 80, z: 46.2 }, { x: 74, z: 45 }, { width: 0.8, seed: 78, hands: 2 }); bloodPool(root, 79.6, 46.3, 1.0, { seed: 79 }); };

  // ---- 第三幕：典禮廳的萬聖晚宴（x -34～-10、z 102～148）----
  const hall3 = dressHalloweenHall({ room: { x: [-34, -10], z: [102, 148], h: 14 }, tables: [0, 1, 2, 3].map((i) => [-30 + i * 5.5, 110, 140]), tableH: 0.8, drapeEvery: 6 }, drape);
  root.add(hall3.group); ticks.push(hall3.tick);
  const jugs = {};
  for (const j of JUGS) { const jg = juiceJug({ drugged: false }); jg.scale.setScalar(1.3); put(jg, j.x, j.z, 0, 0.8); jugs[j.k] = jg; const gs = gobletSet(4, { seed: j.k }); put(gs, j.x - 0.5, j.z + 1.2, Math.PI / 2, 0.8); }
  // 最裡面的吊燈（Q18：砸下來）
  const chand = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.08, 8, 32), new THREE.MeshStandardMaterial({ color: '#3a2a18', metalness: 0.7, roughness: 0.4 })); ring.rotation.x = Math.PI / 2; chand.add(ring);
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; const p = jackOLantern({ size: 0.3, face: k % 4 }); p.position.set(Math.cos(a) * 1.4, 0.05, Math.sin(a) * 1.4); chand.add(p); }
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 4, 6), new THREE.MeshStandardMaterial({ color: '#2a2420', metalness: 0.8 })); chain.position.y = 2; chand.add(chain);
  put(chand, CHANDELIER_FAR.x, CHANDELIER_FAR.z, 0, 9);
  // 側門（Q19）：門上一層黑紫色的封印
  const sd = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.6), new THREE.MeshStandardMaterial({ color: '#2a1030', emissive: '#300a40', emissiveIntensity: 0.8, roughness: 0.4, transparent: true, opacity: 0.85 })); put(sd, SIDE_DOOR.x + 0.08, SIDE_DOOR.z, Math.PI / 2, 1.3);
  // 第三幕 B：血腳印、校長的屍體、銜尾蛇浮雕
  const footTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#5a0606'; g.beginPath(); g.ellipse(32, 80, 18, 34, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(32, 26, 14, 18, 0, 0, 7); g.fill(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const prints = new THREE.Group(); prints.visible = false; root.add(prints);
  for (const [x, z, h] of FOOTPRINTS) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.32), new THREE.MeshStandardMaterial({ map: footTex, transparent: true, depthWrite: false, roughness: 0.3 })); m.rotation.x = -Math.PI / 2; m.rotation.z = -(h / 12) * Math.PI * 2; m.position.set(x, 0.02, z); prints.add(m); }
  const relief = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.18, 10, 24, Math.PI * 1.85), new THREE.MeshStandardMaterial({ color: '#4a6a4a', metalness: 0.4, roughness: 0.6 })); put(relief, -20, 102.25, 0, 1.6);
  let aldricDead = false;
  const killAldric = () => { if (aldricDead) return; aldricDead = true; prints.visible = true; buildVictim(root, -22, 108.4, [0, 1], { seed: 91, model: 'aldric', robe: '#3a1a2a' }).catch(() => {}); bloodPool(root, -22, 108.6, 1.4, { seed: 92 }); };
  // 大廳的地板：一圈 I～XII 的石磚（Q22）
  { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); g.strokeStyle = '#8a7a5a'; g.lineWidth = 4; g.beginPath(); g.arc(256, 256, 230, 0, 7); g.stroke(); g.fillStyle = '#c8b890'; g.font = '34px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].forEach((n, i) => { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; g.fillText(n, 256 + Math.cos(a) * 190, 256 + Math.sin(a) * 190); });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.CircleGeometry(3, 48), new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: 0.8 })); m.rotation.x = -Math.PI / 2; put(m, 0, 124, 0, 0.02); }

  // 每一格：燭光、大釜冒泡、找錯時植物抖一下
  let last = performance.now(), fetched = false;
  (function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    tickPumpkins(dt); for (const f of ticks) f(dt);
    if (staring > 0) { staring -= dt; const k = Math.max(0, staring); for (const g of Object.values(spotGroups)) g.rotation.y = Math.sin(now / 40) * 0.05 * k; }
    requestAnimationFrame(loop);
  })(last);

  return {
    mark, stare,
    hideOwen() { if (owen) owen.visible = false; }, // 歐文下去暗門之後就不在醫務室了
    showCorpse, // Q13 打開鐵櫃之後
    killAldric, // 第三幕 B 開始
    knockJug(k) { const j = jugs[k]; if (j) { j.rotation.z = Math.PI / 2; j.position.y = 0.85; } }, // Q17 打翻
    dropChandelier() { chand.position.y = 0.3; chand.rotation.z = 0.25; }, // Q18
    openSideDoor() { sd.visible = false; }, // Q19
    // 第一幕開始時：問伺服器溫室的異常（畫出來）
    async enterAct1() { if (fetched) return; fetched = true; const r = await conn.request({ t: 'peek', pid: 'Q06' }); if (r.t === 'peek') applyAnomalies(r.content.spots); },
  };
}

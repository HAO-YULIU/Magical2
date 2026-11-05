// 第二章的場景擺設（帳號二，2026-11-05）：萬聖節布置（大廳、交誼廳）、Q02 的南瓜燈、魔藥學教室、溫室（Q06 的異常、標記）。
// 房間的牆、地板由 greybox 依 data/world-ch1.mjs 的 ROOMS 自動蓋；這裡只放擺設。美術在 art/ch2/。
import * as THREE from 'three';
import { jackOLantern, tickPumpkins } from '../art/ch2/halloween.mjs';
import { drape, rollBook, blackPlant } from '../art/ch2/ch2props.mjs';
import { cauldron, blackboard, ingredientShelf, sprinklerRig } from '../art/ch2/ch2rooms.mjs';
import { PUMPKIN_GRID, PUMPKIN_AT, GREEN_SPOT_AT } from '../data/ch2-act1.mjs';

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
    // 第一幕開始時：問伺服器溫室的異常（畫出來）
    async enterAct1() { if (fetched) return; fetched = true; const r = await conn.request({ t: 'peek', pid: 'Q06' }); if (r.t === 'peek') applyAnomalies(r.content.spots); },
  };
}

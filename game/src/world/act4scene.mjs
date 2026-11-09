// 第二章第四幕的場景（2026-11-09）：地窖（酒桶、樓梯、配方鎖的鐵門、往塔樓的門）、諾克斯的儲藏室（桌上的點名簿副本）、
// 蝕巢（黑根、血）、宿舍塔樓（床、時鐘鎖、五層樓梯的燈）、往大門的走廊（柱子）、大門前庭（四個徽記台、鐵柵門與正在關上的結界）。
// 調查範圍在 data/act4-ch1.mjs（hidden：外觀由這裡畫）。這裡沒有答案。
import * as THREE from 'three';
import { CRESTS } from '../data/act4-ch1.mjs';
import { barrel, crestPedestal, gateBarrier, ingredientShelf } from '../art/ch2/ch2rooms.mjs';
import { rollBook } from '../art/ch2/ch2props.mjs';
import { bloodPool, bloodSplat, bloodTrail, wallSmear, bones, buildVictim } from '../art/gore.mjs';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });
const box = (parent, w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent.add(m); return m; };
const put = (parent, obj, x, z, { y = 0, ry = 0, s = 1 } = {}) => { obj.position.set(x, y, z); obj.rotation.y = ry; obj.scale.setScalar(s); parent.add(obj); return obj; };

function labelTex(lines, { w = 256, h = 256, bg = '#2a2420', fg = '#e8d8b0', font = 28 } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = `${font}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * font * 1.3));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function createAct4Scene(scene) {
  const root = new THREE.Group(); root.userData.static = true; scene.add(root);
  const wood = std('#4a3424'), dark = std('#2a1e16'), iron = std('#2a2724', { metalness: 0.7, roughness: 0.5 }), stone = std('#5a5650', { roughness: 0.95 });

  // ======== 地窖 ========
  // 西北角往上的樓梯（大家從大廳下來的地方；諾克斯在樓梯口蝕化）
  for (let i = 0; i < 8; i++) box(root, 2.4, 0.22, 0.35, stone, 202.6, 0.11 + 0.22 * i, 1.4 - i * 0.17);
  // 酒桶（五個躲藏點，每處三個桶）
  [[206, 8], [212, 8], [218, 8], [206, 16], [218, 16]].forEach(([x, z], i) => {
    put(root, barrel(), x - 0.45, z - 0.3, { s: 1.2 }); put(root, barrel(), x + 0.45, z - 0.3, { s: 1.2, ry: 1 });
    put(root, barrel({ lying: true }), x - 0.6, z + 0.5, { ry: i % 2 ? 0.2 : -0.2, s: 1.1 });
  });
  // 儲藏櫃（躲藏點）
  { const g = new THREE.Group(); box(g, 1.6, 2, 0.8, dark, 0, 1, 0); box(g, 0.02, 1.8, 0.02, iron, 0, 1, 0.41); box(g, 0.06, 0.2, 0.04, iron, 0.12, 1.1, 0.42); box(g, 0.06, 0.2, 0.04, iron, -0.12, 1.1, 0.42); put(root, g, 213, 24.1, { ry: Math.PI }); }
  // 配方鎖的鐵門（東牆）：四個凹槽、上面刻字
  { const g = new THREE.Group(); box(g, 0.12, 2.3, 1.6, iron, 0, 1.15, 0);
    for (let i = 0; i < 4; i++) box(g, 0.06, 0.22, 0.22, std('#0a0a0a'), -0.08, 1.1, -0.54 + i * 0.36);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.4), new THREE.MeshStandardMaterial({ map: labelTex(['先做讓人看不見的，', '再做讓人醒來的。'], { w: 512, h: 160, bg: '#1e1c1a', fg: '#c8b890', font: 40 }) }));
    plate.position.set(-0.07, 1.75, 0); plate.rotation.y = -Math.PI / 2; g.add(plate); put(root, g, 224.9, 4); }
  // 往塔樓的木門（要說口令）＋銅牌
  { const g = new THREE.Group(); box(g, 0.14, 2.4, 1.8, wood, 0, 1.2, 0); box(g, 0.04, 0.24, 0.5, std('#8a6a2c', { metalness: 0.8, roughness: 0.35 }), -0.09, 1.6, 0); put(root, g, 224.9, 18.5); }
  // 牆上的火把（只有光、沒有火焰模型）
  for (const [x, z] of [[200.3, 12], [224.7, 11], [212, 0.3], [212, 24.7]]) { const l = new THREE.PointLight('#ff9a50', 0.9, 9, 1.6); l.position.set(x, 2.4, z); root.add(l); box(root, 0.12, 0.4, 0.12, dark, x, 2.1, z); }
  // 諾克斯蝕化的地方：樓梯口的血、散了一地的點名簿紙頁
  bloodPool(root, 211.4, 21.6, 1.1, { seed: 41 }); bloodSplat(root, 213.2, 0, 22.4, { size: 1.4, name: 'spray', spin: 0.7 });
  bloodTrail(root, { x: 211.4, z: 21.6 }, { x: 205, z: 24.4 }, { width: 0.7, seed: 42, hands: 2 });
  const paper = std('#d8ccb0', { side: THREE.DoubleSide });
  for (let i = 0; i < 9; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.28), paper); p.rotation.set(-Math.PI / 2, 0, i * 1.7); p.position.set(209.5 + ((i * 37) % 50) / 10, 0.012 + i * 0.001, 19.5 + ((i * 53) % 40) / 10); root.add(p); }

  // ======== 諾克斯的儲藏室 ========
  box(root, 1.4, 0.8, 0.7, wood, 229.5, 0.4, 2); // 桌子（點名簿副本放在上面）
  put(root, rollBook({ seed: 13 }), 229.5, 2, { y: 0.81, s: 1.6 });
  put(root, ingredientShelf(), 228, 7.6, { ry: Math.PI });
  { const l = new THREE.PointLight('#c8e0a0', 0.8, 7, 1.6); l.position.set(229.5, 2.6, 3); root.add(l); }

  // ======== 蝕巢（地窖北邊） ========
  const rootMat = std('#0a0608', { roughness: 0.4, emissive: '#180208' });
  for (let i = 0; i < 30; i++) {
    const len = 2 + Math.random() * 4, m = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.16, len, 5), rootMat);
    m.position.set(200.5 + Math.random() * 7, Math.random() * 3.5, 25.8 + Math.random() * 6.8); m.rotation.set(Math.random() * 2, Math.random() * 3, Math.random() * 2); root.add(m);
  }
  bloodPool(root, 204, 30, 1.3, { seed: 21 }); bloodPool(root, 201.6, 27.2, 0.6, { seed: 22 });
  bloodSplat(root, 207.82, 1.4, 30.5, { size: 1.3, name: 'drip', normal: [-1, 0, 0], spin: Math.PI });
  bloodSplat(root, 202.5, 1.1, 32.82, { size: 1.0, name: 'drip', normal: [0, 0, -1], spin: Math.PI });
  bloodTrail(root, { x: 204, z: 25.4 }, { x: 204, z: 29.4 }, { width: 0.9, seed: 23, hands: 4 });
  wallSmear(root, 200.18, 1.2, 29, { normal: [1, 0, 0], w: 1.2, seed: 33 });
  bones(root, 201.4, 31.6, { n: 10, spread: 1.2, seed: 24 });
  let victimAsked = false;
  const wakeNest = () => { if (victimAsked) return; victimAsked = true; buildVictim(root, 206.6, 31.4, [-1, 0]).catch((e) => console.warn('蝕巢屍體載入失敗', e)); };

  // ======== 宿舍塔樓 ========
  for (const [x, z] of [[227, 13], [235, 23], [227, 23]]) { // 床（躲藏點：床底下）
    const g = new THREE.Group(); box(g, 1, 0.12, 2, wood, 0, 0.55, 0); for (const [dx, dz] of [[-0.45, -0.95], [0.45, -0.95], [-0.45, 0.95], [0.45, 0.95]]) box(g, 0.08, 0.55, 0.08, dark, dx, 0.275, dz);
    box(g, 0.95, 0.12, 1.9, std('#6a5a7a'), 0, 0.67, 0.02); box(g, 1, 0.9, 0.08, dark, 0, 0.9, -1); box(g, 0.4, 0.1, 0.3, std('#d8d0c0'), 0, 0.78, -0.7);
    put(root, g, x, z);
  }
  // 門上的時鐘鎖（夫人塞了紙條）
  { const g = new THREE.Group(); const face = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), new THREE.MeshStandardMaterial({ map: labelTex(['XII', '', 'IX   ⊙   III', '', 'VI'], { bg: '#e8dcc0', fg: '#2a2018', font: 30 }) }));
    face.position.z = 0.05; g.add(face); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.04, 8, 32), std('#8a6a2c', { metalness: 0.8, roughness: 0.35 })); rim.position.z = 0.05; g.add(rim);
    box(g, 0.18, 0.12, 0.01, std('#f0ead8'), 0.3, -0.5, 0.06); put(root, g, 231, 24.92, { y: 1.6, ry: Math.PI }); }
  // 旋轉樓梯（東南角）＋五層的燈：Q26 解開時全亮
  const stairC = [234.3, 15.2], lamps = [];
  { const col = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 9, 10), stone); col.position.set(stairC[0], 4.5, stairC[1]); root.add(col);
    for (let i = 0; i < 24; i++) { const a = i * 0.5, y = 0.18 + i * 0.36; const s = box(root, 1.5, 0.1, 0.5, stone, stairC[0] + Math.cos(a) * 0.95, y, stairC[1] + Math.sin(a) * 0.95); s.rotation.y = -a; }
    for (let f = 0; f < 5; f++) { const y = 1.6 + f * 1.7, glass = new THREE.MeshStandardMaterial({ color: '#40382a', emissive: '#ffcc66', emissiveIntensity: f % 2 ? 1.5 : 0 });
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), glass); m.position.set(236.6, y, 16.6); root.add(m); lamps.push(glass); } }
  // 開關面板（東牆）
  { const g = new THREE.Group(); box(g, 0.08, 1.4, 0.6, wood, 0, 0.9, 0); for (let f = 0; f < 5; f++) box(g, 0.06, 0.12, 0.2, std('#8a6a2c', { metalness: 0.8, roughness: 0.35 }), -0.06, 0.4 + f * 0.25, 0); put(root, g, 236.9, 14); }
  { const l = new THREE.PointLight('#ffb070', 0.7, 10, 1.6); l.position.set(231, 3, 18); root.add(l); }
  // 被留下來的低年級生的鞋子、一根掉在地上的魔杖
  box(root, 0.12, 0.08, 0.26, std('#2a1a14'), 229.2, 0.04, 20.3); box(root, 0.12, 0.08, 0.26, std('#2a1a14'), 229.5, 0.04, 20.1).rotation.y = 0.5;

  // ======== 往大門的走廊：柱子 ========
  for (const [x, z] of [[243, 16.6], [251, 19.4]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 5, 12), stone); c.position.set(x, 2.5, z); root.add(c); }

  // ======== 大門前庭 ========
  const crests = {};
  for (const [house, [x, z]] of Object.entries(CRESTS)) crests[house] = put(root, crestPedestal(house), x, z);
  const gate = put(root, gateBarrier({ width: 8, height: 6 }), 276.6, 20, { ry: -Math.PI / 2 });
  const gateGlow = new THREE.PointLight('#a060ff', 1.4, 18, 1.4); gateGlow.position.set(274, 3, 20); root.add(gateGlow);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(3, 20, 14), new THREE.MeshBasicMaterial({ color: '#e8ecff' })); moon.position.set(300, 40, 20); root.add(moon);
  const moonlight = new THREE.DirectionalLight('#b8c8ff', 0); moonlight.position.set(300, 40, 20); moonlight.target.position.set(267, 0, 20); root.add(moonlight, moonlight.target);

  let t = 0, lampsOn = false;
  return {
    // close：結界關上的程度 0～1（倒數越少越關）
    frame(dt, zone, { lit = false, close = 0.5 } = {}) {
      t += dt;
      if (zone === 'a4_cellar' || zone === 'a4_nest') wakeNest();
      moonlight.intensity = zone === 'a4_gate' ? 1.2 : 0;
      if (lit !== lampsOn) { lampsOn = lit; lamps.forEach((m, i) => { m.emissiveIntensity = lit || i % 2 ? 1.5 : 0; }); }
      if (zone === 'a4_gate' || zone === 'a4_pass') { gate.userData.close(0.35 + 0.65 * close); gateGlow.intensity = 1.2 + Math.sin(t * 3) * 0.4; }
    },
    crest(house, on) { crests[house]?.userData.light(on); },
  };
}

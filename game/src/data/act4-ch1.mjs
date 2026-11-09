// 第四幕：守夜人（P26～P29、蝕巢）的場景與線索。依 docs/03-chapter1.md、docs/04-map-ch1.md。這裡沒有答案（答案在伺服器）。
// 逃亡路線：圖書館入口大廳 → 旁邊通道（往東）→ 鐘塔底下的機械室 ⇄ 蝕巢 → 屋頂通道（往北）。
const L = (zh, en) => ({ zh, en });

// ===== 第二章第四幕（2026-11-09）：地窖 → 諾克斯的儲藏室 → 宿舍塔樓 → 往大門的走廊 → 大門前庭；地窖旁邊是蝕巢 =====
export const A4_ROOMS = [
  { id: 'a4_cellar', name: L('地窖', 'The Cellar'), x: [200, 225], z: [0, 25], h: 5, floor: 'stone', light: '#6a5a4a' },
  { id: 'a4_store', name: L('諾克斯的儲藏室', 'Knox’s Storeroom'), x: [225, 231], z: [0, 8], h: 4, floor: 'stone', light: '#5a6a5a' },
  { id: 'a4_nest', name: L('蝕巢', 'The Blight Nest'), x: [200, 208], z: [25, 33], h: 5, floor: 'stone', light: '#3a0a12' },
  { id: 'a4_tower', name: L('宿舍塔樓', 'The Dormitory Tower'), x: [225, 237], z: [12, 25], h: 9, floor: 'wood', light: '#a08a6a' },
  { id: 'a4_pass', name: L('往大門的走廊', 'The Corridor to the Gate'), x: [237, 257], z: [16, 20], h: 5, floor: 'stone', light: '#5a5a7a' },
  { id: 'a4_gate', name: L('大門前庭', 'The Gate Forecourt'), x: [257, 277], z: [5, 35], h: 12, floor: 'stone', sky: true, light: '#8aa0d0' },
];

export const A4_DOORS = [
  { id: 'cellar-store', a: 'a4_cellar', b: 'a4_store', x: 225, z: 4, w: 1.6, axis: 'z', lock: { puzzle: 'Q23' } },
  { id: 'cellar-nest', a: 'a4_cellar', b: 'a4_nest', x: 204, z: 25, w: 1.8, axis: 'x', lock: null },
  { id: 'cellar-tower', a: 'a4_cellar', b: 'a4_tower', x: 225, z: 18.5, w: 1.8, axis: 'z', lock: { puzzle: 'Q24' } },
  { id: 'tower-pass', a: 'a4_tower', b: 'a4_pass', x: 237, z: 18, w: 1.8, axis: 'z', lock: { puzzle: 'Q26' } },
  { id: 'pass-gate', a: 'a4_pass', b: 'a4_gate', x: 257, z: 18, w: 2.4, axis: 'z', lock: null },
];

// 守夜人從圖書館的樓梯下來；大家站在大廳中間
export const A4_SPAWN = { x: 203, z: 3, yaw: Math.PI }; // 從大廳的樓梯下到地窖的西北角
// 單人被抓到時，在這一區的入口復活
export const CHECKPOINTS = {
  a4_cellar: { x: 203, z: 3, yaw: Math.PI },
  a4_store: { x: 226.5, z: 4, yaw: -Math.PI / 2 },
  a4_tower: { x: 226.5, z: 18.5, yaw: -Math.PI / 2 },
  a4_pass: { x: 238.5, z: 18, yaw: -Math.PI / 2 },
  a4_gate: { x: 258.5, z: 18, yaw: -Math.PI / 2 },
  a4_nest: { x: 204, z: 23.5, yaw: Math.PI },
};
export const NEST_SPOT = { x: 204, z: 30 };        // 被抓走的人被綁在這裡（地窖旁邊的蝕巢）
export const NEST_EXIT = { x: 204, z: 23.2, yaw: Math.PI }; // 被救出來後站的地方（地窖這一側）

// 屋頂的符文石板（P29）：第 0 排在北邊（終點），第 5 排在南邊（起點）；每塊 1.6 公尺
export const ROOF = [
  'ᚠᛖᛗᛞᛚᚱ',
  'ᛟᚾᛚᛗᛁᛖ',
  'ᛁᛏᛖᚱᚾᚲ',
  'ᚱᛗᚾᛖᛚᚢ',
  'ᚷᛁᛚᛊᛁᛉ',
  'ᛁᛗᛒᚹᛗᚺ',
];
export const ROOF_AT = { x0: 150.2, z0: -40, tile: 1.6 }; // 石板左上角（西北）
export const roofCell = (x, z) => {
  const c = Math.floor((x - ROOF_AT.x0) / ROOF_AT.tile), r = Math.floor((z - ROOF_AT.z0) / ROOF_AT.tile);
  return c >= 0 && c < 6 && r >= 0 && r < 6 ? [c, r] : null;
};

// P26：四根拉桿各切換兩根門閂；一開始第 1、3 根鎖著（這是題目本身，不是答案）
export const LEVERS = { A: [1, 2], B: [2, 3], C: [3, 4], D: [1, 4] };
export const BOLTS_LOCKED = [1, 3];
// P27：驅動輪 12 齒、順時針；三根空軸。軸距（兩個齒輪的半徑加起來）是固定的，齒輪半徑＝齒數 ÷ 6
export const GEAR_RACK = [18, 24, 30, 36, 48];
export const AXLE_GAPS = [6, 7, 9];
// P28：牆上的童謠歌詞（第一句），長短符號只剩第 1、4、7 個字
export const LYRIC = L(['提', '著', '綠', '燈', '走', '長', '廊'], ['Green', 'lamp', 'glow', 'ing', 'down', 'the', 'hall']); // docs/06-audio-ch1.md
export const LYRIC_MARKS = { 0: 'L', 3: 'L', 6: 'L' };

// P32 稻草人：機械室地上六塊刻羅馬數字的石板（I～VI），稻草人一開始站在角落。不看他的時候，他依 SCARECROW.route 換一塊石板站，走完一輪回到角落
export const SCARECROW = {
  corner: [163, 17.2],
  slabs: [[149, 4], [162.2, 8.6], [150.2, 14.6], [156, 15.8], [161.6, 12.8], [148.6, 9.8]], // I、II、III、IV、V、VI
  route: [3, 0, 5, 1],
};

// 大門前庭的四個學院徽記台（Q27）
export const CRESTS = { eldrin: [261, 9], grimoire: [273, 9], belmont: [261, 31], ouroboros: [273, 31] };
export const A4_THINGS = [
  // ---- 地窖：酒桶、儲藏櫃（躲藏點）；配方鎖（Q23） ----
  ...[[206, 8], [212, 8], [218, 8], [206, 16], [218, 16]].map(([x, z], i) => ({ id: `barrel_hide${i}`, room: 'a4_cellar', kind: 'hide', x, z, size: [1.4, 1.6, 1.4], solid: false, hidden: true, label: L('酒桶後面（躲起來）', 'Behind the barrels (hide)') })),
  { id: 'cellar_cab', room: 'a4_cellar', kind: 'hide', x: 213, z: 24, size: [1.6, 2, 0.8], solid: false, hidden: true, label: L('儲藏櫃裡面（躲起來）', 'Inside the storage cupboard (hide)') },
  { id: 'q23_lock', hidden: true, room: 'a4_cellar', kind: 'puzzle', puzzle: 'Q23', x: 224.6, z: 4, size: [0.3, 2.2, 1.6], solid: false, label: L('鐵門上的配方鎖', 'The recipe lock on the iron door') },
  { id: 'q24_book', hidden: true, room: 'a4_store', kind: 'puzzle', puzzle: 'Q24', x: 229.5, z: 2, size: [0.8, 1, 0.6], solid: true, label: L('桌上的點名簿副本', 'The copy of the roll book on the desk') },
  { id: 'q24_door', hidden: true, room: 'a4_cellar', kind: 'puzzle', puzzle: 'Q24', panel: 'towerdoor', x: 224.6, z: 18.5, size: [0.3, 2.4, 1.8], solid: false, label: L('往宿舍塔樓的門（要說口令）', 'The door to the dormitory tower (speak the password)') },
  // ---- 宿舍塔樓：赫爾嘉夫人的暗號（Q25）、樓梯的燈（Q26）、床底下（躲藏點） ----
  { id: 'q25_clock', hidden: true, room: 'a4_tower', kind: 'puzzle', puzzle: 'Q25', x: 231, z: 24.6, size: [1.2, 1.2, 0.3], y: 1, solid: false, label: L('門上的時鐘鎖（夫人塞了一張紙條）', 'A clock-shaped lock (Madam Helga left a note)') },
  { id: 'q26_lights', hidden: true, room: 'a4_tower', kind: 'puzzle', puzzle: 'Q26', x: 236.6, z: 14, size: [0.3, 1.6, 1.6], solid: false, label: L('樓梯的燈開關（五層）', 'The stair-light switches (five floors)') },
  ...[[227, 13], [235, 23], [227, 23]].map(([x, z], i) => ({ id: `bed_hide${i}`, room: 'a4_tower', kind: 'hide', x, z, size: [1, 0.7, 2], solid: false, hidden: true, label: L('床底下（躲起來）', 'Under a bed (hide)') })),
  // ---- 走廊：柱子後面 ----
  ...[[243, 16.6], [251, 19.4]].map(([x, z], i) => ({ id: `pillar_hide${i}`, room: 'a4_pass', kind: 'hide', x, z, size: [1, 3, 0.8], solid: false, hidden: true, label: L('柱子後面（躲起來）', 'Behind a pillar (hide)') })),
  // ---- 大門前庭：四學院徽記台（Q27） ----
  ...Object.entries(CRESTS).map(([house, [x, z]]) => ({ id: `crest_${house}`, room: 'a4_gate', kind: 'crest', house, x, z, size: [1.2, 1.3, 1.2], solid: true, hidden: true,
    label: L(`${{ eldrin: '艾爾德林', grimoire: '格里莫瓦', belmont: '貝爾蒙特', ouroboros: '烏洛波斯' }[house]}的徽記台（施咒點亮）`, `The ${house[0].toUpperCase() + house.slice(1)} crest (cast to light it)`) })),
  { id: 'gate', hidden: true, room: 'a4_gate', kind: 'prop', x: 276.6, z: 20, size: [0.6, 6, 8], solid: true, label: L('學校大門（結界正在關上）', 'The school gate (the barrier is closing)'),
    text: L('鐵柵門外，紫色的結界從兩邊慢慢往中間合起來。四個學院的徽記同時亮起，才擋得住它。', 'Beyond the iron gate, a violet barrier is closing in from both sides. Only all four house crests lit at once can hold it back.') },
  // ---- 蝕巢：被綁住的同伴 ----
  { id: 'roots', hidden: true, room: 'a4_nest', kind: 'nest', x: 204, z: 30, size: [2.4, 2, 2.4], solid: false, label: L('纏住同伴的黑根', 'The black roots binding your friend') },
];

// 守夜人的巡邏點（每一區幾個，他會在玩家所在的區域附近巡邏）
export const WARDEN_POINTS = {
  a4_cellar: [[204, 4], [221, 4], [221, 21], [204, 21], [212, 12]],
  a4_store: [[228, 4]],
  a4_tower: [[228, 15], [234, 15], [234, 22], [228, 22]],
  a4_pass: [[240, 18], [248, 18], [255, 18]],
  a4_gate: [[260, 12], [274, 12], [274, 28], [260, 28], [267, 20]],
};
export const WARDEN_START = { x: 212, z: 22, zone: 'a4_cellar' }; // 諾克斯從地窖的樓梯口蝕化，往這邊走過來
// 守夜人的行動（docs/04-map-ch1.md）：速度以玩家走路 2.0、跑步 3.6 公尺／秒為準
export const WARDEN = {
  // 第二章：諾克斯教授（docs/13-map-ch2.md 第三節）：走得比守夜人慢、看得比較清楚、聽得比較差；點名時被點到的人被看到，她會衝過去（callBoost）
  patrol: 1.2, chase: 3.1, view: 15, fov: 90, notice: 1.0, hearRun: 8, hearWalk: 3, lose: 3,
  reach: 1.1, findHidden: 1.5, stun: 4, repel: 5,
  calm: 60, hunt: 60, rest: 75, escapes: 2, callBoost: 1.12,
  rollEvery: [45, 60], rollFor: 10, // 每 45～60 秒點一次名；被點到的人 10 秒內不能被她看到
};

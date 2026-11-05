// 第二章《萬聖夜》序幕＋第一幕的場景配置（帳號二，2026-11-05）。依 docs/12-chapter2.md、13-map-ch2.md、14-puzzles-ch2.md。
// 格式跟 world-ch1.mjs 一樣。這裡只有位置、標籤、線索，沒有答案（答案在 data/puzzles/ch2.mjs，伺服器判斷）。
// 序幕：沿用第一章的四間交誼廳（Q01 起霧的鏡子）、大廳（Q02 南瓜燈）。第一幕：新做的魔藥學教室（K1）與溫室（K2）。

const L = (zh, en) => ({ zh, en });

export const CH2_ROOMS = [
  { id: 'potions', name: L('魔藥學教室', 'The Potions Classroom'), x: [30, 45], z: [-10, 10], h: 6, floor: 'stone', light: '#7a9a6a' },
  { id: 'greenhouse', name: L('溫室', 'The Greenhouse'), x: [45, 57], z: [-12.5, 12.5], h: 7, floor: 'stone', light: '#8ab0a0' },
];
export const CH2_DOORS = [
  { id: 'potions-greenhouse', a: 'potions', b: 'greenhouse', x: 45, z: 0, w: 2.4, axis: 'z', lock: { puzzle: 'Q05' } },
];

// 序幕從自己學院的交誼廳出發（跟第一章第一幕同一個位置）；第一幕從魔藥學教室的門口
export const CH2_SPAWNS = {
  prologue: {
    eldrin: { x: 20, z: 0, yaw: Math.PI / 2 },
    grimoire: { x: -20, z: 0, yaw: -Math.PI / 2 },
    belmont: { x: -4.5, z: 20, yaw: 0 },
    ouroboros: { x: 4.5, z: 20, yaw: 0 },
  },
  hall: { x: 0, z: 136, yaw: 0 },
  act1: { x: 37.5, z: 8.5, yaw: 0 },
};

// 序幕：Q01 的鏡子位置（沿用第一章的古鏡）
const DORM_MIRRORS = [
  { house: 'eldrin', x: 19.5, z: 6.84 }, { house: 'grimoire', x: -19.5, z: 6.84 },
  { house: 'belmont', x: -1.6, z: 9.16 }, { house: 'ouroboros', x: 7.6, z: 9.16 },
];
// Q02：大廳公告欄前的 3×3 南瓜燈（中間那顆被打爛了）。eye：tri 三角／round 圓／moon 彎月；mouth：grin 笑／fang 尖牙／stitch 縫起來
export const PUMPKIN_GRID = [
  [['round', 'grin'], ['moon', 'fang'], ['tri', 'stitch']],
  [['moon', 'stitch'], null, ['round', 'fang']],
  [['tri', 'fang'], ['round', 'stitch'], ['moon', 'grin']],
];
export const PUMPKIN_AT = { x: 0, z: 112, gap: 0.8 };
// Q06：溫室裡 8 個可能被動過手腳的地方（位置），以及門口的植物清單（玩家拿來比對）
export const GREEN_SPOT_AT = {
  fern: [47.5, -9], mandrake_row: [47.5, -3], moonwort: [47.5, 3], venus: [47.5, 9],
  nightshade: [54.5, -9], ivy: [56.6, -3], cactus: [54.5, 3], lily: [54.5, 9],
};
export const GREEN_LIST = L(
  '第一排：蕨類 3 盆、曼德拉草 5 株、月光草 4 盆、捕蠅草 2 盆。第二排：顛茄 3 株、牆上的常春藤一片、仙人掌 4 盆、水缸裡的睡蓮 3 朵。最裡面：黑色植物 1 盆（勿碰）。',
  'Row one: 3 ferns, 5 mandrakes, 4 pots of moonwort, 2 flytraps. Row two: 3 nightshade, the ivy on the wall, 4 cacti, 3 lilies in the tank. At the back: 1 black plant (do not touch).');

// 諾克斯教授（還沒蝕化）：在魔藥學教室巡邏；被她的燈照到會被罵、送回教室門口（跟第一章赫爾嘉夫人一樣的規則）
export const CH2_PATROL = {
  room: 'potions', period: 40,
  path: [[32.5, -7.5], [42.5, -7.5], [42.5, 6], [32.5, 6]],
  view: 7, fov: 60,
};

const HOUSE_CLUE = {
  eldrin: L('玻璃屋頂上的霧。光照咒照下去，霧裡浮出星座：它們都指向最裡面那一盆——「黑色的」。', 'Mist on the glass roof. Under the light spell, constellations appear in it — all pointing at the pot at the very back: “the black one.”'),
  grimoire: L('植物標籤背面有隱形墨水，寫著兩個字：「會吃」。', 'Invisible ink on the back of a plant label: “eats.”'),
  belmont: L('泥地上有腳印，半夜有人來過。腳印走到最裡面那盆，然後……只剩一隻鞋。', 'Footprints in the mud — someone came at night. They lead to the pot at the back, and then… only one shoe is left.'),
  ouroboros: L('澆水壺裡的水被下了藥，聞起來是生肉的味道——有人在餵它。它吃「人」。', 'The water in the can has been dosed. It smells of raw meat — someone has been feeding it. It eats “people.”'),
};

export const CH2_THINGS = [
  // ---------- 序幕 ----------
  ...DORM_MIRRORS.map((m) => ({ id: `q01_${m.house}`, hidden: true, room: `dorm_${m.house}`, kind: 'puzzle', puzzle: 'Q01', x: m.x, z: m.z, size: [1.0, 1.7, 0.4], y: 0.7, solid: false,
    label: L('起霧的鏡子', 'The fogged mirror') })),
  ...['eldrin', 'grimoire', 'belmont', 'ouroboros'].map((h) => {
    const r = { eldrin: [9.4, 0], grimoire: [-9.4, 0], belmont: [-4.5, 9.4], ouroboros: [4.5, 9.4] }[h];
    return { id: `q01_exit_${h}`, room: `dorm_${h}`, kind: 'goto', to: CH2_SPAWNS.hall, needs: 'Q01', x: r[0], z: r[1], size: [0.4, 2.4, 2.4], solid: false,
      label: L('下樓到大廳', 'Go down to the Great Hall') };
  }),
  { id: 'q02_pumpkins', room: 'hall', kind: 'puzzle', puzzle: 'Q02', x: PUMPKIN_AT.x, z: PUMPKIN_AT.z + 1.2, size: [2.8, 1.2, 1], solid: false,
    label: L('一整排南瓜燈（中間那顆被打爛了）', 'A rack of jack-o’-lanterns (the middle one is smashed)') },
  { id: 'q02_board', room: 'hall', kind: 'prop', x: 3.2, z: 111, size: [2, 2, 0.3], y: 0.8, solid: false, label: L('公告欄', 'The notice board'),
    text: L('「萬聖晚宴：十月三十一日晚上七點，典禮廳。」下面一張舊公告被指甲刮過：「守夜人因病退休」。', '“Halloween Feast: 31 October, seven o’clock, the Ceremony Hall.” Beneath it, an old notice has been clawed at: “The Night Warden has retired due to illness.”') },

  // ---------- 第一幕：魔藥學教室 ----------
  { id: 'q03_cauldron', room: 'potions', kind: 'puzzle', puzzle: 'Q03', x: 37.5, z: -3.5, size: [1.2, 1.2, 1.2], solid: true, label: L('講台旁的大釜', 'The cauldron by the lectern') },
  { id: 'board_riddle', room: 'potions', kind: 'prop', x: 34.5, z: -9.7, size: [3, 1.4, 0.2], y: 0.8, solid: false, label: L('黑板：月影藥水', 'The blackboard: Moonshade Draught'),
    text: L('「月影藥水：先放會哭的，再放會叫的，最後放沉默的；每放一樣，攪到顏色變成下一個月相。」', '“Moonshade Draught: first the one that weeps, then the one that screams, last the one that keeps silent; after each, stir until the colour becomes the next phase of the moon.”') },
  { id: 'q08_board', room: 'potions', kind: 'puzzle', puzzle: 'Q08', x: 40.5, z: -9.7, size: [3, 1.4, 0.2], y: 0.8, solid: false, label: L('黑板被擦過的地方', 'The wiped half of the blackboard') },
  { id: 'timetable', room: 'potions', kind: 'prop', x: 43.6, z: -9.7, size: [0.8, 0.6, 0.2], y: 1.6, solid: false, label: L('黑板角落的課表', 'The timetable in the corner of the board'),
    text: L('今天的課：①月光草 ②蝙蝠翅 ③銀粉。', 'Today’s lesson: ① moonwort ② bat wing ③ silver dust.') },
  { id: 'shelf', room: 'potions', kind: 'prop', x: 30.4, z: -3, size: [0.5, 2, 1.8], solid: true, label: L('材料架', 'The ingredient shelf'),
    text: L('標籤：曼德拉草（拔起來會哭）、尖叫蘑菇（一碰就尖叫）、啞蛇的鱗（一點聲音都沒有）、月光草、蝙蝠翅、銀粉。最下面一層有一瓶沒有標籤的黑色汁液。', 'Labels: mandrake (weeps when pulled), shrieking mushroom (screams at a touch), mute serpent scale (makes no sound at all), moonwort, bat wing, silver dust. On the bottom shelf, an unlabelled jar of black sap.') },
  { id: 'jar', room: 'potions', kind: 'prop', x: 30.6, z: 2.5, size: [0.4, 0.5, 0.4], y: 0.4, solid: false, label: L('沒有標籤的瓶子', 'The unlabelled jar'),
    text: L('黑色、黏稠，聞起來跟第一章圖書館裡的黑根一樣。是黑根的汁。', 'Black and viscous. It smells exactly like the black roots in the library. Black-root sap.') },
  { id: 'clock', room: 'potions', kind: 'prop', x: 44.7, z: 3, size: [0.2, 0.8, 0.8], y: 2, solid: false, label: L('牆上的鐘', 'The wall clock'),
    text: L('鐘面上多了一格「XIII」，指針被人停在那一格上。十三點。', 'The face has an extra numeral — XIII — and the hands have been stopped on it. Thirteen o’clock.') },
  { id: 'diary', room: 'potions', kind: 'prop', x: 41, z: -6.4, size: [0.5, 0.2, 0.4], y: 0.9, solid: false, label: L('諾克斯的日記（講桌上）', 'Knox’s diary (on the desk)'),
    text: L('「……解藥的最後一步，要念出她的名字。可是我已經想不起來，她叫什麼了。」', '“…The last step of the cure is to speak her name. But I can no longer remember what she was called.”') },
  { id: 'q04_rollbook', room: 'potions', kind: 'puzzle', puzzle: 'Q04', x: 37.5, z: -7, size: [0.8, 1.2, 0.6], solid: true, label: L('講台上的點名簿', 'The roll book on the lectern') },
  { id: 'q05_cabinet', room: 'potions', kind: 'puzzle', puzzle: 'Q05', x: 44.6, z: -5, size: [0.6, 2.2, 1.4], solid: true, label: L('諾克斯上鎖的櫃子', 'Knox’s locked cabinet') },
  ...[[33, 0], [42, 0], [33, -5.5]].map(([x, z], i) => ({ id: `cauldron_hide${i}`, room: 'potions', kind: 'hide', x, z, size: [1.4, 1.2, 1.4], solid: false, label: L('大釜後面（躲起來）', 'Behind a cauldron (hide)') })),
  { id: 'desk_hide', room: 'potions', kind: 'hide', x: 41, z: -7.8, size: [1.6, 1, 0.9], solid: false, label: L('講桌底下（躲起來）', 'Under the desk (hide)') },

  // ---------- 第一幕：溫室 ----------
  { id: 'q06_list', room: 'greenhouse', kind: 'prop', x: 45.6, z: 2.4, size: [0.3, 1.2, 0.9], y: 0.6, solid: false, label: L('門口的植物清單', 'The plant list by the door'), text: GREEN_LIST },
  ...Object.entries(GREEN_SPOT_AT).map(([id, [x, z]]) => ({ id: `q06_${id}`, room: 'greenhouse', kind: 'greenspot', spot: id, x, z, size: [1.6, 1, 1.6], solid: false,
    label: L('仔細看看這裡（光照咒標記不對勁的地方）', 'Look closely here (mark it with the light spell if something is wrong)') })),
  ...Object.entries(HOUSE_CLUE).map(([house, text], i) => ({ id: `q07_${house}`, room: 'greenhouse', kind: 'houseclue', house, x: 51, z: -6 + i * 4, size: [0.8, 1, 0.8], solid: false,
    label: L(`${{ eldrin: '艾爾德林', grimoire: '格里莫瓦', belmont: '貝爾蒙特', ouroboros: '烏洛波斯' }[house]}的線索`, `A clue for ${house[0].toUpperCase() + house.slice(1)}`), text })),
  { id: 'sprinkler_table', room: 'greenhouse', kind: 'prop', x: 56.6, z: -9, size: [0.3, 1, 1.2], y: 1, solid: false, label: L('牆上的澆水時刻表', 'The watering timetable on the wall'),
    text: L('甲組每 4 分噴一次、乙組每 6 分、丙組每 9 分、丁組每 12 分。今晚四組一起噴的時間：8 點整。旁邊是園藝筆記：「四組同時停下的那一刻，它會縮回土裡。」', 'Group A sprays every 4 minutes, B every 6, C every 9, D every 12. All four sprayed together tonight at 8:00 sharp. A gardener’s note beside it: “At the moment all four stop together, it shrinks back into the soil.”') },
  { id: 'q09_lever', room: 'greenhouse', kind: 'puzzle', puzzle: 'Q09', x: 51, z: -11.6, size: [1.6, 1.6, 0.6], solid: true, label: L('後門的拉桿（黑色植物的根纏在鐵柵上）', 'The back-door lever (black roots coil round the bars)') },
];

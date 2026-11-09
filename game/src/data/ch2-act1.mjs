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
  act1: { x: 37.5, z: 9.2, yaw: 0 },
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
export const CH2_PATROL = { // 教室前半（講台那一側）；門口（南邊）不會被照到，剛進來不會馬上被抓
  room: 'potions', period: 40,
  path: [[32.5, -8.5], [42.5, -8.5], [42.5, 1.5], [32.5, 1.5]],
  view: 6, fov: 60,
};

const HOUSE_CLUE = {
  eldrin: L('玻璃屋頂上的霧。光照咒照下去，霧裡浮出星座：它們都指向最裡面那一盆——「黑色的」。', 'Mist on the glass roof. Under the light spell, constellations appear in it — all pointing at the pot at the very back: “the black one.”'),
  grimoire: L('植物標籤背面有隱形墨水，寫著兩個字：「會吃」。', 'Invisible ink on the back of a plant label: “eats.”'),
  belmont: L('泥地上有腳印，半夜有人來過。腳印走到最裡面那盆，然後……只剩一隻鞋。', 'Footprints in the mud — someone came at night. They lead to the pot at the back, and then… only one shoe is left.'),
  ouroboros: L('澆水壺裡的水被下了藥，聞起來是生肉的味道——有人在餵它。它吃「人」。', 'The water in the can has been dosed. It smells of raw meat — someone has been feeding it. It eats “people.”'),
};

export const CH2_THINGS = [ // 外觀全部由 world/ch2scene.mjs 畫（hidden：不畫灰盒方塊）
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
].map((x) => ({ hidden: true, ...x }));

// ================= 第二幕：醫務室（L1）、舊檔案室（L2，地下） =================
export const CH2_A2_ROOMS = [
  { id: 'infirmary', name: L('醫務室', 'The Infirmary'), x: [62, 74], z: [-9, 9], h: 5, floor: 'stone', light: '#c8d0c0' },
  { id: 'archive', name: L('舊檔案室', 'The Old Archive'), x: [62, 82], z: [30, 50], h: 6, floor: 'stone', light: '#8a7a5a' },
];
export const CH2_A2_SPAWNS = { act2: { x: 68, z: 7.8, yaw: 0 }, archive: { x: 64, z: 48, yaw: Math.PI * 0.75 }, infirmary_back: { x: 69.5, z: -6.2, yaw: Math.PI } };
// 病床 1～8（醫務室西邊 4 張、東邊 4 張）
export const BEDS = [[63.4, -6], [63.4, -2], [63.4, 2], [63.4, 6], [72.6, -6], [72.6, -2], [72.6, 2], [72.6, 6]];
// 檔案櫃（舊檔案室：一排排，抽屜編號＝入學年份＋學院時辰）；有名字的抽屜給玩家對照規則
export const ARCHIVE_ROWS = [34, 38, 42, 46];
export const LABELED_DRAWERS = [
  L('哈洛德・溫（1886 年入學，貝爾蒙特）→ 1895 號', 'Harold Wynn (enrolled 1886, Belmont) → No. 1895'),
  L('瑪莉・基爾（1887 年入學，格里莫瓦）→ 1898 號', 'Mary Keel (enrolled 1887, Grimoire) → No. 1898'),
  L('湯瑪斯・葛林（1885 年入學，烏洛波斯）→ 1888 號', 'Thomas Green (enrolled 1885, Ouroboros) → No. 1888'),
];
export const ENROL_PAGE = L('入學名冊（撕下來的一頁）：「……1888 年：莉安娜（艾爾德林）……」', 'A torn page from the enrolment register: “…1888: Liana (Eldrin)…”');

const A2 = [
  // 醫務室
  { id: 'owen', room: 'infirmary', kind: 'prop', x: 68, z: -7.3, size: [0.8, 1.8, 0.8], solid: true, label: L('校醫歐文', 'Matron Owen'),
    text: L('歐文：「去年有幾個學生半夜被送來，第二天就『轉學』了。我只記得……他們都睡同一張床。紀錄在我桌上，你們自己看吧。」', 'Owen: “Last year a few students were brought in at night, and the next day they had ‘transferred’. All I remember is… they all slept in the same bed. The records are on my desk — see for yourselves.”') },
  { id: 'q10_records', room: 'infirmary', kind: 'puzzle', puzzle: 'Q10', x: 66, z: -7.6, size: [1.4, 0.9, 0.8], solid: true, label: L('校醫的桌子：去年的住院紀錄', 'The matron’s desk: last year’s admissions') },
  ...BEDS.map(([x, z], i) => ({ id: `bed${i + 1}`, room: 'infirmary', kind: 'prop', x, z, size: [1.0, 0.7, 2.0], solid: true, label: L(`${i + 1} 號床`, `Bed ${i + 1}`),
    text: L(`床頭的牌子：${i + 1} 號。床單洗得很白，有一塊洗不掉的黃斑。`, `The sign at the head reads ${i + 1}. The sheets are bleached white, with one yellow stain that never washed out.`) })),
  { id: 'q11_cabinet', room: 'infirmary', kind: 'puzzle', puzzle: 'Q11', x: 71.2, z: -8.6, size: [1.4, 2, 0.6], solid: true, label: L('藥櫃（天平鎖）', 'The medicine cabinet (a balance lock)') },
  { id: 'q15_crystal', room: 'infirmary', kind: 'puzzle', puzzle: 'Q15', x: 67, z: -7.6, size: [0.4, 0.5, 0.4], y: 0.9, solid: false, label: L('桌上的留聲水晶（只有心跳聲）', 'An echo crystal on the desk (only a heartbeat)') },
  { id: 'medbook', room: 'infirmary', kind: 'prop', x: 65, z: -7.6, size: [0.4, 0.2, 0.3], y: 0.9, solid: false, label: L('醫學書（翻開的那一頁）', 'A medical book (open)'),
    text: L('「脈搏的記錄方式：長的一拍記作『－』，短的一拍記作『・』。」旁邊有人用鉛筆抄了一張字母表：A ・－　K －・－　N －・　O －－－　X －・・－ ……', '“Recording a pulse: a long beat is written ‘–’, a short beat ‘·’.” Beside it someone has pencilled a table: A ·–  K –·–  N –·  O –––  X –··– …') },
  { id: 'patients', room: 'infirmary', kind: 'prop', x: 73.6, z: -4.6, size: [0.4, 1, 0.8], y: 0.5, solid: false, label: L('病人名冊', 'The patient register'),
    text: L('一頁一頁翻過去……「KNOX，薇拉。二十年前。症狀：左手出現黑紋。處置：——（被劃掉了）」', 'You leaf through it… “KNOX, Vera. Twenty years ago. Symptoms: black veins on the left hand. Treatment: —— (struck out).”') },
  { id: 'q13_bedboard', room: 'infirmary', kind: 'xraynails', x: 70.6, z: -4, size: [1.0, 0.6, 1.0], solid: false, label: L('13 號床的床板（暗門下面）', 'The board of bed 13 (under the trapdoor)') },
  { id: 'trapdoor', room: 'infirmary', kind: 'goto', to: CH2_A2_SPAWNS.archive, needs: 'Q10', x: 69.5, z: -4, size: [1.0, 0.2, 1.0], solid: false, label: L('暗門：往下走', 'The trapdoor: go down') },
  // 舊檔案室
  { id: 'archive_up', room: 'archive', kind: 'goto', to: CH2_A2_SPAWNS.infirmary_back, x: 63, z: 49, size: [1, 2.4, 1], solid: false, label: L('樓梯：回醫務室', 'The stairs: back up to the infirmary') },
  { id: 'enrol', room: 'archive', kind: 'prop', x: 64.6, z: 44, size: [0.8, 1, 0.6], solid: false, label: L('地上一張撕下來的紙', 'A torn sheet on the floor'), text: ENROL_PAGE },
  { id: 'rule', room: 'archive', kind: 'prop', x: 62.4, z: 40, size: [0.3, 1.2, 1], y: 1, solid: false, label: L('牆上的說明牌', 'The sign on the wall'),
    text: L('「依入學與學院歸檔。」下面幾個抽屜貼著名字：', '“Filed by enrolment and house.” Below, a few drawers carry names:') },
  ...LABELED_DRAWERS.map((t, i) => ({ id: `labeled${i}`, room: 'archive', kind: 'prop', x: 66 + i * 4, z: 34, size: [1, 2.2, 0.6], solid: true, label: L('有名字的抽屜', 'A labelled drawer'), text: t })),
  { id: 'q12_drawers', room: 'archive', kind: 'puzzle', puzzle: 'Q12', x: 74, z: 38, size: [4, 2.2, 0.6], solid: true, label: L('一整排檔案櫃：打開某個號碼的抽屜', 'A row of filing cabinets: open a numbered drawer') },
  { id: 'q13_xray', room: 'archive', kind: 'puzzle', puzzle: 'Q13', x: 80.6, z: 46, size: [0.6, 2.2, 1.4], solid: true, label: L('最裡面的鐵櫃（4×4 的燈格鎖）', 'The iron cabinet at the back (a 4×4 lamp lock)') },
  { id: 'q14_papers', room: 'archive', kind: 'puzzle', puzzle: 'Q14', x: 78, z: 44.4, size: [1.2, 0.3, 1.2], solid: false, label: L('散落一地的轉學同意書', 'Transfer forms scattered on the floor') },
  { id: 'q16_key', room: 'archive', kind: 'puzzle', puzzle: 'Q16', x: 78.5, z: 46.8, size: [0.8, 0.4, 0.8], solid: false, label: L('歐文手裡握著的鑰匙', 'The key in Owen’s hand') },
  { id: 'c2_page', room: 'archive', kind: 'puzzle', puzzle: 'C2', x: 74, z: 42.4, size: [0.8, 1, 0.6], solid: false, label: L('1871 號抽屜：副校長莫瑞的檔案', 'Drawer 1871: Vice-Principal Moray’s file') },
];
CH2_THINGS.push(...A2.map((x) => ({ hidden: true, ...x })));

// ================= 第三幕：典禮廳・萬聖晚宴（A）、校長倒下之後（B） =================
// 典禮廳沿用第一章（x -34～-10、z 102～148），長桌第 1～3 張各放兩壺南瓜汁（壺 1、2 在第 1 桌……）
export const JUGS = [1, 2, 3, 4, 5, 6].map((k) => { const tb = Math.ceil(k / 2); return { k, tb, x: -30 + (tb - 1) * 5.5, z: k % 2 ? 118 : 132 }; });
export const FIRSTYEARS = [[-27.2, 112], [-21.7, 138], [-16.2, 116], [-27.2, 144], [-11.6, 108], [-16.2, 140], [-21.7, 106], [-32.6, 130]]; // 躲在桌子底下、柱子後面（6、7 號：Q17 指錯會蝕化）
export const SIDE_DOOR = { x: -33.7, z: 105 };
export const CHANDELIER_FAR = { x: -22, z: 145.5 };
export const CH2_A3_SPAWNS = { act3a: { x: -11.4, z: 125, yaw: Math.PI / 2 }, act3b: { x: -22, z: 112, yaw: 0 }, hall: { x: 0, z: 128, yaw: Math.PI } };
// 第三幕 B：面具人的血腳印（從校長倒下的地方走到牆邊），方向＝時鐘的點數（北＝12）
export const FOOTPRINTS = [[-22, 107.6, 12], [-21.4, 106.8, 2], [-20.6, 106.4, 3], [-20, 105.6, 5], [-20, 104.6, 6]];

const A3 = [
  // ---- 晚宴（遇襲前）----
  ...JUGS.map((j) => ({ id: `jug${j.k}`, room: 'banquet', kind: 'jug', jug: j.k, x: j.x, z: j.z, size: [0.6, 0.9, 0.6], y: 0.8, solid: false,
    label: L(`第 ${j.k} 壺南瓜汁（打翻它）`, `Jug ${j.k} of pumpkin juice (knock it over)`) })),
  ...[1, 2, 3].map((tb) => ({ id: `gossip${tb}`, room: 'banquet', kind: 'gossip', table: tb, x: -30 + (tb - 1) * 5.5 + 1.2, z: 125, size: [0.6, 1.6, 0.6], solid: false,
    label: L(`第 ${tb} 桌的學生（聽他們說話）`, `Students at table ${tb} (listen)`) })),
  { id: 'mycup', room: 'banquet', kind: 'mycup', x: -14, z: 141, size: [0.8, 1, 0.8], solid: false, label: L('你的座位：一杯南瓜汁', 'Your seat: a cup of pumpkin juice') },
  // ---- 遇襲後 ----
  { id: 'q18_chandelier', room: 'banquet', kind: 'lure', x: CHANDELIER_FAR.x, z: CHANDELIER_FAR.z, size: [2, 1, 2], solid: false, label: L('最裡面的吊燈（打下來）', 'The far chandelier (bring it down)') },
  { id: 'decoy_armor', room: 'banquet', kind: 'decoy', x: -12, z: 104, size: [0.8, 2, 0.8], solid: true, label: L('盔甲（推倒）', 'A suit of armour (push it over)') },
  { id: 'q19_door', room: 'banquet', kind: 'puzzle', puzzle: 'Q19', x: SIDE_DOOR.x, z: SIDE_DOOR.z, size: [0.3, 2.6, 2.4], solid: false, label: L('側門的魔法鎖（赫爾嘉夫人在門外）', 'The side door’s seal (Madam Helga is outside)') },
  ...FIRSTYEARS.map(([x, z], i) => ({ id: `fy${i}`, room: 'banquet', kind: 'firstyear', kid: i, x, z, size: [0.8, 0.8, 0.8], solid: false, label: L('躲起來的低年級生（安撫他、帶他出去）', 'A hiding first-year (calm them, lead them out)') })),
  // ---- 校長倒下之後 ----
  { id: 'q20_blood', room: 'banquet', kind: 'puzzle', puzzle: 'Q20', x: -22, z: 108.4, size: [1.6, 0.1, 1.6], solid: false, label: L('校長倒下的地方（血裡畫了東西）', 'Where the headmaster fell (something drawn in the blood)') },
  { id: 'q21_scales', room: 'banquet', kind: 'puzzle', puzzle: 'Q21', x: -20, z: 102.4, size: [2.4, 2.4, 0.3], y: 1, solid: false, label: L('牆上的銜尾蛇浮雕（12 片鱗）', 'The serpent relief on the wall (12 scales)') },
  { id: 'q22_clock', room: 'hall', kind: 'puzzle', puzzle: 'Q22', x: 0, z: 110.6, size: [2, 3, 0.4], y: 2, solid: false, label: L('大廳的大鐘（停在十二點）', 'The great clock in the hall (stopped at twelve)') },
  { id: 'to_hall', room: 'banquet', kind: 'goto', to: CH2_A3_SPAWNS.hall, needs: 'Q21', x: -10.3, z: 125, size: [0.4, 2.6, 4], solid: false, label: L('回大廳', 'Back to the Great Hall') },
  { id: 'floor_xiii', room: 'hall', kind: 'prop', x: 0, z: 124, size: [6, 0.05, 6], solid: false, label: L('地上一圈刻著羅馬數字的石磚', 'A ring of floor tiles carved with numerals'),
    text: L('I 到 XII，一圈十二塊。沒有 XIII。月光從高窗斜斜照進來，柱子的影子落在石磚上。', 'I to XII — twelve tiles in a ring. No XIII. Moonlight slants in from the high windows; the pillars’ shadows fall across the tiles.') },
];
CH2_THINGS.push(...A3.map((x) => ({ hidden: !['decoy_armor'].includes(x.id), ...x })));

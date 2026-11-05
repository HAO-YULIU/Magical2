// 第二章謎題的答案與提示（伺服器專用，不會發佈到網頁）。內容依 docs/14-puzzles-ch2.md（2026-11-05 製作人確認）。
// 格式跟 ch1.mjs 一樣（kind、seg、diff、hints…）。目前做到序幕＋第一幕（Q01～Q09）；第二幕以後還是第一章的題目（之後換掉）。
// 新的 kind：
//   rollcircle  Q04：伺服器依房間選一個玩家角色，答案是他在點名簿上的座號（peek 回傳空白紅圈的學院顏色）
//   spots       Q06：伺服器依房間從 8 個地方選 3 個異常（peek 回傳哪三個，畫面要畫出來）；value＝三個地方的 id

const H = (zh, en) => ({ zh, en });

// 點名簿上的座號（Q04；第一幕的名冊畫面也用這份）
export const SEATS = { elora: '07', yuexi: '12', vaughn: '03', cyril: '19' };
// 溫室裡可能被動過手腳的 8 個地方（Q06）
export const GREEN_SPOTS = ['fern', 'mandrake_row', 'moonwort', 'venus', 'nightshade', 'ivy', 'cactus', 'lily'];
export const GREEN_SPOT_NAMES = {
  fern: H('第一排的蕨類', 'the ferns in the first row'), mandrake_row: H('曼德拉草那一排', 'the mandrake row'), moonwort: H('月光草的花盆', 'the moonwort pots'),
  venus: H('捕蠅草', 'the flytraps'), nightshade: H('顛茄', 'the nightshade'), ivy: H('牆上的常春藤', 'the ivy on the wall'), cactus: H('仙人掌', 'the cacti'), lily: H('水缸裡的睡蓮', 'the lilies in the tank'),
};

export const CHAPTER2 = {
  // ---------- 序幕 ----------
  Q01: {
    seg: 'prologue', diff: 6, kind: 'text', ans: '3104',
    hints: H(['字是反的，好像少了什麼。', '鏡框四個角落的小記號，就是字少掉的筆畫。', '從左上角開始順時針，數每個角落有幾筆：3、1、0、4。'],
             ['The letters are backwards, and something is missing.', 'The little marks in the four corners of the frame are the missing strokes.', 'Starting top-left and going clockwise, count the strokes in each corner: 3, 1, 0, 4.']),
  },
  Q02: {
    seg: 'prologue', diff: 6, kind: 'seq', ans: 'tri,stitch',
    hints: H(['這排南瓜燈好像有規則，中間少了一個。', '每一排、每一列，三種眼睛、三種嘴巴各出現一次。', '中間那一個：三角形的眼睛、縫起來的嘴巴。'],
             ['These lanterns follow a rule, and the middle one is missing.', 'In every row and every column, each of the three eyes and three mouths appears once.', 'The middle one: triangle eyes, a stitched-shut mouth.']),
  },
  // ---------- 第一幕：魔藥學教室與溫室 ----------
  Q03: {
    seg: 'act1', diff: 7, kind: 'seq', ans: 'mandrake,shriek,serpent',
    hints: H(['黑板上的謎語說的是三樣材料的「聲音」。', '曼德拉草會哭、尖叫蘑菇會叫、啞蛇的鱗是沉默的。', '順序是曼德拉草、尖叫蘑菇、啞蛇的鱗；每放一樣，攪到顏色剛好變色就停。'],
             ['The riddle on the blackboard is about the sounds the ingredients make.', 'Mandrake weeps, the shrieking mushroom screams, the mute serpent’s scale is silent.', 'Mandrake, then shrieking mushroom, then mute serpent scale — and stir until the colour just changes each time.']),
  },
  Q04: {
    seg: 'act1', diff: 8, kind: 'rollcircle',
    hints: H(['被圈起來的名字，有幾個你在第一章的公告上看過。', '公告上失蹤的人、莉安娜，都已經不見了。剩下的那個名字還在學校裡。', '還沒失蹤的那個，是你們之中的一個——看那個空白紅圈的學院顏色。'],
             ['You have seen some of the circled names before — on last term’s notice.', 'The missing searchers and Liana are already gone. The last circle belongs to someone still at school.', 'It is one of you. Look at the house colour of the blank circle.']),
  },
  Q05: {
    seg: 'act1', diff: 6, kind: 'seq', ans: 'moonwort,batwing,silver',
    hints: H(['「我今天上課用的」——看看黑板角落。', '課表上有三種材料的符號。', '照課表的順序：月光草、蝙蝠翅、銀粉。'],
             ['“What I used in class today” — look at the corner of the blackboard.', 'The timetable shows three ingredient symbols.', 'In timetable order: moonwort, bat wing, silver dust.']),
  },
  Q06: {
    seg: 'act1', diff: 8, kind: 'spots', count: 3,
    hints: H(['門口的清單，跟溫室裡實際的植物對一對。', '一排一排數。有一個地方多了、一個地方少了、一個地方不一樣了。', '其中一個不對的地方是：{spot}。'],
             ['Compare the list at the door with what is actually in the greenhouse.', 'Count row by row. One place has too many, one too few, and one is wrong.', 'One of the wrong places is: {spot}.']),
  },
  Q07: { seg: 'act1', diff: 6, kind: 'event' }, // 四個學院的線索都看過（畫面判斷），拼出「黑色的那盆會吃人」
  Q08: {
    seg: 'act1', diff: 7, kind: 'seq', ans: 'blackroot,thirteen,hername',
    hints: H(['黑板好像被擦過。試試光照咒。', '三個空格的答案都在這間教室裡：沒有標籤的瓶子、停住的鐘、諾克斯的日記。', '黑根的汁、十三點、念出她的名字。'],
             ['The blackboard has been wiped. Try the light spell.', 'All three blanks are answered in this room: the unlabelled jar, the stopped clock, Knox’s diary.', 'Black-root sap, thirteen o’clock, speak her name.']),
  },
  Q09: {
    seg: 'act1', diff: 9, kind: 'text', ans: ['836', '0836', '8:36'],
    hints: H(['四組灑水器什麼時候會剛好一起停？', '上一次一起是 8 點整。找 4、6、9、12 都能整除的最小的數。', '36。等時鐘走到 8 點 36 分再拉。'],
             ['When will all four sprinkler groups stop together?', 'The last time was exactly 8:00. Find the smallest number that 4, 6, 9 and 12 all divide.', '36. Wait for the clock to read 8:36, then pull.']),
  },
};
// 第一幕：這些都解開才進到第二幕
export const CH2_GATES = { act1: { need: ['Q03', 'Q04', 'Q05', 'Q06', 'Q07', 'Q08', 'Q09'], next: 'act2' } };
export const CH2_SEG_END = { Q02: 'act1' };

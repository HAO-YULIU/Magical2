// 第二章謎題的答案與提示（伺服器專用，不會發佈到網頁）。內容依 docs/14-puzzles-ch2.md（2026-11-05 製作人確認）。
// 格式跟 ch1.mjs 一樣（kind、seg、diff、hints…）。目前做到序幕＋第一幕（Q01～Q09）；第二幕以後還是第一章的題目（之後換掉）。
// 新的 kind：
//   rollcircle  Q04：伺服器依房間選一個玩家角色，答案是他在點名簿上的座號（peek 回傳空白紅圈的學院顏色）
//   xray        Q13：伺服器依房間產生 4×4 的 6 格（保證只有一組解）；peek 回傳床板的 10 根釘子、X 光片上每一排／每一列的格數；value＝6 格的編號（0～15）
//   jug         Q17：伺服器依房間選被下藥的那一壺（1～6）；peek 回傳閒聊、每桌喝了幾杯；value＝壺的編號
//   runes       Q19：伺服器選 4 個符文；peek 回傳赫爾嘉夫人的描述（不含符文本身）；value＝符文的 id，逗號分隔
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
  // ---------- 第二幕：醫務室與舊檔案室 ----------
  Q10: {
    seg: 'act2', diff: 7, kind: 'text', ans: ['13', '十三'],
    hints: H(['歐文說他們都睡同一張床。看看紀錄上的床號。', '症狀是黑紋的那幾筆，日期都是十三號。床號呢？', '醫務室只有 1～8 號床，可是紀錄寫的是 13 號床。'],
             ['Owen says they all slept in the same bed. Look at the bed numbers in the records.', 'The entries with black veins are all dated the 13th. And the bed?', 'The infirmary only has beds 1 to 8 — but the records say bed 13.']),
  },
  Q11: {
    seg: 'act2', diff: 8, kind: 'seq', ans: ['sleep,pain,pain', 'pain,sleep,pain', 'pain,pain,sleep'],
    hints: H(['先把每一種藥瓶換成「幾瓶止痛藥」。', '一瓶安眠藥等於三瓶止痛藥；兩瓶安眠藥等於抑制劑加一瓶止痛藥。', '一瓶安眠藥加兩瓶止痛藥。'],
             ['Turn every bottle into “how many painkillers”.', 'One sleeping draught equals three painkillers; two sleeping draughts equal the suppressant plus one painkiller.', 'One sleeping draught and two painkillers.']),
  },
  Q12: {
    seg: 'act2', diff: 9, kind: 'text', ans: '1896', gives: 'note5',
    hints: H(['抽屜的編號跟名字有關。對照幾個有名字的抽屜。', '編號＝入學年份加上學院的時辰（艾爾德林 8、格里莫瓦 11、貝爾蒙特 9、烏洛波斯 3）。', '莉安娜 1888 年入學、艾爾德林（8）：1896。'],
             ['The drawer numbers have something to do with the names. Compare the drawers that are labelled.', 'Number = year of enrolment plus the house’s hour (Eldrin 8, Grimoire 11, Belmont 9, Ouroboros 3).', 'Liana enrolled in 1888, Eldrin (8): 1896.']),
  },
  Q13: {
    seg: 'act2', diff: 10, kind: 'xray',
    hints: H(['兩邊各只有一半的資訊：床板上的釘子、X 光片上每一排每一列有幾格。', '先找出釘子裡面，每一排、每一列數量都對得上的格子。', '其中三格是：{cells}。'],
             ['Each side has only half the information: the nails in the bed board, and how many cells in each row and column on the X-ray.', 'Among the nails, find the cells whose row and column counts all fit.', 'Three of the cells are: {cells}.']),
  },
  Q14: {
    seg: 'act2', diff: 8, kind: 'text', ans: 'liana', gives: 'note6',
    hints: H(['序幕的公告欄上，有校長親筆寫的字。', '他寫 M 的最後一筆往上勾，而且只用綠色墨水。', '是莉安娜的那一張。'],
             ['On the notice board in the prologue, there is something the headmaster wrote by hand.', 'His M ends with an upward hook, and he only ever uses green ink.', 'It is Liana’s.']),
  },
  Q15: {
    seg: 'act2', diff: 8, kind: 'text', ans: 'KNOX',
    hints: H(['心跳有長有短，像書上的那種記法。', '長的是「－」，短的是「・」。', '拍出來的是 KNOX。'],
             ['The heartbeats are long and short, like the notation in the book.', 'Long is “–”, short is “·”.', 'It spells KNOX.']),
  },
  Q16: {
    seg: 'act2', diff: 7, kind: 'text', ans: '1871',
    hints: H(['歐文死前在鑰匙牌上刮了東西。', '刮痕只有一半，看看它在燈下的影子。', '是 1871 號抽屜。'],
             ['Before he died, Owen scratched something into the key tag.', 'The scratches are only half there — look at their shadow under the lamp.', 'Drawer 1871.']),
  },
  // ---------- 第四幕：點名（30 分鐘倒數；諾克斯追殺） ----------
  Q23: {
    seg: 'act4', diff: 8, kind: 'seq', ans: 'mandrake,shriek,serpent,blackroot',
    hints: H(['第一幕學過兩個配方。筆記本裡有。', '先做月影藥水，再做蝕化解藥。', '曼德拉草、尖叫蘑菇、啞蛇的鱗、黑根的汁。'],
             ['You learned two recipes in Act One. They are in your journal.', 'First the Moonshade Draught, then the cure for the Blight.', 'Mandrake, shrieking mushroom, mute serpent scale, black-root sap.']),
  },
  Q24: {
    seg: 'act4', diff: 8, kind: 'struck',
    hints: H(['每個名字都被劃掉了一個字母。', '照名單的順序，把被劃掉的字母拼起來。', '前兩個字母是 {letters}。'],
             ['Every name has one letter struck through.', 'In list order, put the struck letters together.', 'The first two letters are {letters}.']),
  },
  Q25: {
    seg: 'act4', diff: 7, kind: 'seq', ans: '8,11,9,3',
    hints: H(['夫人說的是她巡房的時間，第一章看過。', '她每晚巡四座塔，時間就是四個學院的時辰：艾爾德林、格里莫瓦、貝爾蒙特、烏洛波斯。', '8、11、9、3。'],
             ['She means the times of her rounds — you saw them in chapter one.', 'Every night she visits the four towers; the times are the four houses’ hours: Eldrin, Grimoire, Belmont, Ouroboros.', '8, 11, 9, 3.']),
  },
  Q26: {
    seg: 'act4', diff: 6, kind: 'lights', ans: ['1,3,5', '2,3,4'],
    hints: H(['按一層會影響上下兩層。', '只要按三下。暗著的是第 1、3、5 層。', '按第 1、3、5 層。'],
             ['Each switch also flips the floors above and below.', 'Only three presses. Floors 1, 3 and 5 are dark.', 'Press floors 1, 3 and 5.']),
  },
  Q27: { seg: 'act4', diff: 9, kind: 'event', hints: H(['四個台要同時亮。', '施咒之後，台會亮一陣子才熄。', '多人：每人各站一個，數一二三。單人：從最遠的開始，一個接一個點亮，跑最短的路線。'],
             ['All four pedestals must be lit at once.', 'Once you cast, a pedestal stays lit for a little while.', 'Together: one each, count to three. Alone: start with the farthest and light them one after another along the shortest path.']) },
  C2: { seg: 'act2', diff: 0, score: false, kind: 'choice', options: ['tell', 'tear'] }, // 西里爾的第二個抉擇（告訴大家／撕掉那一頁）
  // ---------- 第三幕 A：萬聖晚宴（Q17 在遇襲前；遇襲後 15 分鐘倒數，時間到不算輸） ----------
  Q17: {
    seg: 'act3a', diff: 9, kind: 'jug',
    hints: H(['到處聽聽大家在聊什麼，記下誰端了哪一壺。', '被下藥的那壺是諾克斯端的，而且放在喝最多的那一桌。', '是第 {jug} 壺。'],
             ['Listen to what everyone is saying, and note who carried which jug.', 'The drugged jug was carried by Knox, and it stands on the table that drank the most.', 'It is jug {jug}.']),
  },
  Q18: {
    seg: 'act3a', diff: 7, kind: 'event',
    hints: H(['他們看不太到，但聽得到。', '找會發出很大聲音、又離側門很遠的東西。', '打下典禮廳最裡面（南邊）的吊燈。'],
             ['They can barely see, but they can hear.', 'Find something that makes a huge noise and is far from the side door.', 'Bring down the chandelier at the far (south) end of the hall.']),
  },
  Q19: {
    seg: 'act3a', diff: 9, kind: 'runes',
    hints: H(['夫人描述的是符文的形狀。筆記本裡有第一章的符文表。', '「倒過來的叉子」是 ᛉ、「兩座山」是 ᛗ、「一道閃電」是 ᛊ、「沒有門的門框」是 ᚢ、「打勾」是 ᚲ、「一個菱形」是 ᛜ。', '前兩個是：{runes}。'],
             ['Madam Helga is describing the shapes of runes. The rune table from chapter one is in your journal.', '“An upside-down fork” is ᛉ, “two mountains” ᛗ, “a lightning bolt” ᛊ, “a door frame without a door” ᚢ, “a tick” ᚲ, “a diamond” ᛜ.', 'The first two are: {runes}.']),
  },
  // ---------- 第三幕 B：校長倒下之後（沒有倒數） ----------
  Q20: {
    seg: 'act3b', diff: 8, kind: 'text', ans: 'open',
    hints: H(['血裡畫了東西。試試光照咒。', '是一條蛇，但頭跟尾巴沒有咬在一起。', '把牆上的銜尾蛇徽記轉成「頭尾分開」。'],
             ['Something is drawn in the blood. Try the light spell.', 'A serpent — but its head and tail do not meet.', 'Turn the serpent crest on the wall so its head and tail are apart.']),
  },
  Q21: {
    seg: 'act3b', diff: 10, kind: 'seq', ans: '12,2,3,5,6',
    hints: H(['地上的血腳印是面具人留下的。', '每一步腳印朝一個方向；鱗片像時鐘一樣排（北＝12 點）。', '前三片是 12 點、2 點、3 點。'],
             ['The bloody footprints were left by the masked figure.', 'Each footprint points one way; the scales are arranged like a clock (north = 12).', 'The first three are 12, 2 and 3 o’clock.']),
  },
  Q22: {
    seg: 'act3b', diff: 10, kind: 'text', ans: ['1', '01', '1:00', '13'],
    hints: H(['紙條說「十三號」。鐘只有 12 個數字，那第十三響是什麼時候？', '12 點之後再敲一下，就是第十三響。', '把鐘撥到 1 點。'],
             ['The note says “thirteen”. The clock only has twelve numbers — so when is the thirteenth toll?', 'One more toll after twelve is the thirteenth.', 'Set the clock to one o’clock.']),
  },
};
// 第一幕：這些都解開才進到第二幕
export const CH2_GATES = {
  act1: { need: ['Q03', 'Q04', 'Q05', 'Q06', 'Q07', 'Q08', 'Q09'], next: 'act2' },
  act2: { need: ['Q10', 'Q11', 'Q12', 'Q13', 'Q14', 'Q15', 'Q16'], next: 'act3a' },
  act3b: { need: ['Q20', 'Q21', 'Q22'], next: 'act4' }, // 第二章沒有第三幕 C
};
export const CH2_SEG_END = { Q02: 'act1', Q27: 'epilogue' };

// Q19：符文與赫爾嘉夫人的描述（第一章的符文表）
export const RUNE_DESC = [
  ['algiz', 'ᛉ', H('像一把倒過來的叉子', 'like an upside-down fork')], ['mannaz', 'ᛗ', H('像兩座山', 'like two mountains')], ['sowilo', 'ᛊ', H('像一道閃電', 'like a lightning bolt')],
  ['uruz', 'ᚢ', H('像沒有門的門框', 'like a door frame with no door')], ['kenaz', 'ᚲ', H('像一個打勾，躺下來', 'like a tick lying on its side')], ['ingwaz', 'ᛜ', H('像一個菱形', 'like a diamond')],
  ['tiwaz', 'ᛏ', H('像一支往上指的箭', 'like an arrow pointing up')], ['gebo', 'ᚷ', H('像一個大叉叉', 'like a big X')],
];
export const FEAST = { duration: 15 * 60 * 1000, preAttack: 4 * 60 * 1000 }; // 遇襲後的倒數；晚宴開始多久沒動作就自動遇襲
// Q24：諾克斯的缺席名單（每個名字劃掉一個字母，照順序拼出塔樓的口令）
export const STRUCK = {
  HIDE: [['Harold', 0], ['Ingrid', 0], ['Darcy', 0], ['Edith', 0]],
  SAFE: [['Simon', 0], ['Clara', 2], ['Felix', 0], ['Esme', 0]],
  DOOR: [['Darcy', 0], ['Oswin', 0], ['Rowan', 1], ['Hector', 5]],
  STAY: [['Silas', 0], ['Tobias', 0], ['Clara', 2], ['Yvette', 0]],
};
export const CREST_LIT = { solo: 25000, multi: 10000 }; // Q27：徽記台亮多久（單人跑得比較遠，亮久一點）

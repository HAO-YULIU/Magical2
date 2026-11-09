// 第一章的劇情對話（第 2 批：序幕＋第一幕）與分院鏡的問答。依 docs/03-chapter1.md。
// 每一句：[說話的人, 中文, 英文]。說話的人是角色代號（yuexi / vaughn / elora / cyril）、配角代號，或 null（旁白）。
// 觸發：segment:段落（這一段開始）、enter:房間（第一次走進去）、solved:題號（解開後）

export const SPEAKERS = {
  yuexi: { zh: '月晞', en: 'Yuexi' },
  vaughn: { zh: '沃恩', en: 'Vaughn' },
  elora: { zh: '艾洛拉', en: 'Elora' },
  cyril: { zh: '西里爾', en: 'Cyril' },
  aldric: { zh: '校長 奧德里克', en: 'Headmaster Aldric' },
  moray: { zh: '副校長 莫瑞', en: 'Vice-Principal Moray' },
  knox: { zh: '諾克斯教授', en: 'Professor Knox' },
  owen: { zh: '校醫 歐文', en: 'Matron Owen' },
  helga: { zh: '赫爾嘉夫人', en: 'Madam Helga' },
  mirror: { zh: '分院鏡', en: 'The Sorting Mirror' },
  student: { zh: '學生', en: 'A student' },
  warden: { zh: '守夜人 葛雷', en: 'Grey, the Night Warden' },
};

export const SCRIPT = {
  // ===== 第二章《萬聖夜》（2026-11-05）：序幕、第一幕 =====
  'segment:prologue': [
    [null, '十月三十日的晚上。開學已經兩個月了。', 'The night of the thirtieth of October. Two months since term began.'],
    [null, '四個人都沒有再提起那一晚。但每個人都睡不好。', 'None of the four has spoken of that night since. None of them sleeps well.'],
    [null, '交誼廳的古鏡忽然起了一層霧。霧上，有人用手指寫了幾個字——是反的。', 'The old mirror in the common room suddenly mists over. Someone has written in the fog with a finger — backwards.'],
    [null, '（走到鏡子前面按 E／「探查」。看清楚鏡子上的字，打開鏡子下方的暗格。）', '(Walk up to the mirror and press E / “Inspect”. Read the writing, then open the hidden drawer beneath it.)'],
  ],
  'solved:Q01': [
    [null, '暗格打開了。裡面是一張黑色的萬聖晚宴邀請函，背面寫著：「這次，輪到你們點名了。」', 'The drawer opens. Inside is a black invitation to the Halloween Feast. On the back: “This time, it is your turn to call the roll.”'],
    [null, '傳聲海螺亮了起來——其他人也收到了。四個人約在大廳見。', 'The speaking-shell lights up — the others got one too. The four agree to meet in the Great Hall.'],
    [null, '（走到交誼廳的門口，下樓到大廳。）', '(Go to the common-room door and head down to the Great Hall.)'],
  ],
  'enter:hall': [
    [null, '大廳掛滿了南瓜燈，鐘塔外面纏著黑色的布幔。明天就是萬聖夜。', 'The Great Hall is hung with jack-o’-lanterns; black drapes coil around the clock tower outside. Tomorrow is Halloween.'],
    ['vaughn', '欸，你們也收到了？「輪到你們點名」是什麼意思？', 'You got one too? “Your turn to call the roll” — what’s that supposed to mean?'],
    ['cyril', '意思是有人在惡作劇，而且品味很差。', 'It means someone is playing a prank, and has terrible taste.'],
    ['yuexi', '……公告欄前面那排南瓜燈，中間那顆被打爛了。', '…The middle lantern in that rack by the notice board has been smashed.'],
    ['elora', '其他的臉好像排得很整齊。把它補回去看看？', 'The other faces look carefully arranged. Shall we carve the missing one?'],
  ],
  'solved:Q02': [
    [null, '九顆南瓜燈同時亮了起來。公告欄後面掉出一張泛黃的紙——莉安娜的筆記。', 'All nine lanterns flare at once. A yellowed page drops from behind the notice board — one of Liana’s notes.'],
    ['elora', '……是姊姊的字。', '…That’s my sister’s handwriting.'],
    [null, '筆記上只有一句話：「諾克斯教授知道。去魔藥學教室。」', 'There is a single line: “Professor Knox knows. Go to the potions classroom.”'],
  ],
  'enter:banquet': [
    ['aldric', '歡迎來到米爾納。在這裡，你們會學到魔法，也會學到規矩。', 'Welcome to Milner. Here you will learn magic — and you will learn the rules.'],
    ['aldric', '北翼地下，嚴禁進入。還有……熄燈之後，請不要理會鐘聲。', 'The cellars beneath the North Wing are forbidden. And… after lights-out, pay no attention to the bells.'],
    [null, '校長身旁的副校長看向西里爾，只冷冷地點了個頭。西里爾別開了臉。', 'Beside the headmaster, the vice-principal looks at Cyril and gives a single cold nod. Cyril looks away.'],
    [null, '魔藥學教授的視線，一直停在艾洛拉的手套上。', 'The potions professor’s gaze never leaves Elora’s gloves.'],
    [null, '（四張長桌上的學生在交頭接耳。走過去聽聽看，再回到你的座位整理。）', '(Students are whispering at the four long tables. Go and listen, then return to your seat to piece it together.)'],
  ],
  'segment:act1': [
    [null, '萬聖節前一天，最後一堂課結束之後。魔藥學教室裡只剩一排排還在冒泡的大釜。', 'The day before Halloween, after the last lesson. Only rows of bubbling cauldrons remain in the potions classroom.'],
    ['vaughn', '諾克斯一直在問我們那晚去了哪裡。她一定知道什麼。', 'Knox keeps asking where we were that night. She knows something.'],
    ['cyril', '那就趁她不在，翻她的東西。很好，我們現在是小偷了。', 'So we rummage through her things while she’s out. Lovely. We’re burglars now.'],
    [null, '（諾克斯教授會回來巡視：被她的燈照到，會被罵、送回門口。躲在大釜後面或講桌底下。）', '(Professor Knox comes back to check the room: if her lamp finds you, you’re scolded and sent back to the door. Hide behind a cauldron or under the desk.)'],
  ],
  'caught': [['knox', '你們在我的教室裡做什麼？出去。現在。', 'What are you doing in my classroom? Out. Now.']],
  'solved:Q03': [[null, '藥水變成清澈的銀白色。講台後面那個櫃子上的封印，「喀」的一聲鬆開了。', 'The draught turns a clear silver-white. With a click, the seal on the cabinet behind the lectern loosens.']],
  'solved:Q04': [
    [null, '抽屜打開了。裡面是諾克斯的筆記，只寫了一行：「下一個：萬聖夜。」', 'The drawer opens. Inside is Knox’s note, a single line: “Next: Halloween night.”'],
    ['yuexi', '紅圈……是名單。被圈起來的人，都不見了。', 'The red circles… it’s a list. Everyone circled has disappeared.'],
  ],
  'solved:Q05': [
    [null, '櫃子打開了：完整的點名簿，還有一頁日記。通往溫室的門也開了。', 'The cabinet opens: the complete roll book, and a page of diary. The door to the greenhouse swings open.'],
    [null, '日記：「最裡面那一盆，我每天都會去看它。它長得太快了。」', 'The diary: “I visit the one at the very back every day. It is growing far too fast.”'],
  ],
  'enter:greenhouse': [
    [null, '溫室。玻璃屋頂上結著霧，一排排植物在月光下一動也不動。最裡面那一盆，是黑色的。', 'The greenhouse. Mist beads on the glass roof; rows of plants stand utterly still in the moonlight. The one at the very back is black.'],
    [null, '（門口有一張植物清單。找出三個跟清單不一樣的地方，用「探查」標記起來。）', '(There is a plant list by the door. Find the three places that don’t match it, and mark them with “Inspect”.)'],
  ],
  'solved:Q06': [[null, '標記的三個地方同時亮起來。溫室最裡面的那扇門，慢慢打開了。', 'The three marked places light up together. The door at the back of the greenhouse creaks open.']],
  'solved:Q07': [['elora', '「黑色的那盆……會吃人。」', '“The black one… eats people.”'], ['vaughn', '……我們要經過它旁邊，對吧。', '…And we have to walk right past it. Right.']],
  'solved:Q08': [
    [null, '黑板上的字自己補完了。最後一行，用另一種筆跡寫著：「她已經來不及了。」', 'The writing on the blackboard completes itself. The last line is in a different hand: “It is already too late for her.”'],
    ['elora', '（把手套拉緊了一點。）', '(Tugs her gloves a little tighter.)'],
  ],
  'solved:Q09': [
    [null, '四組灑水器同時停下的那一刻，黑色的根「嘶」地一聲縮回土裡。後門打開了。', 'The instant all four sprinklers fall silent, the black roots hiss and shrink back into the soil. The back door opens.'],
    [null, '門外是往醫務室的走廊。遠處，有人在哼歌——是校醫歐文。', 'Beyond it is the corridor to the infirmary. Somewhere ahead, someone is humming — Matron Owen.'],
  ],
  'mirror': [[null, '字是反著寫的……像是有人從鏡子的另一邊，用手指寫給你看。', 'The letters are backwards… as if someone wrote them with a finger from the other side of the glass.']],
  // ---- 第二幕：肖像畫長廊 ----
  // ===== 第二章 第二幕：醫務室與舊檔案室 =====
  'segment:act2': [
    [null, '醫務室。一排白色的病床，空氣裡是藥草和消毒水的味道。', 'The infirmary. A row of white beds; the air smells of herbs and carbolic.'],
    ['owen', '這麼晚了還來看病？……喔，是你們。諾克斯教授剛剛也來過，問我去年的事。', 'Here for a remedy at this hour? …Oh. It’s you lot. Professor Knox was just here, asking about last year.'],
    ['elora', '去年的什麼事？', 'About what, last year?'],
    ['owen', '有幾個學生，半夜被送來。第二天就「轉學」了。……紀錄在我桌上。我什麼都沒說喔。', 'Some students were brought in at night. Next morning they’d “transferred”. …The records are on my desk. I didn’t say a thing.'],
    [null, '（調查醫務室：校醫的桌子、病床、藥櫃、留聲水晶。）', '(Search the infirmary: the matron’s desk, the beds, the medicine cabinet, the echo crystal.)'],
  ],
  'solved:Q10': [
    ['owen', '……13 號床。我們醫務室，從來沒有 13 號床。', '…Bed 13. This infirmary has never had a bed 13.'],
    [null, '歐文掀開最裡面那張床的床墊，底下是一扇暗門。冷風從下面吹上來。', 'Owen lifts the mattress of the last bed. Beneath it is a trapdoor. A cold draught breathes up from below.'],
    ['owen', '這裡以前不是醫務室的一部分。……我去拿燈，你們先別下去。', 'This was never part of the infirmary. …I’ll fetch a lamp. Don’t go down yet.'],
    [null, '歐文走下了暗門。', 'Owen goes down through the trapdoor.'],
  ],
  'solved:Q11': [[null, '藥櫃打開了。架子上夾著歐文的紙條：「如果我沒回來，去檔案室最裡面那一排。」', 'The cabinet opens. A note from Owen is tucked on the shelf: “If I don’t come back, go to the last row of the archive.”']],
  'solved:Q15': [
    ['yuexi', '……K、N、O、X。', '…K. N. O. X.'],
    [null, '病人名冊上，諾克斯也在裡面。二十年前，左手出現黑紋。', 'Knox is in the patient register too. Twenty years ago: black veins on the left hand.'],
    ['elora', '（把左手藏到背後。）', '(Hides her left hand behind her back.)'],
  ],
  'enter:archive': [
    [null, '舊檔案室。一排排高大的檔案櫃一直延伸到黑暗裡，裡面是一百年的病歷。', 'The old archive. Rows of towering cabinets march off into the dark, holding a hundred years of patients.'],
    [null, '遠處有翻紙的聲音。……歐文？', 'Somewhere far off, paper is being turned. …Owen?'],
    [null, '沒有人回答。抽屜一個接一個，自己關上了。', 'No one answers. One by one, the drawers slide shut on their own.'],
  ],
  'solved:Q12': [
    [null, '莉安娜的病歷：「黑紋從左手開始。」——跟艾洛拉一樣。抽屜裡還夾著莉安娜的筆記第 5 頁。', 'Liana’s file: “The black veins begin in the left hand.” — just like Elora’s. Liana’s notes, page 5, are tucked inside.'],
    ['elora', '……姊姊。', '…Sister.'],
  ],
  'solved:Q13': [
    [null, '鐵櫃的門彈開了。', 'The iron cabinet springs open.'],
    [null, '歐文倒在裡面。他的眼睛睜得很大，喉嚨被撕開，胸口塞滿了黑色的根。血從櫃子裡一直流到你的腳邊。', 'Owen is crammed inside. His eyes are wide open; his throat has been torn out, and his chest is stuffed with black roots. Blood runs from the cabinet all the way to your feet.'],
    ['vaughn', '……他、他剛剛還在跟我們說話——', '…He — he was talking to us just now —'],
    ['cyril', '別叫。不管是誰做的，它可能還在這裡。', 'Don’t shout. Whoever did this may still be down here.'],
    [null, '歐文的手裡，緊緊握著一把鑰匙。', 'Clutched in Owen’s hand is a key.'],
  ],
  'solved:Q14': [
    [null, '真的那一張，是莉安娜的轉學同意書。日期是她失蹤的前一天。校長親手簽的。', 'The genuine one is Liana’s transfer form, dated the day before she vanished — signed by the headmaster himself.'],
    ['elora', '校長……知道？', 'The headmaster… knew?'],
    [null, '同意書背面夾著莉安娜的筆記第 6 頁。', 'Page 6 of Liana’s notes is folded behind it.'],
  ],
  'solved:Q16': [[null, '1871 號抽屜。裡面只有一份檔案，封面寫著：塞巴斯汀・莫瑞。', 'Drawer 1871. It holds a single file. On the cover: Sebastian Moray.'], ['cyril', '……', '…']],
  'solved:C2': [[null, '西里爾做了決定。', 'Cyril has made his choice.']],
  // ===== 第二章 第三幕：萬聖晚宴（A）、校長倒下之後（B） =====
  'segment:act3a': [
    [null, '十月三十一日，晚上七點。典禮廳。天花板上的蠟燭全換成了南瓜燈，長桌上擺滿南瓜派和一壺壺南瓜汁。', 'The thirty-first of October, seven o’clock. The Ceremony Hall. Every candle on the ceiling has become a jack-o’-lantern; the long tables are heaped with pumpkin pies and jug after jug of pumpkin juice.'],
    ['aldric', '萬聖快樂。今晚，讓我們忘掉課本——但不要忘了，熄燈之後回到自己的床上。', 'Happy Halloween. Tonight, forget your books — but do not forget to be back in your beds after lights-out.'],
    [null, '副校長的位子是空的。諾克斯教授站在教師席最旁邊，什麼都沒吃，一直看著學生喝南瓜汁。', 'The vice-principal’s chair is empty. Professor Knox stands at the end of the high table, eating nothing, watching the students drink.'],
    ['cyril', '……她在等什麼。', '…What is she waiting for.'],
    [null, '（到每一桌聽聽大家在聊什麼。如果有一壺被下了藥，在鐘響之前把它「不小心」打翻。你的座位上也有一杯南瓜汁。）', '(Listen to what each table is saying. If a jug has been dosed, knock it over “by accident” before the bell. There is a cup of juice at your seat, too.)'],
  ],
  'feast:attack': [
    [null, '鐘聲響了。一下、兩下……十二下。大廳的燈全滅了。', 'The bell tolls. Once, twice… twelve times. Every light in the hall goes out.'],
    [null, '燈再亮起來的時候，喝過南瓜汁的學生一個接一個開始抽搐。他們的眼睛變黑，皮膚底下爬出黑色的紋路。', 'When the lights return, the students who drank the juice begin to convulse, one after another. Their eyes turn black; dark veins crawl beneath their skin.'],
    [null, '有人尖叫。長桌翻倒了。一個學生撲到另一個身上，咬了下去——血噴到南瓜燈上，燈光變成了紅色。', 'Someone screams. A table goes over. One student throws himself on another and bites — blood sprays across the lanterns, and their light turns red.'],
    ['vaughn', '低年級的還躲在桌子底下！', 'The first-years are still hiding under the tables!'],
    [null, '（他們看不太到，但聽得到——別跑，慢慢走。引開堵在側門的人、打開側門，把低年級生一個一個帶出去。魔蝕正在擴散。）', '(They can barely see, but they can hear — don’t run; walk slowly. Lure away the ones blocking the side door, open it, and lead the first-years out one by one. The Blight is spreading.)'],
  ],
  'solved:Q19': [['helga', '……開了！快，把孩子們交給我！', '…It’s open! Quickly, hand the children to me!']],
  'segment:act3b': [
    [null, '典禮廳中央，校長舉起了手。金色的光從他身上湧出來，所有蝕化的學生都像被凍住一樣，停在原地。', 'In the centre of the hall, the headmaster raises his hand. Golden light pours from him, and every one of the Eroded freezes where they stand.'],
    [null, '混亂中，艾洛拉的手套被扯掉了。大家都看到了：黑色的紋路，已經爬到她的肩膀。', 'In the chaos, Elora’s glove is torn away. Everyone sees it: the black veins have already crept up to her shoulder.'],
    ['aldric', '……原來如此。你和你姊姊一樣。', '…So that’s how it is. You are just like your sister.'],
    [null, '校長把一把鑰匙塞進艾洛拉手裡。下一秒，一個戴著銜尾蛇面具的人從他背後走出來，一刀刺穿了他的胸口。', 'The headmaster presses a key into Elora’s hand. The next instant, a figure in a serpent mask steps from behind him and drives a blade clean through his chest.'],
    [null, '血從校長的嘴裡湧出來。金光熄滅了。面具人看了西里爾一眼，消失在教師席後面。', 'Blood wells from the headmaster’s mouth. The golden light dies. The masked figure glances at Cyril — and vanishes behind the high table.'],
    [null, '……宴會廳外。三個人看著艾洛拉。', '…Outside the hall. Three of them stare at Elora.'],
    ['yuexi', '所以那天晚上差點死掉，是因為妳？', 'So we nearly died that night because of you?'],
    ['elora', '……我姊姊去年在這裡失蹤。我也被感染了。開學那晚，是我故意帶大家去禁區的。我想找她。', '…My sister vanished here last year. I’m infected too. The night term began, I led you into the forbidden wing on purpose. I wanted to find her.'],
    ['vaughn', '她姊姊不見了。換作是我，也會去找。', 'Her sister disappeared. If it were me, I’d have gone looking too.'],
    ['cyril', '……那個面具人，看了我一眼。', '…That masked man looked right at me.'],
    [null, '艾洛拉把手套重新戴上。四個人回到校長倒下的地方。', 'Elora pulls her glove back on. The four of them return to where the headmaster fell.'],
  ],
  'solved:Q20': [[null, '銜尾蛇的徽記轉開了，蛇頭和蛇尾分開。牆上的浮雕發出「喀」的一聲——鱗片可以按了。', 'The serpent crest turns until head and tail part. The relief on the wall gives a click — its scales can be pressed now.']],
  'solved:Q21': [[null, '暗門打開了，裡面只有一張燒了一半的紙：「十三號，地窖。」', 'A hidden door swings open. Inside lies only a half-burnt note: “Thirteen. The cellar.”'], [null, '（回到大廳。大鐘停在十二點。）', '(Go back to the Great Hall. The great clock stopped at twelve.)']],
  'solved:Q22': [[null, '月光的柱影落在 XII 和 I 之間的一條縫上。地板下傳來石頭摩擦的聲音——往地窖的樓梯露了出來。', 'The pillars’ moonlit shadow falls on a seam between XII and I. Stone grinds beneath the floor — a stair into the cellar is revealed.'], [null, '樓梯下面，有人在點名。', 'Down below, someone is calling the roll.']],
  'segment:act4': [
    [null, '午夜。鐘聲從四面八方壓下來。大家一起數：……十、十一、十二。', 'Midnight. The bells press in from every side. Together you count: …ten, eleven, twelve.'],
    [null, '然後是第十三響。', 'Then comes the thirteenth.'],
    ['cyril', '……鐘聲還沒停。它在倒數。', '…It isn’t stopping. It’s counting down.'],
    [null, '餘音結束的時候，還留在蝕域裡的人，都會被同化。畫面上方是剩下的時間。', 'When the echo fades, whoever is still inside the Blight will be consumed. The time left is shown at the top.'],
    [null, '樓梯上亮起一盞綠色的燈。有人哼著歌，一步一步走下來。', 'A green lamp appears on the stairs. Someone is humming, coming down one step at a time.'],
    ['warden', '「提著綠燈走長廊，誰家孩子還沒睡……」孩子們，該回床上了。', '“Green lamp glowing down the hall, who’s still waking, little one…” Children. Back to bed now.'],
    [null, '他的燈照到艾洛拉的手套，突然停住了。', 'His lamp falls on Elora’s glove, and he stops dead.'],
    [null, '下一秒，他的身體從背後裂開。肋骨像門一樣往兩側撐開，黑色的結晶從裂口刺穿衣服，血順著結晶往下滴。', 'The next instant his back splits open. His ribs swing apart like doors; black crystal spears through his coat, and blood runs down the spikes.'],
    [null, '臉皮整片往下剝落，掛在下巴上。他的眼睛，變成了一片漆黑。', 'The skin of his face peels away in one sheet and hangs from his chin. His eyes are nothing but black.'],
    ['vaughn', '跑！往東邊的通道——別被那道綠光照到！', 'Run! The east passage — don’t let the green light touch you!'],
    [null, '（Shift／搖桿推到底跑步，跑太久會喘。躲進櫃子、書架縫，按住 Q／「屏息」保持安靜。被抓住時連點掙脫——但只能掙脫兩次。他會不時回蝕巢休息，那就是解題的時候。）', '(Shift / push the stick fully to run — you’ll tire. Hide in cabinets and gaps; hold Q / “Hold breath” to stay silent. If caught, mash to break free — but only twice. Now and then he goes back to his nest to rest: that is your time to solve.)'],
  ],
  'act4:retry': [[null, '……你們又站在入口大廳裡。鐘聲重新開始倒數，綠燈從樓梯上下來。', '…You stand in the entrance hall again. The tolling begins its count anew, and the green lamp descends the stairs.']],
  'enter:a4_gears': [
    ['vaughn', '那個稻草人……剛剛是不是動了一下？', 'That scarecrow… did it just move?'],
    [null, '地上的石板刻著羅馬數字。南牆邊有一個上鎖的工具箱。', 'The floor stones are carved with Roman numerals. A locked toolbox sits by the south wall.'],
  ],
  'solved:P26': [[null, '門閂一根根彈開，鐵門被推開了。', 'The bolts snap back one by one, and the iron door gives way.']],
  'solved:P27': [[null, '齒輪咬死了。頭頂的鐘槌卡在半空——鐘聲停了一下。（多了 90 秒）', 'The gears seize. Overhead the hammer jams in mid-swing — the tolling falters. (+90 seconds)']],
  'solved:P28': [[null, '石板隨著節奏一塊塊亮起，通往屋頂的門開了。冷風和月光灌了進來。', 'The stones light up with the rhythm, and the way to the roof opens. Cold wind and moonlight pour in.']],
  'solved:P29': [
    [null, '最後一塊石板亮了。身後，綠燈追上了屋頂。', 'The last stone lights. Behind you, the green lamp reaches the roof.'],
    [null, '月光照在守夜人身上。他發出不像人的慘叫，整個人停了下來，身上的結晶一根根裂開。', 'Moonlight falls on the Night Warden. He lets out an inhuman scream and stops; one by one, his crystals crack.'],
    [null, '他看著艾洛拉。她的手套底下，透出微微的黑光。', 'He looks at Elora. Beneath her glove, a faint black light is showing.'],
  ],
  'P29:cyril': [
    ['warden', '……你也是。', '…You too.'],
    [null, '然後他往後一倒，從屋頂墜了下去。只有你聽清楚了那句話。', 'Then he tips backward and falls from the roof. Only you heard the words clearly.'],
  ],
  'P29:others': [[null, '他說了一句什麼，被風吹散了。然後他往後一倒，從屋頂墜了下去。', 'He says something — the wind tears it away. Then he tips backward and falls from the roof.']],
  // 尾聲講完、熄燈後（2026-10-30 帳號二，伏筆；2026-10-31 製作人確認保留）
  'finale': [[null, '燈，全滅了。黑暗裡，房間那面古鏡慢慢起了霧——有人從鏡子裡面，寫了一行字。', 'The lights die, all at once. In the dark, the old mirror slowly fogs over — someone on the inside has written a line.']],
  'segment:epilogue': [
    [null, '四個人在第十三響的餘音結束的那一刻衝回宿舍。窗外的鐘塔，恢復了安靜。', 'The four of you burst into the dormitory at the very moment the thirteenth toll fades. Outside, the clock tower falls silent.'],
    [null, '隔天早上，大廳一切如常。公告欄上寫著：「守夜人葛雷因病退休。」昨晚的血跡，全部不見了。', 'The next morning the hall is as if nothing happened. A notice reads: “Night Warden Grey has retired due to illness.” Every trace of blood is gone.'],
    [null, '西里爾收到一封沒有署名的信，封蠟是一條銜尾蛇：「你昨晚去了不該去的地方。」', 'Cyril receives an unsigned letter sealed with an ouroboros: “You went somewhere you should not have last night.”'],
    [null, '艾洛拉在浴室裡脫下手套。黑色的紋路，從手腕爬到了手肘。', 'In the bathroom, Elora peels off her glove. Black veins have crept from her wrist to her elbow.'],
    [null, '她把袖子拉下來，對著鏡子，練習微笑。', 'She pulls her sleeve down, faces the mirror, and practises her smile.'],
  ],

};

// 分院鏡的問答（P01）：每題四個選項，依序對應 艾爾德林、格里莫瓦、貝爾蒙特、烏洛波斯
export const SORTING = [
  { q: ['半夜醒來，聽到走廊有腳步聲。你會？', 'You wake at midnight to footsteps in the corridor. You…'],
    a: [['先確認室友都平安', 'make sure your roommates are safe'], ['記下時間和腳步的節奏', 'note the time and the rhythm of the steps'], ['直接開門看是誰', 'open the door to see who it is'], ['裝睡，等它自己露出破綻', 'pretend to sleep and wait for it to give itself away']] },
  { q: ['如果只能帶一樣東西進禁區？', 'You may bring one thing into a forbidden place.'],
    a: [['一盞燈', 'a lamp'], ['一本書', 'a book'], ['一把劍', 'a sword'], ['一個沒人知道的計畫', 'a plan no one else knows']] },
  { q: ['朋友對你說了謊。你會？', 'A friend has lied to you. You…'],
    a: [['相信他一定有理由', 'trust they had a reason'], ['找出真相再說', 'find out the truth first'], ['當面問清楚', 'ask them to their face'], ['記住，之後也許用得上', 'remember it — it may be useful later']] },
  { q: ['你最害怕的是？', 'What do you fear most?'],
    a: [['黑暗', 'the dark'], ['被遺忘', 'being forgotten'], ['什麼都做不了', 'being helpless'], ['沒有選擇', 'having no choice']] },
  { q: ['夜空裡你最先看到什麼？', 'What do you notice first in the night sky?'],
    a: [['最亮的那顆星', 'the brightest star'], ['星座的形狀', 'the shapes of the constellations'], ['月亮', 'the moon'], ['星星移動的方向', 'the way the stars move']] },
  { q: ['在一扇打不開的門前，你會？', 'Before a door that will not open, you…'],
    a: [['等大家一起想辦法', 'wait so everyone can work it out together'], ['研究鎖的構造', 'study how the lock is made'], ['用力撞開', 'break it down'], ['找另一條路', 'find another way']] },
  { q: ['哪一句話最像你？', 'Which saying is most like you?'],
    a: [['「有光就有路。」', '“Where there is light, there is a way.”'], ['「知道得越多，越不怕。」', '“The more you know, the less you fear.”'], ['「先做了再說。」', '“Act first, explain later.”'], ['「一切都會繞回原點。」', '“Everything comes back around.”']] },
  { q: ['鏡子問：你為什麼來到米爾納？', 'The mirror asks: why have you come to Milner?'],
    a: [['為了保護重要的人', 'to protect someone who matters'], ['為了找到答案', 'to find answers'], ['為了變強', 'to become stronger'], ['為了得到我想要的', 'to get what I want']] },
];
export const SORTING_HOUSES = ['eldrin', 'grimoire', 'belmont', 'ouroboros'];

// P07：燭光的摩斯密碼表（貼在書桌上）
export const MORSE_TABLE = [['0', '-----'], ['1', '.----'], ['2', '..---'], ['3', '...--'], ['4', '....-'], ['5', '.....'], ['6', '-....'], ['7', '--...'], ['8', '---..'], ['9', '----.']];

// P04：燒焦的符文表（三族、每族 8 個；null＝被燒掉看不清）
export const RUNE_ROWS = [
  ['ᚠ', 'ᚢ', null, 'ᚨ', 'ᚱ', null, 'ᚷ', 'ᚹ'],
  [null, 'ᚾ', 'ᛁ', null, 'ᛇ', 'ᛈ', null, 'ᛋ'],
  ['ᛏ', null, 'ᛖ', 'ᛗ', null, 'ᛜ', 'ᛞ', null],
];

// 歷任校長（P10）。創辦人的在位年數被刮掉了；第二任的銘牌寫著答案的線索
export const HEADMASTERS = [
  { zh: '艾德蒙・米爾納　創辦人　在位 ▒▒ 年（被刮花了）', en: 'Edmund Milner — Founder — served ▒▒ years (scratched)' },
  { zh: '第二任　歐文・米爾納　1659－1701　「繼創辦人三十三年之治」', en: '2nd — Owen Milner — 1659–1701 — “Successor to the founder’s thirty-three years”' },
  { zh: '第三任　碧翠絲・海爾　1701－1733', en: '3rd — Beatrix Hale — 1701–1733' },
  { zh: '第四任　柯尼留斯・艾許比　1733－1768', en: '4th — Cornelius Ashby — 1733–1768' },
  { zh: '第五任　瑪蒂德・凡斯　1768－1801', en: '5th — Mathilde Vance — 1768–1801' },
  { zh: '第六任　伊格納修・米爾納　1801－1826', en: '6th — Ignatius Milner — 1801–1826' },
  { zh: '第七任　羅莎琳・克蘭　1826－1860', en: '7th — Rosalind Crane — 1826–1860' },
  { zh: '第八任　巴塞羅謬・里夫　1860－1894', en: '8th — Bartholomew Reeve — 1860–1894' },
  { zh: '第九任　希奧朵拉・米爾納　1894－1926', en: '9th — Theodora Milner — 1894–1926' },
  { zh: '第十任　安布羅斯・奎爾　1926－1951', en: '10th — Ambrose Quill — 1926–1951' },
  { zh: '第十一任　海倫娜・馬許　1951－1980', en: '11th — Helena Marsh — 1951–1980' },
  { zh: '第十二任　珀西瓦・米爾納　1980－2001', en: '12th — Percival Milner — 1980–2001' },
  { zh: '第十三任　奧德里克・米爾納　2001－', en: '13th — Aldric Milner — 2001–' },
];

// 肖像畫長廊的學生畫像（名字只有格里莫瓦的人看得懂；其他人看到的是古文字）
export const GALLERY_NAMES = ['Ada', 'Bram', 'Cora', 'Dell', 'Edda', 'Finn', 'Gwen', 'Hal', 'Iris', 'Jory', 'Kit', 'Lark',
  'Mabel', 'Ned', 'Opal', 'Pell', 'Quinn', 'Rue', 'Sable', 'Tam', 'Una', 'Vale', 'Wren', 'Yara'];

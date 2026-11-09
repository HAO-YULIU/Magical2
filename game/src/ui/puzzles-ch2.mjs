// 第二章的謎題畫面（帳號二，2026-11-05）：序幕、第一幕（Q01～Q05、Q08、Q09）。Q06、Q07 是走過去調查的（logic/ch2act1.mjs）。
// 作答都送到伺服器判斷，這裡沒有答案（Q03 的攪拌、Q09 的時鐘只是操作，判斷還是在伺服器）。
import { el } from './overlay.mjs';
import { getLang } from '../logic/i18n.mjs';
import { PUMPKIN_GRID } from '../data/ch2-act1.mjs';
import { sfx } from '../art/sfx.mjs';
import { HOUSES } from '../logic/chars.mjs';

const T = (zh, en) => (getLang() === 'en' ? en : zh);
const EYES = [['tri', '▲', '三角眼', 'triangle eyes'], ['round', '●', '圓眼', 'round eyes'], ['moon', '☾', '彎月眼', 'crescent eyes']];
const MOUTHS = [['grin', '◡', '笑', 'grin'], ['fang', '⩔', '尖牙', 'fangs'], ['stitch', '⧚', '縫起來', 'stitched shut']];
const nameOf = (list, id) => { const x = list.find((e) => e[0] === id); return x ? `${x[1]} ${T(x[2], x[3])}` : ''; };
const select = (opts, ph) => el('select', {}, el('option', { value: '', text: ph }), ...opts.map(([v, label]) => el('option', { value: v, text: label })));
const answerBtn = (onclick) => el('button', { class: 'primary small', text: T('作答', 'Answer'), onclick });

export const BUILD_CH2 = {
  // Q01：起霧的鏡子——反著寫的「十月三十一日」，四個角落是少掉的筆畫
  Q01(body, { submit }) {
    const marks = [3, 1, 0, 4]; // 畫面上畫出來給玩家數（不是答案的文字：玩家要自己數、照順時針排）
    const frame = el('div', { class: 'ch2-mirror' },
      el('div', { class: 'fog', text: T('十月三十一日', 'OCT 31') }),
      ...['tl', 'tr', 'br', 'bl'].map((pos, i) => el('div', { class: `corner ${pos}` }, ...Array.from({ length: marks[i] }, (_, k) => el('i', { style: `transform: rotate(${(k * 37) % 90 - 45}deg)` })))));
    const inp = el('input', { inputmode: 'numeric', maxlength: '4', placeholder: '????', class: 'num' });
    inp.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') submit(inp.value.trim()); };
    body.append(el('p', { class: 'dim', text: T('霧上的字是反的，好像每個字都少了幾筆。鏡框的四個角落有幾道刮痕。鏡子下面的暗格要四位數。', 'The writing in the fog is backwards, and every letter seems to be missing strokes. There are scratches in the four corners of the frame. The drawer below wants four digits.') }),
      frame, el('div', { class: 'row' }, inp, answerBtn(() => submit(inp.value.trim()))));
  },

  // Q02：3×3 的南瓜燈，中間那顆被打爛了——補一顆
  Q02(body, { submit }) {
    const grid = el('div', { class: 'ch2-pumpkins' });
    PUMPKIN_GRID.forEach((row) => row.forEach((cell) => grid.append(el('div', { class: cell ? '' : 'broken' },
      cell ? el('b', { text: `${EYES.find((e) => e[0] === cell[0])[1]}${MOUTHS.find((m) => m[0] === cell[1])[1]}` }) : el('b', { text: '✗' }),
      el('small', { text: cell ? `${nameOf(EYES, cell[0])}／${nameOf(MOUTHS, cell[1])}` : T('被打爛了', 'smashed') })))));
    const eye = select(EYES.map(([v, s, zh, en]) => [v, `${s} ${T(zh, en)}`]), T('眼睛', 'Eyes'));
    const mouth = select(MOUTHS.map(([v, s, zh, en]) => [v, `${s} ${T(zh, en)}`]), T('嘴巴', 'Mouth'));
    body.append(el('p', { class: 'dim', text: T('照其他八顆的規則，雕一顆新的放回中間。', 'Following the pattern of the other eight, carve a new one for the middle.') }), grid,
      el('div', { class: 'row' }, eye, mouth, el('button', { class: 'primary small', text: T('雕好了，放回去', 'Carve it and put it back'), onclick: () => submit(`${eye.value},${mouth.value}`) })));
  },

  // Q03：大釜——依序放材料，每放一樣要攪到顏色剛好變成下一個月相（攪太多會變黑、重來）
  Q03(body, { submit }) {
    const ING = [['mandrake', T('曼德拉草', 'Mandrake')], ['shriek', T('尖叫蘑菇', 'Shrieking mushroom')], ['serpent', T('啞蛇的鱗', 'Mute serpent scale')],
      ['moonwort', T('月光草', 'Moonwort')], ['batwing', T('蝙蝠翅', 'Bat wing')], ['silver', T('銀粉', 'Silver dust')]];
    const PHASE = [['#2a3a2a', T('新月（暗綠）', 'new moon (dark green)')], ['#9ab0c8', T('上弦（銀）', 'first quarter (silver)')], ['#5a8ad0', T('盈凸（藍）', 'gibbous (blue)')], ['#f0f0ff', T('滿月（白）', 'full moon (white)')]];
    let added = [], stirs = 0, phase = 0;
    const pot = el('div', { class: 'ch2-pot' }), info = el('p', { class: 'dim' });
    const paint = () => { const black = stirs > 3; pot.style.background = black ? '#050505' : PHASE[phase][0]; info.textContent = black ? T('攪過頭了！藥水變成黑的。', 'Over-stirred! The draught has turned black.') : `${T('目前', 'Now')}：${PHASE[phase][1]}　${T('放了', 'Added')}：${added.map((a) => ING.find((i) => i[0] === a)[1]).join(' → ') || '—'}`; };
    const reset = () => { added = []; stirs = 0; phase = 0; paint(); };
    const add = (id) => { if (stirs > 3) return; if (added.length && stirs < 3) { info.textContent = T('上一樣還沒攪到變色。', 'The last ingredient hasn’t been stirred until the colour changed.'); return; } added.push(id); stirs = 0; paint(); };
    const stir = () => { if (!added.length) return; stirs++; if (stirs === 3) phase = Math.min(3, phase + 1); paint(); if (stirs === 3 && added.length === 3) setTimeout(() => submit(added.join(',')).then((r) => { if (!r?.solved) setTimeout(reset, 1200); }), 400); };
    paint();
    body.append(el('p', { class: 'dim', text: T('照黑板上的配方放材料。每放一樣，順時針攪拌，攪到顏色剛好變成下一個月相就停。', 'Add the ingredients as the blackboard says. After each, stir clockwise until the colour just becomes the next phase of the moon.') }),
      pot, info, el('div', { class: 'row wrap' }, ...ING.map(([id, name]) => el('button', { class: 'small', text: name, onclick: () => add(id) }))),
      el('div', { class: 'row' }, el('button', { text: T('🌀 攪拌', '🌀 Stir'), onclick: stir }), el('button', { class: 'small', text: T('倒掉重來', 'Pour it out'), onclick: reset })));
  },

  // Q04：點名簿——紅圈的名字；最後一個紅圈被刮掉，只剩學院的顏色（伺服器給）
  Q04(body, { conn, submit }) {
    const ROLL = [
      ['01', T('哈洛德・溫', 'Harold Wynn'), 'search'], ['03', T('沃恩', 'Vaughn'), ''], ['05', T('瑪莉・基爾', 'Mary Keel'), 'search'], ['07', T('艾洛拉', 'Elora'), ''],
      ['09', T('莉安娜', 'Liana'), 'liana'], ['12', T('月晞', 'Yuexi'), ''], ['14', T('湯瑪斯・葛林', 'Thomas Green'), 'search'], ['19', T('西里爾', 'Cyril'), ''],
    ];
    const list = el('ul', { class: 'ch2-roll' }, ...ROLL.map(([no, name, tag]) => el('li', { class: tag ? 'circled' : '' }, el('b', { text: no }), el('span', { text: name }),
      el('small', { text: tag === 'search' ? T('紅圈：去年 10 月 13 日', 'circled: 13 Oct last year') : tag === 'liana' ? T('紅圈：去年 12 月 13 日', 'circled: 13 Dec last year') : '' }))));
    const blank = el('li', { class: 'circled blank' }, el('b', { text: '??' }), el('span', { text: T('（名字被刮掉了）', '(the name has been scratched out)') }), el('small', { text: T('紅圈：今年 10 月 31 日', 'circled: 31 Oct this year') }));
    list.append(blank);
    conn.request({ t: 'peek', pid: 'Q04' }).then((r) => { if (r.t === 'peek') { const H = HOUSES[r.content.house]; blank.style.setProperty('--hc', H?.color ?? '#888'); blank.querySelector('span').textContent += `　${H?.sigil ?? ''} ${T('學院顏色：', 'house colour: ')}${H?.[getLang()] ?? ''}`; } });
    const inp = el('input', { inputmode: 'numeric', maxlength: '2', placeholder: '??', class: 'num' });
    inp.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') submit(inp.value.trim()); };
    body.append(el('p', { class: 'dim', text: T('講台抽屜的鎖：「被圈起來的人裡，還沒失蹤的那一個——他的座號。」', 'The lectern drawer’s lock: “Of those circled, the one not yet missing — their seat number.”') }), list,
      el('div', { class: 'row' }, inp, answerBtn(() => submit(inp.value.trim()))));
  },

  // Q05：諾克斯的櫃子——要先做好月影藥水（Q03），封印才會鬆開；之後是三格材料符號鎖
  Q05(body, { submit, state }) {
    if (!state.solved.includes('Q03')) { body.append(el('p', { text: T('櫃門上有一層魔法封印，摸起來冰冰的。旁邊刻著：「月影之下，我才開門。」', 'A magical seal lies over the cabinet door, cold to the touch. Carved beside it: “Only under moonshade do I open.”') })); return; }
    const SYM = [['moonwort', '☽ ' + T('月光草', 'moonwort')], ['batwing', '🦇 ' + T('蝙蝠翅', 'bat wing')], ['silver', '✧ ' + T('銀粉', 'silver dust')], ['mandrake', '❦ ' + T('曼德拉草', 'mandrake')], ['shriek', '🍄 ' + T('尖叫蘑菇', 'shrieking mushroom')], ['serpent', '🐍 ' + T('啞蛇的鱗', 'mute serpent scale')]];
    const dials = [0, 1, 2].map(() => select(SYM, '—'));
    body.append(el('p', { class: 'dim', text: T('封印鬆開了。櫃門上刻著三個空格：「我今天上課用的。」', 'The seal has loosened. Three blank slots are carved into the door: “What I used in class today.”') }),
      el('div', { class: 'row wrap' }, ...dials), answerBtn(() => submit(dials.map((d) => d.value).join(','))));
  },

  // Q08：黑板被擦掉的配方——三個空格
  Q08(body, { submit }) {
    const B1 = [['blackroot', T('黑根的汁', 'black-root sap')], ['silver', T('銀粉', 'silver dust')], ['mandrake', T('曼德拉草', 'mandrake')], ['moonwort', T('月光草', 'moonwort')]];
    const B2 = [['midnight', T('午夜十二點', 'midnight')], ['thirteen', T('十三點', 'thirteen o’clock')], ['dawn', T('天亮', 'dawn')], ['fullmoon', T('滿月', 'the full moon')]];
    const B3 = [['hername', T('她的名字', 'her name')], ['spell', T('光照咒', 'the light spell')], ['yourname', T('你的名字', 'your name')], ['nothing', T('什麼都不念', 'nothing at all')]];
    const s = [B1, B2, B3].map((o) => select(o, '＿＿＿'));
    body.append(el('p', { class: 'dim', text: T('光照咒照出擦過的粉筆灰：「蝕化解藥：把＿＿＿放進去，在＿＿＿的時候，念＿＿＿。」', 'The light spell reveals the wiped chalk: “Cure for the Blight: put in ___, at ___, speak ___.”') }),
      el('div', { class: 'col' }, ...s), answerBtn(() => submit(s.map((x) => x.value).join(','))));
  },

  // Q09：後門的拉桿——溫室的時鐘（遊戲裡 1 分＝3 秒），在對的時刻拉下
  Q09(body, { submit, state, panel }) {
    const clock = el('div', { class: 'ch2-clock' });
    const now = () => { const m = Math.floor((Date.now() - (state.segAt ?? Date.now())) / 3000) % 60; return { h: 8, m }; };
    const tick = () => { const { h, m } = now(); clock.textContent = `${h}:${String(m).padStart(2, '0')}`; };
    tick(); const timer = setInterval(tick, 250); panel.onClose = () => clearInterval(timer);
    body.append(el('p', { class: 'dim', text: T('溫室的時鐘走得很快（一分鐘只有三秒）。黑色的根纏在後門的鐵柵上。', 'The greenhouse clock runs fast (a minute lasts three seconds). Black roots coil round the bars of the back door.') }),
      clock, el('button', { class: 'primary', text: T('拉下拉桿！', 'Pull the lever!'), onclick: () => { const { h, m } = now(); submit(`${h}:${String(m).padStart(2, '0')}`); } }));
  },
  // ===== 第二幕 =====
  // Q10：去年的住院紀錄
  Q10(body, { submit }) {
    const ROWS = [['9/13', '3', T('發燒', 'fever')], ['10/2', '5', T('扭傷', 'sprain')], ['10/13', '13', T('左手出現黑紋', 'black veins, left hand')], ['11/13', '13', T('左手出現黑紋', 'black veins, left hand')],
      ['11/20', '2', T('咳嗽', 'cough')], ['12/13', '13', T('左手出現黑紋，昏迷', 'black veins, left hand; unconscious')], ['1/13', '13', T('左手出現黑紋', 'black veins, left hand')], ['2/13', '13', T('左手、脖子出現黑紋', 'black veins, left hand and neck')]];
    body.append(el('p', { class: 'dim', text: T('住院紀錄（日期、床號、症狀）。旁邊註記：「隔天轉學。」', 'Admissions (date, bed, symptoms). A note beside some: “Transferred the next day.”') }),
      el('table', { class: 'ch2-table' }, el('tr', {}, ...[T('日期', 'Date'), T('床號', 'Bed'), T('症狀', 'Symptoms')].map((h) => el('th', { text: h }))), ...ROWS.map((r) => el('tr', {}, ...r.map((c) => el('td', { text: c }))))));
    const inp = el('input', { inputmode: 'numeric', maxlength: '3', placeholder: '?', class: 'num' }); inp.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') submit(inp.value.trim()); };
    body.append(el('p', { text: T('歐文：「他們都睡同一張床……是哪一張？」', 'Owen: “They all slept in the same bed… which one?”') }), el('div', { class: 'row' }, inp, answerBtn(() => submit(inp.value.trim()))));
  },
  // Q11：藥櫃的天平鎖——放三瓶，跟抑制劑一樣重
  Q11(body, { submit }) {
    const B = [['sleep', T('安眠藥', 'Sleeping draught')], ['pain', T('止痛藥', 'Painkiller')], ['fever', T('退燒藥', 'Fever tonic')]];
    const pan = []; const show = el('p', { class: 'ch2-pan' });
    const paint = () => { show.textContent = `${T('右邊的秤盤', 'Right pan')}：${pan.map((id) => B.find((b) => b[0] === id)[1]).join(' ＋ ') || '—'}（${pan.length}／3）`; };
    paint();
    body.append(el('p', { class: 'dim', text: T('左邊秤盤上是一瓶「蝕化抑制劑」。右邊要放剛好三瓶，跟它一樣重，藥櫃才會打開。', 'A bottle of “Blight Suppressant” sits on the left pan. Put exactly three bottles on the right to balance it, and the cabinet will open.') }),
      el('ul', { class: 'hints' }, el('li', { text: T('標籤：兩瓶安眠藥＝一瓶抑制劑＋一瓶止痛藥', 'Label: two sleeping draughts = one suppressant + one painkiller') }), el('li', { text: T('標籤：三瓶止痛藥＝一瓶安眠藥', 'Label: three painkillers = one sleeping draught') }), el('li', { text: T('標籤：兩瓶退燒藥＝一瓶止痛藥', 'Label: two fever tonics = one painkiller') })),
      show, el('div', { class: 'row wrap' }, ...B.map(([id, name]) => el('button', { class: 'small', text: `＋ ${name}`, onclick: () => { if (pan.length < 3) { pan.push(id); paint(); } } }))),
      el('div', { class: 'row' }, el('button', { class: 'small', text: T('全部拿下來', 'Clear the pan'), onclick: () => { pan.length = 0; paint(); } }), answerBtn(() => submit(pan.join(',')))));
  },
  // Q12：檔案櫃——輸入抽屜號碼
  Q12(body, { submit }) {
    const inp = el('input', { inputmode: 'numeric', maxlength: '4', placeholder: '????', class: 'num' }); inp.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') submit(inp.value.trim()); };
    body.append(el('p', { class: 'dim', text: T('一整排檔案櫃，每個抽屜都有一個四位數的號碼，從 1880 號排到 1910 號。要打開哪一個？', 'A long row of cabinets; every drawer has a four-digit number, from 1880 to 1910. Which one do you open?') }), el('div', { class: 'row' }, inp, answerBtn(() => submit(inp.value.trim()))));
  },
  // Q13：鐵櫃的 4×4 燈格——點亮 6 格（X 光片：每排、每列的格數；床板上的釘子要隊友看）
  Q13(body, { conn, submit }) {
    const on = new Set(), cells = []; const grid = el('div', { class: 'ch2-xray' });
    const head = el('div', { class: 'ch2-xray-wrap' });
    conn.request({ t: 'peek', pid: 'Q13' }).then((r) => {
      if (r.t !== 'peek') return; const { row, col } = r.content;
      grid.append(el('i'), ...col.map((n, c) => el('b', { text: `${c + 1}：${n}` })));
      for (let rr = 0; rr < 4; rr++) { grid.append(el('b', { text: `${'ABCD'[rr]}：${row[rr]}` })); for (let c = 0; c < 4; c++) { const k = rr * 4 + c; const b = el('button', { class: 'cell', onclick: () => { if (on.has(k)) on.delete(k); else on.add(k); b.classList.toggle('on', on.has(k)); count.textContent = `${on.size}／6`; } }); cells.push(b); grid.append(b); } }
    });
    const count = el('span', { text: '0／6' });
    head.append(grid);
    body.append(el('p', { class: 'dim', text: T('鐵櫃上貼著一張被撕掉一半的 X 光片：只看得出每一排、每一列各有幾格亮著，看不出是哪幾格。要點亮正確的 6 格。（床板上的釘子在醫務室那邊。）', 'Half an X-ray is pasted on the cabinet: you can tell how many cells are lit in each row and column, but not which. Light the right 6 cells. (The nails in the bed board are back in the infirmary.)') }),
      head, el('div', { class: 'row' }, count, answerBtn(() => submit([...on]))));
  },
  // Q14：轉學同意書——只有一張的簽名是真的
  Q14(body, { submit }) {
    const DOCS = [['wynn', T('哈洛德・溫', 'Harold Wynn'), T('藍黑墨水，M 的最後一筆直直往下', 'blue-black ink; the M ends straight down')], ['keel', T('瑪莉・基爾', 'Mary Keel'), T('綠色墨水，M 的最後一筆直直往下', 'green ink; the M ends straight down')],
      ['liana', T('莉安娜', 'Liana'), T('綠色墨水，M 的最後一筆往上勾', 'green ink; the M ends with an upward hook')], ['green', T('湯瑪斯・葛林', 'Thomas Green'), T('黑色墨水，M 的最後一筆往上勾', 'black ink; the M ends with an upward hook')], ['moore', T('伊蒂絲・摩爾', 'Edith Moore'), T('綠色墨水，M 的最後一筆往下彎', 'green ink; the M curls downward')]];
    body.append(el('p', { class: 'dim', text: T('五張「轉學同意書」，每張都有校長奧德里克・米爾納的簽名（Aldric Milner）。只有一張是他親手簽的。', 'Five “transfer consent” forms, each signed by Headmaster Aldric Milner. Only one was signed by his own hand.') }),
      el('div', { class: 'col' }, ...DOCS.map(([id, name, note]) => el('button', { class: 'ch2-doc', onclick: () => submit(id) }, el('b', { text: name }), el('small', { text: note })))));
  },
  // Q15：留聲水晶的心跳（長、短）
  Q15(body, { submit, panel }) {
    const CODE = ['-.-', '-.', '---', '-..-']; // K N O X（玩家聽到的是心跳；這是畫面上一閃一閃的光）
    const lamp = el('div', { class: 'ch2-beat' }), seq = el('p', { class: 'ch2-morse' });
    let stop = false; panel.onClose = () => { stop = true; };
    const play = async () => {
      seq.textContent = '';
      for (const [w, word] of CODE.entries()) { for (const ch of word) { if (stop) return; lamp.classList.add('on'); sfx('heartbeat'); seq.textContent += ch === '-' ? '－' : '・'; await new Promise((r) => setTimeout(r, ch === '-' ? 650 : 220)); lamp.classList.remove('on'); await new Promise((r) => setTimeout(r, 260)); } if (w < CODE.length - 1) { seq.textContent += '　／　'; await new Promise((r) => setTimeout(r, 700)); } }
    };
    const inp = el('input', { maxlength: '8', placeholder: '????' }); inp.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') submit(inp.value.trim()); };
    body.append(el('p', { class: 'dim', text: T('水晶裡沒有說話的聲音，只有心跳。有長有短。', 'No voice in the crystal — only a heartbeat, long and short.') }), lamp, seq,
      el('button', { class: 'small', text: T('▶ 再聽一次', '▶ Listen again'), onclick: play }), el('div', { class: 'row' }, inp, answerBtn(() => submit(inp.value.trim()))));
    play();
  },
  // Q16：鑰匙牌上的刮痕（只有上半）；影子補完
  Q16(body, { submit, state }) {
    if (!state.solved.includes('Q13')) { body.append(el('p', { text: T('鐵櫃還鎖著。', 'The iron cabinet is still locked.') })); return; }
    const tag = el('div', { class: 'ch2-tag' }, el('span', { class: 'top', text: '1871' }), el('span', { class: 'shadow', text: '1871' }));
    const inp = el('input', { inputmode: 'numeric', maxlength: '4', placeholder: '????', class: 'num' }); inp.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') submit(inp.value.trim()); };
    body.append(el('p', { class: 'dim', text: T('歐文的手指已經僵了，還緊緊握著一把鑰匙。鑰匙牌上被指甲刮出幾道痕跡，只刮了一半。把它舉到燈下……', 'Owen’s fingers have stiffened around a key. Its tag has been scratched with a fingernail — only half-finished. Hold it up to the lamp…') }), tag,
      el('div', { class: 'row' }, inp, el('button', { class: 'primary small', text: T('打開這個號碼的抽屜', 'Open that drawer'), onclick: () => submit(inp.value.trim()) })));
  },
  // C2：西里爾的第二個抉擇
  C2(body, { submit, state, myChar }) {
    if (!state.solved.includes('Q16')) { body.append(el('p', { text: T('抽屜鎖著。', 'The drawer is locked.') })); return; }
    const playersHaveCyril = (state.members ?? []).some((m) => m.char === 'cyril');
    if (playersHaveCyril && myChar() !== 'cyril') { body.append(el('p', { text: T('西里爾搶先拿起了那份檔案，背對著大家看了很久。', 'Cyril snatches up the file first and reads it for a long time with his back to everyone.') })); return; }
    body.append(el('p', { text: T('副校長塞巴斯汀・莫瑞的檔案。二十年前，他和諾克斯同一年住進醫務室，症狀一樣。最後一頁蓋著銜尾蛇的印記——銜尾會。', 'Vice-Principal Sebastian Moray’s file. Twenty years ago he was admitted the same year as Knox, with the same symptoms. The last page bears the stamp of a serpent eating its tail — the Ouroboros Society.') }),
      el('p', { class: 'dim', text: playersHaveCyril ? T('（你是西里爾。這是你父親。）', '(You are Cyril. This is your father.)') : T('（電腦控制的西里爾看著你，等你替他決定。）', '(The computer-controlled Cyril looks at you, waiting for you to decide for him.)') }),
      el('div', { class: 'row' }, el('button', { text: T('告訴大家', 'Tell everyone'), onclick: () => submit('tell') }), el('button', { text: T('撕掉那一頁', 'Tear out the page'), onclick: () => submit('tear') })));
  },

  // ===== 第三幕 =====
  // Q19：側門的符文——赫爾嘉夫人在門外描述形狀，你照順序畫（點）出符文
  Q19(body, { conn, submit }) {
    const RUNES = [['algiz', 'ᛉ'], ['mannaz', 'ᛗ'], ['sowilo', 'ᛊ'], ['uruz', 'ᚢ'], ['kenaz', 'ᚲ'], ['ingwaz', 'ᛜ'], ['tiwaz', 'ᛏ'], ['gebo', 'ᚷ'], ['fehu', 'ᚠ'], ['isa', 'ᛁ'], ['laguz', 'ᛚ'], ['othala', 'ᛟ']];
    const said = el('ol', { class: 'hints' }), drawn = []; const show = el('p', { class: 'ch2-runes-drawn' });
    const paint = () => { show.textContent = drawn.map((id) => RUNES.find((r) => r[0] === id)[1]).join('  ') || '—'; };
    conn.request({ t: 'peek', pid: 'Q19' }).then((r) => { if (r.t === 'peek') r.content.desc.forEach((d) => said.append(el('li', { text: `${T('夫人', 'Helga')}：「${d}」` }))); else said.append(el('li', { text: T('門外沒有聲音。', 'No sound from beyond the door.') })); });
    paint();
    body.append(el('p', { class: 'dim', text: T('門被魔蝕封住了。赫爾嘉夫人隔著門，一個一個說出符文的樣子；你要照順序在門上畫出來（從兩邊同時畫才打得開）。', 'The door is sealed by the Blight. Through it, Madam Helga describes the runes one by one; draw them on the door in order (both sides at once, or it won’t open).') }),
      said, show, el('div', { class: 'ch2-runes' }, ...RUNES.map(([id, sym]) => el('button', { text: sym, onclick: () => { if (drawn.length < 4) { drawn.push(id); paint(); } } }))),
      el('div', { class: 'row' }, el('button', { class: 'small', text: T('擦掉重畫', 'Wipe and redraw'), onclick: () => { drawn.length = 0; paint(); } }), answerBtn(() => submit(drawn.join(',')))));
  },
  // Q20：血裡的符號＋牆上的四個學院徽記（銜尾蛇可以轉）
  Q20(body, { submit }) {
    body.append(el('p', { text: T('光照咒照下去，血滲進石縫的地方發出微光：一條蛇。但牠的頭和尾巴沒有咬在一起——中間空了一格。', 'Under the light spell, the blood seeped into the cracks glows: a serpent. But its head and tail do not meet — there is a gap between them.') }),
      el('p', { class: 'dim', text: T('牆上的四個學院徽記，只有銜尾蛇那一個可以轉。要轉成什麼樣子？', 'Of the four house crests on the wall, only the serpent turns. How should it sit?') }),
      el('div', { class: 'row wrap' },
        el('button', { text: T('◎ 頭咬著尾巴（原本的樣子）', '◎ Head biting tail (as it is)'), onclick: () => submit('closed') }),
        el('button', { text: T('ↄ 頭尾分開', 'ↄ Head and tail apart'), onclick: () => submit('open') }),
        el('button', { text: T('∞ 打一個結', '∞ Twisted into a knot'), onclick: () => submit('knot') })));
  },
  // Q21：銜尾蛇浮雕的 12 片鱗（像時鐘），照地上血腳印的方向按 5 片
  Q21(body, { submit, state }) {
    if (!state.solved.includes('Q20')) { body.append(el('p', { text: T('浮雕的鱗片都卡死了，按不下去。', 'The scales of the relief are jammed; none will press.') })); return; }
    const seq = []; const show = el('p', { class: 'ch2-runes-drawn' }); const paint = () => { show.textContent = seq.map((n) => `${n}`).join(' → ') || '—'; };
    const dial = el('div', { class: 'ch2-dial' });
    for (let h = 1; h <= 12; h++) { const a = (h / 12) * Math.PI * 2; dial.append(el('button', { text: String(h), style: `left:${50 + Math.sin(a) * 40}%;top:${50 - Math.cos(a) * 40}%`, onclick: () => { if (seq.length < 5) { seq.push(h); paint(); } } })); }
    paint();
    body.append(el('p', { class: 'dim', text: T('浮雕旁的小字：「照著他走的路，摸到牆上相同方向的鱗。」地上有一串血腳印，從校長倒下的地方走到牆邊。（北＝12 點）', 'Small letters by the relief: “Follow the path he walked; touch the scale that faces the same way.” A line of bloody footprints runs from where the headmaster fell to the wall. (North = 12 o’clock)') }),
      dial, show, el('div', { class: 'row' }, el('button', { class: 'small', text: T('重來', 'Start over'), onclick: () => { seq.length = 0; paint(); } }), answerBtn(() => submit(seq.join(',')))));
  },
  // Q22：大廳的大鐘（停在 12 點）——撥到「第十三響」
  Q22(body, { submit }) {
    let h = 12; const face = el('div', { class: 'ch2-clock', text: '12:00' });
    const set = (d) => { h = ((h - 1 + d + 12) % 12) + 1; face.textContent = `${h}:00`; };
    body.append(el('p', { class: 'dim', text: T('大鐘停在十二點整，晚宴遇襲的那一刻。月光從高窗照進來，柱子的影子會跟著鐘的時間移動。紙條上寫著：「十三號，地窖。」', 'The great clock stopped at twelve sharp — the moment the feast was attacked. Moonlight slants in; the pillars’ shadows move with the clock. The note said: “Thirteen. The cellar.”') }),
      face, el('div', { class: 'row' }, el('button', { text: '◀', onclick: () => set(-1) }), el('button', { text: '▶', onclick: () => set(1) }), el('button', { class: 'primary small', text: T('就停在這裡', 'Stop it here'), onclick: () => submit(String(h)) })));
  },

  // ---------- 第四幕 ----------
  // Q23：地窖鐵門的配方鎖——四個凹槽，依序放材料瓶
  Q23(body, { submit }) {
    const ING = [['moonwort', '☽', T('月光草', 'Moonwort')], ['serpent', '🐍', T('啞蛇的鱗', 'Mute serpent scale')], ['blackroot', '❧', T('黑根的汁', 'Black-root sap')], ['batwing', '🦇', T('蝙蝠翅', 'Bat wing')],
      ['mandrake', '❦', T('曼德拉草', 'Mandrake')], ['silver', '✧', T('銀粉', 'Silver dust')], ['shriek', '🍄', T('尖叫蘑菇', 'Shrieking mushroom')]];
    const put = []; const slots = el('div', { class: 'ch2-slots' });
    const paint = () => { slots.innerHTML = ''; for (let i = 0; i < 4; i++) { const g = ING.find((x) => x[0] === put[i]); slots.append(el('div', { class: g ? 'full' : '', text: g ? `${g[1]} ${g[2]}` : String(i + 1) })); } };
    paint();
    body.append(el('p', { class: 'dim', text: T('鐵門上有四個凹槽，旁邊一排材料瓶。門上刻著：「先做讓人看不見的，再做讓人醒來的。」', 'Four hollows are cut into the iron door; a row of ingredient jars stands beside it. Carved above: “First what makes you unseen, then what makes you wake.”') }),
      slots, el('div', { class: 'row wrap' }, ...ING.map(([id, s, name]) => el('button', { class: 'small', text: `${s} ${name}`, onclick: () => { if (put.length < 4) { put.push(id); paint(); sfx('click'); } } }))),
      el('div', { class: 'row' }, el('button', { class: 'small', text: T('全部拿出來', 'Take them all out'), onclick: () => { put.length = 0; paint(); } }), answerBtn(() => submit(put.join(',')))));
  },
  // Q24：諾克斯桌上的點名簿副本——缺席名單，每個名字被劃掉一個字母（名單由伺服器給）
  Q24(body, { conn }) {
    const list = el('ol', { class: 'ch2-struck' });
    conn.request({ t: 'peek', pid: 'Q24' }).then((r) => {
      if (r.t !== 'peek') { list.append(el('li', { text: T('字跡糊掉了。', 'The ink has run.') })); return; }
      for (const [name, at] of r.content.names) list.append(el('li', {}, ...[...name].map((ch, i) => (i === at ? el('s', { text: ch }) : document.createTextNode(ch)))));
    });
    body.append(el('p', { class: 'dim', text: T('點名簿的最後一頁：「今晚缺席」。名字都是用拼音寫的，每個名字上都有一道紅筆劃過。紙角寫著：「口令，給還醒著的孩子。」', 'The last page of the roll book: “Absent tonight.” Every name has a single red stroke through it. In the corner: “The password, for the children still awake.”') }), list,
      el('p', { class: 'dim', text: T('（往宿舍塔樓的門要說口令。）', '(The door to the dormitory tower wants a password.)') }));
  },
  // Q24（門）：往宿舍塔樓的門——說出口令
  towerdoor(body, { submit, state }) {
    const inp = el('input', { maxlength: '8', placeholder: T('口令', 'Password'), class: 'num' });
    inp.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') submit(inp.value.trim()); };
    body.append(el('p', { class: 'dim', text: T('門後有小孩壓低聲音的哭聲。門上的銅牌：「說出口令。」', 'Behind the door, a child is crying quietly. A brass plate reads: “Speak the password.”') }),
      ...(state.solved.includes('Q24') ? [] : [el('div', { class: 'row' }, inp, answerBtn(() => submit(inp.value.trim())))]));
  },
  // Q25：塔樓門上的時鐘鎖——依序轉到四個時間
  Q25(body, { submit }) {
    let h = 12; const seq = []; const face = el('div', { class: 'ch2-clock', text: '12' }); const show = el('p', { class: 'ch2-runes-drawn' });
    const paint = () => { face.textContent = `${h}`; show.textContent = seq.join(' → ') || '—'; };
    const set = (d) => { h = ((h - 1 + d + 12) % 12) + 1; paint(); sfx('click'); };
    paint();
    body.append(el('p', { class: 'dim', text: T('門上的鎖像一個時鐘，要轉四次，每次「喀」一聲記下來。門縫塞了赫爾嘉夫人的紙條：「我巡房的時間，從你們偷溜出去的那一晚開始算。」', 'The lock is shaped like a clock: turn it four times, clicking each one in. Madam Helga’s note is wedged in the door: “The times of my rounds — counted from the night you first sneaked out.”') }),
      face, el('div', { class: 'row' }, el('button', { text: '◀', onclick: () => set(-1) }), el('button', { text: '▶', onclick: () => set(1) }),
        el('button', { class: 'small', text: T('喀（記下）', 'Click (set)'), onclick: () => { if (seq.length < 4) { seq.push(h); paint(); sfx('click'); } } })),
      show, el('div', { class: 'row' }, el('button', { class: 'small', text: T('歸零', 'Reset'), onclick: () => { seq.length = 0; paint(); } }), answerBtn(() => submit(seq.join(',')))));
  },
  // Q26：樓梯的五盞燈——按一層，那一層和上下相鄰的燈都會切換；全亮就送出
  Q26(body, { submit, solved, state }) {
    if (!state.solved.includes('Q25')) { body.append(el('p', { text: T('開關箱在樓梯門後面，門上掛著赫爾嘉夫人的時鐘鎖。', 'The switch box is behind the stair door, and Madam Helga’s clock lock hangs on it.') })); return; }
    const on = [false, true, false, true, false]; let pressed = [0, 0, 0, 0, 0], sent = false; // 一開始第 2、4 層亮（題目本身）
    const col = el('div', { class: 'ch2-stairs' }), info = el('p', { class: 'dim' });
    const paint = () => {
      col.innerHTML = '';
      for (let i = 4; i >= 0; i--) col.append(el('button', { class: on[i] ? 'lit' : '', text: `${T('第', 'Floor ')}${i + 1}${T(' 層', '')}　${on[i] ? '💡' : '·'}`, onclick: () => press(i) }));
      info.textContent = T(`按了 ${pressed.reduce((a, b) => a + b, 0)} 下`, `${pressed.reduce((a, b) => a + b, 0)} presses`);
    };
    const press = (i) => {
      if (sent || solved) return;
      for (const k of [i - 1, i, i + 1]) if (k >= 0 && k < 5) on[k] = !on[k];
      pressed[i] ^= 1; sfx('click'); paint();
      if (on.every(Boolean)) { sent = true; submit(pressed.map((v, k) => (v ? k + 1 : 0)).filter(Boolean).join(',')).then((r) => { if (!r?.solved) setTimeout(reset, 1200); }); }
    };
    const reset = () => { on.splice(0, 5, false, true, false, true, false); pressed = [0, 0, 0, 0, 0]; sent = false; paint(); };
    paint();
    body.append(el('p', { class: 'dim', text: T('五層樓梯各有一盞燈。按一層的開關，那一層和上下相鄰的燈都會切換。低年級生躲在頂樓，燈沒有全亮，他們不敢下來。', 'Each of the five landings has a lamp. A switch flips its own lamp and the ones directly above and below. The first-years hiding at the top won’t come down until every lamp is lit.') }),
      col, info, el('button', { class: 'small', text: T('全部關回原樣', 'Put them back as they were'), onclick: reset }));
  },

};

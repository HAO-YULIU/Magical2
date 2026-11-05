// 第二章的謎題畫面（帳號二，2026-11-05）：序幕、第一幕（Q01～Q05、Q08、Q09）。Q06、Q07 是走過去調查的（logic/ch2act1.mjs）。
// 作答都送到伺服器判斷，這裡沒有答案（Q03 的攪拌、Q09 的時鐘只是操作，判斷還是在伺服器）。
import { el } from './overlay.mjs';
import { getLang } from '../logic/i18n.mjs';
import { PUMPKIN_GRID } from '../data/ch2-act1.mjs';
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
};

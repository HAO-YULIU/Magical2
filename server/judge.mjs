// 判斷答案（只在伺服器執行）。題目資料見 data/puzzles/ch1.mjs。
// 隨機的題目（P09、P21、救援題、自救題）用房間的亂數種子決定，同一個房間每次結果一樣，不同房間不同。
import { CHAPTER1, RESCUE, SELF_RESCUE, HOUSE_HOUR, BOOK_CIPHER, BRAILLE_DOOR, ROOF } from '../data/puzzles/ch1.mjs';
import { CHAPTER2, SEATS, GREEN_SPOTS, RUNE_DESC, STRUCK } from '../data/puzzles/ch2.mjs';

// 第二章（2026-11-05 起）：序幕、第一幕用第二章的題目（Q01～Q09）；第二幕以後暫時還是第一章的題目，之後一段一段換掉
const CH1_LATER = {}; // 第二章：第一章的題目全部換掉了（救援題、自救題還沿用）
export const PUZZLES = { ...CHAPTER2, ...CH1_LATER, ...RESCUE, ...SELF_RESCUE };
export { SEATS, GREEN_SPOTS };
const CH2_CHARS = ['elora', 'yuexi', 'vaughn', 'cyril'];
// Q04：被圈起來、還沒失蹤的那一個（房間裡有人扮演的角色優先）
export const circledChar = (seed, chars = []) => { const pool = chars.length ? chars : CH2_CHARS; return pool[Math.floor(rng(seed, 'Q04')() * pool.length)]; };
// Q13：4×4 的 6 格。釘子 10 根（包含答案的 6 格）；X 光片上每排、每列各有幾格。只收「釘子裡只有一組符合」的題目
export function xrayPuzzle(seed) {
  const r = rng(seed, 'Q13');
  const combos = (arr, k) => (k === 0 ? [[]] : arr.flatMap((x, i) => combos(arr.slice(i + 1), k - 1).map((c) => [x, ...c])));
  const counts = (cells) => { const row = [0, 0, 0, 0], col = [0, 0, 0, 0]; for (const c of cells) { row[c >> 2]++; col[c & 3]++; } return { row, col }; };
  for (let tries = 0; tries < 500; tries++) {
    const all = [...Array(16).keys()], nails = []; while (nails.length < 10) nails.push(all.splice(Math.floor(r() * all.length), 1)[0]);
    nails.sort((a, b) => a - b);
    const pick = [...nails]; const ans = []; while (ans.length < 6) ans.push(pick.splice(Math.floor(r() * pick.length), 1)[0]);
    ans.sort((a, b) => a - b);
    const want = JSON.stringify(counts(ans));
    if (combos(nails, 6).filter((c) => JSON.stringify(counts(c)) === want).length === 1) return { nails, ans, ...counts(ans) };
  }
  return null;
}
// Q17：被下藥的那一壺（1～6）、諾克斯端的另一壺、每桌喝了幾杯（下藥那桌最多）。壺 k 放在第 ceil(k/2) 張桌子（三張桌、每桌兩壺）
export function juicePuzzle(seed) {
  const r = rng(seed, 'Q17'); const drugged = 1 + Math.floor(r() * 6);
  let other; do { other = 1 + Math.floor(r() * 6); } while (Math.ceil(other / 2) === Math.ceil(drugged / 2));
  const helga = [1, 2, 3, 4, 5, 6].filter((k) => k !== drugged && k !== other)[Math.floor(r() * 4)];
  const cups = [1, 2, 3].map((tb) => (tb === Math.ceil(drugged / 2) ? 11 + Math.floor(r() * 3) : 4 + Math.floor(r() * 5)));
  return { drugged, other, helga, cups };
}
// Q24：缺席名單的口令（四個字選一個）
export const struckWord = (seed) => Object.keys(STRUCK)[Math.floor(rng(seed, 'Q24')() * 4)];
// Q19：四個符文（不重複）
export function runePuzzle(seed) { const r = rng(seed, 'Q19'), left = RUNE_DESC.map((x) => x[0]), out = []; while (out.length < 4) out.push(left.splice(Math.floor(r() * left.length), 1)[0]); return out; }
// Q06：溫室裡被動過手腳的三個地方
export function greenSpots(seed) { const r = rng(seed, 'Q06'), left = [...GREEN_SPOTS], out = []; while (out.length < 3) out.push(left.splice(Math.floor(r() * left.length), 1)[0]); return out; }
export const HOUSES = ['eldrin', 'grimoire', 'belmont', 'ouroboros'];
export const HOUSE_EN = { eldrin: 'ELDRIN', grimoire: 'GRIMOIRE', belmont: 'BELMONT', ouroboros: 'OUROBOROS' };

// ---------- 亂數 ----------
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function rng(seed, key) { // mulberry32
  let a = hash(`${seed}:${key}`);
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (r, list) => list[Math.floor(r() * list.length)];

// ---------- 正規化 ----------
const FULL = /[！-～]/g; // 全形英數 → 半形
export function norm(v) {
  return String(v ?? '')
    .normalize('NFKC').replace(FULL, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .toUpperCase()
    .replace(/[\s　.,，。、;；:：!！?？'"「」『』()（）·・\-—_]+/g, '');
}
const normSeq = (v) => String(v ?? '').split(/[,，、\s]+/).map((x) => x.trim().toLowerCase()).filter(Boolean).join(',');
const byLang = (ans, lang) => (ans && typeof ans === 'object' && !Array.isArray(ans) && ('zh' in ans || 'en' in ans) ? ans[lang] ?? ans.zh : ans);
const asList = (a) => (Array.isArray(a) ? a : [a]);

// ---------- 找異常長廊（P09） ----------
// 異常的編號對應 docs/05-puzzles-ch1.md 的清單；前面是輕微的，越後面越嚇人
export const ANOMALIES = {
  mild: ['candle_down', 'pose', 'empty_frame', 'carpet', 'frame_count', 'back_turned', 'candle_missing', 'rain_stops', 'longer'],
  mid: ['eyes_follow', 'black_ooze', 'door_handle', 'shadow_lag', 'clock_reverse', 'familiar_gone', 'handprints', 'green_lamp', 'lullaby'],
  severe: ['liana', 'face_gouged', 'hanging_cat', 'rush_figure'],
  house: { eldrin: 'glowing_steps', grimoire: 'plaque_changed', belmont: 'armor_breath', ouroboros: 'clock_slow' },
};
// 第 attempt 次挑戰的第 n 趟長廊
// skip：沒有人看得到的學院（多人時電腦控制的學院），那個學院的專屬異常換成一般的
export function corridorLoop(seed, attempt, n, { rate = 0.6, skip = [] } = {}) {
  if (n === 0) return null; // 每次挑戰的第一趟一定正常
  const r = rng(seed, `P09:${attempt}:${n}`);
  if (r() >= rate) return null;
  const pool = n <= 2 ? ANOMALIES.mild : n <= 5 ? [...ANOMALIES.mild, ...ANOMALIES.mid] : [...ANOMALIES.mid, ...ANOMALIES.severe];
  const withHouse = r() < 0.15; // 學院專屬的異常（單人要切換使魔視角才看得到）
  if (withHouse) { const h = pick(r, HOUSES); if (!skip.includes(h)) return { id: ANOMALIES.house[h], house: h }; }
  return { id: pick(r, pool), house: null };
}

// ---------- 沙漏（P06） ----------
// actions：[{ t: 遊戲分鐘, a: 'flip', g: [7] | [11] | [7, 11] }, ..., { t, a: 'knock' }]
// 回傳每個沙漏漏完的時間點；敲門要剛好在目標時間、而且是某個沙漏漏完的那一刻（不是看時鐘猜的）
export function simulateHourglass(glasses, actions) {
  const top = Object.fromEntries(glasses.map((g) => [g, 0])); // 上半部剩下的沙（分鐘）
  const bottom = Object.fromEntries(glasses.map((g) => [g, g]));
  const events = [];
  let now = 0; let knock = null;
  const sorted = [...actions].filter((a) => Number.isFinite(+a?.t)).sort((a, b) => a.t - b.t);
  const advance = (to) => {
    for (const g of glasses) {
      if (top[g] > 0) {
        const run = Math.min(top[g], to - now);
        top[g] -= run; bottom[g] += run;
        if (top[g] <= 1e-9 && run > 0) events.push(+(now + run).toFixed(3));
      }
    }
    now = to;
  };
  for (const a of sorted) {
    if (a.t < now) continue;
    advance(a.t);
    if (a.a === 'flip') for (const g of asList(a.g)) if (g in top) { const t = top[g]; top[g] = bottom[g]; bottom[g] = t; }
    if (a.a === 'knock') { knock = a.t; break; }
  }
  return { events, knock };
}

// ---------- 哭泣的娃娃（P31）：第 round 次是哪一個在哭 ----------
export const cryingDoll = (seed, round, count) => Math.floor(rng(seed, `P31:${round}`)() * count);

// ---------- 拉桿（P26） ----------
export function simulateLevers(def, pulls) {
  const locked = new Set(def.locked);
  for (const p of asList(pulls)) for (const b of def.levers[p] ?? []) (locked.has(b) ? locked.delete(b) : locked.add(b));
  return [...locked];
}

// ---------- 救援題、自救題的內容 ----------
// 第二章（魔藥與點名簿）：R1 黑根上的藥草 → 解藥鍋裡剋制它的材料（牆上的對照表，畫面 game/src/ui/puzzles.mjs 也有一份）
export const HERB_CURE = { nightshade: 'silver', wolfsbane: 'moonwort', hemlock: 'mandrake', blackroot: 'batwing' };
const COUNTER = HERB_CURE;
// R3：諾克斯的錄音念的名字（點名簿上的拼音）；其中一個被念了兩次
const ROLL_NAMES = ['Harold', 'Ingrid', 'Darcy', 'Edith', 'Simon', 'Clara', 'Felix', 'Esme', 'Oswin', 'Rowan', 'Hector', 'Silas', 'Tobias', 'Yvette', 'Mabel', 'Quinn'];
const VIG_WORDS = ['NOMEN DELETUM', 'LIBERA ME', 'NON ADSUM', 'REDEO'];
// R3 的名單：從亂數抽 7 個不同的名字，再把其中一個插回去（念兩次）
function rollRecording(r) {
  const pool = [...ROLL_NAMES], list = [];
  for (let i = 0; i < 7; i++) list.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  const dup = list[Math.floor(r() * 5)], at = list.indexOf(dup) + 2 + Math.floor(r() * (7 - list.indexOf(dup) - 1));
  list.splice(at, 0, dup);
  return { list, dup };
}
const LIARS = [ // 三顆頭（左、中、右）各說一句話，只有一顆說真話；root＝要切斷的黑根（每題都驗證過只有一個解，見 tools/test/judge.test.mjs）
  { says: ['not_left', 'right_is_root', 'middle_lies'], root: 'left' },
  { says: ['middle_is_root', 'left_lies', 'not_right'], root: 'right' },
  { says: ['not_middle', 'right_lies', 'left_is_root'], root: 'middle' },
];
export const LIAR_SETS = LIARS; // 測試用
const shiftWord = (w, k) => w.replace(/[A-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 65 + k) % 26 + 26) % 26 + 65));
const vigenere = (w, key) => { let i = 0; return w.replace(/[A-Z]/g, (c) => shiftWord(c, key.charCodeAt(i++ % key.length) - 65)); };

// 給畫面用的題目內容（不含答案）。house：被抓的人的學院
export function rescueContent(pid, seed, key, { house } = {}) {
  const r = rng(seed, `${pid}:${key}`);
  switch (pid) {
    case 'R1': return { roots: Array.from({ length: 4 }, () => pick(r, Object.keys(COUNTER))) };
    case 'R3': return { names: rollRecording(r).list };
    case 'S1': return { cipher: vigenere(pick(r, VIG_WORDS), HOUSE_EN[house] ?? 'MILNER') };
    case 'S2': return { rounds: Array.from({ length: 3 }, () => Math.floor(r() * 8) * 45) }; // 聲音的方向（度）
    case 'S4': return { says: pick(r, LIARS).says };
    default: return {};
  }
}
export function rescueAnswer(pid, seed, key) {
  const r = rng(seed, `${pid}:${key}`);
  switch (pid) {
    case 'R1': return Array.from({ length: 4 }, () => COUNTER[pick(r, Object.keys(COUNTER))]).join(',');
    case 'R3': return rollRecording(r).dup;
    case 'S1': return pick(r, VIG_WORDS);
    case 'S2': return Array.from({ length: 3 }, () => Math.floor(r() * 8) * 45).join(',');
    case 'S4': return pick(r, LIARS).root;
    default: return null;
  }
}

// P14：書的某一頁（每頁 24 個字或詞）。答案的字放在指定位置，其他是隨機的填充文字
const FILL_ZH = '的一是在不了有和人這中大為上個國我以要他時來用們生到作地於出就分對成會可主發年動同工也能下過子說產種面而方後多定行學法所民得經十三之進著等部度家電力裡如水化高自二理起小物現實加量都兩體制機當使點從業本去把性好應開它合還因由其些然前外天政四日那社義事平形相全表間樣與關各重新線內數正心反你明看原又麼利比或但質氣第向道命此變條只沒結解問意建月公無系軍很情者最立代想已通並提直題黨程展五果料象員革位入常文總次品式活設及管特件長求老頭基資邊流路級少圖山統接知較將組見計別她手角期根論運農指幾九區強放決西被幹做必戰先回則任取據處府研隊南給色光門即保治北造百規熱領七海口東導器壓志世金增爭濟階油思術極交受聯什認六共權收證改清己美再採轉更單風切打白教速花帶安場身車例真務具萬每目至達走積示議聲報鬥完類八離華名確才科張信馬節話米整空元況今集溫傳土許步群廣石記需段研界拉林律叫且究觀越織裝影算低持音眾書布復容兒須際商非驗連斷深難近礦千週委素技備半辦青省列習響約支般史感勞便團往酸歷市克何除消構府稱太準精值號率族維劃選標寫存候毛親快效斯院查江型眼王按格養易置派層片始卻專狀育廠京識適屬圓包火住調滿縣局照參紅細引聽該鐵價嚴';
const FILL_EN = 'the of and a to in is was he for it with as his on be at by i had not are but from or have an they which one you were her all she there would their we him been has when who will more no if out so said what up its about into than them can only other new some could time these two may then do first any my now such like our over man me even most made after also did many before must through back years where much your way well down should because each just those people how too little state good very make world still own see men work long get here between both life being under never day same another know while last might us great old year off come since against go came right used take three'.split(' ');
export function bookPage(seed, lang, book, page) {
  const en = lang === 'en';
  const r = rng(seed, `book:${book}:${page}`);
  const words = Array.from({ length: 24 }, () => (en ? FILL_EN[Math.floor(r() * FILL_EN.length)] : FILL_ZH[Math.floor(r() * FILL_ZH.length)]));
  for (const [b, p, w, word] of BOOK_CIPHER[en ? 'en' : 'zh']) if (b === book && p === page) words[w - 1] = en ? word.toLowerCase() : word;
  return words;
}
export const brailleDoor = () => BRAILLE_DOOR;

// P07 的燭光（摩斯密碼）：只送電腦控制的同伴那幾座塔
const MORSE = ['-----', '.----', '..---', '...--', '....-', '.....', '-....', '--...', '---..', '----.'];
export const morseHours = (aiHouses) => Object.fromEntries(aiHouses.map((h) => [h, String(HOUSE_HOUR[h]).split('').map((d) => MORSE[+d])]));

// ---------- 主判斷 ----------
// ctx：{ seed, lang（謎題語言）, house（作答者的學院）, solo, aiHouses（電腦控制的同伴的學院）, state（這題的伺服器狀態，可修改）, key（救援題的抽題鍵） }
// 回傳：{ ok, solved?, reveal?, reply? }。solved＝這題解開了；reply＝給作答者的額外資訊
export function judge(pid, value, ctx) {
  const def = PUZZLES[pid];
  if (!def) return { ok: false, error: 'bad_puzzle' };
  if (def.solo && !ctx.solo) return { ok: false, error: 'bad_puzzle' };
  // 學院專屬的題目：多人時那個學院由電腦控制（沒人扮演），就誰都可以做（不然會卡關）
  if (def.house && !ctx.solo && ctx.house !== def.house && !(ctx.aiHouses ?? []).includes(def.house)) return { ok: false, error: 'not_your_house' };
  const lang = ctx.lang === 'en' ? 'en' : 'zh';

  switch (def.kind) {
    case 'event': return { ok: true, solved: true };
    case 'rollcircle': { const c = circledChar(ctx.seed, ctx.chars); return { ok: true, solved: norm(value) === norm(SEATS[c]) || +value === +SEATS[c] }; }
    case 'xray': { const x = xrayPuzzle(ctx.seed); const got = asList(value).map(Number).sort((a, b) => a - b).join(','); return { ok: true, solved: !!x && got === x.ans.join(',') }; }
    case 'struck': return { ok: true, solved: norm(value) === struckWord(ctx.seed) };
    case 'lights': { const got = (Array.isArray(value) ? value : String(value ?? '').split(/[,，、\s]+/)).filter((x) => x !== '').map(Number).sort((a, b) => a - b).join(','); return { ok: true, solved: def.ans.includes(got) }; }
    case 'jug': return { ok: true, solved: +value === juicePuzzle(ctx.seed).drugged };
    case 'runes': return { ok: true, solved: asList(value).map((v) => String(v).trim().toLowerCase()).join(',') === runePuzzle(ctx.seed).join(',') };
    case 'spots': { const want = greenSpots(ctx.seed).sort().join(','); const got = asList(value).map(String).sort().join(','); return { ok: true, solved: got === want }; }
    case 'choice': return def.options.includes(value) ? { ok: true, solved: true, flag: value } : { ok: false, error: 'bad_value' };
    case 'text': {
      const ok = asList(byLang(def.ans, lang)).some((a) => norm(a) === norm(value));
      return ok ? { ok: true, solved: true, reveal: def.reveal } : { ok: true, solved: false };
    }
    case 'seq': {
      const ok = asList(byLang(def.ans, lang)).some((a) => normSeq(a) === normSeq(value));
      return { ok: true, solved: ok };
    }
    case 'set': {
      // P02 的傳聞：另一種語言的說法也算對（隊友的介面語言不同時不會卡住）
      const other = def.ans?.zh && def.ans?.en ? byLang(def.ans, lang === 'en' ? 'zh' : 'en') : [];
      const groups = byLang(def.ans, lang).map((g, k) => [...g, ...(other[k] ?? [])].map(norm));
      const given = asList(value).map(norm).filter(Boolean);
      if (given.length !== groups.length) return { ok: true, solved: false };
      const used = new Set();
      const ok = given.every((v) => { const i = groups.findIndex((g, k) => !used.has(k) && g.includes(v)); if (i < 0) return false; used.add(i); return true; });
      return { ok: true, solved: ok };
    }
    case 'hours': { // P07：電腦控制的同伴所在的塔傳來的時辰
      if (!ctx.aiHouses?.length) return { ok: false, error: 'not_needed' };
      const want = Object.entries(HOUSE_HOUR).filter(([h]) => ctx.aiHouses.includes(h));
      const ok = value && typeof value === 'object' && want.every(([h, n]) => +value[h] === n);
      return { ok: true, solved: !!ok };
    }
    case 'hourglass': {
      const { events, knock } = simulateHourglass(def.glasses, asList(value));
      const ok = knock !== null && Math.abs(knock - def.target) < 0.01 && events.some((e) => Math.abs(e - knock) < 0.01);
      return { ok: true, solved: ok, reveal: ok ? def.ans : undefined };
    }
    case 'levers': return { ok: true, solved: simulateLevers(def, value).length === 0 };
    case 'corridor': { // value：{ loop, choice: 'back' | 'forward' }
      const st = ctx.state;
      st.attempt ??= 0; st.n ??= 0; st.streak ??= 0;
      if (+value?.loop !== st.n) return { ok: false, error: 'bad_value', reply: { loop: st.n } };
      const skip = ctx.solo ? [] : ctx.aiHouses ?? [];
      const anomaly = corridorLoop(ctx.seed, st.attempt, st.n, { rate: def.rate, skip });
      const right = (value.choice === 'back') === !!anomaly;
      if (right) { st.streak++; st.n++; } else { st.attempt++; st.n = 0; st.streak = 0; }
      const done = st.streak >= def.streak;
      return { ok: true, solved: done, reply: { right, streak: st.streak, loop: st.n, next: done ? null : corridorLoop(ctx.seed, st.attempt, st.n, { rate: def.rate, skip }) } };
    }
    case 'balance': { // value：{ weigh: { left: [..], right: [..] } } 或 { pick: 瓶子編號 }
      const st = ctx.state;
      st.round ??= 0; st.used ??= 0;
      const heavy = Math.floor(rng(ctx.seed, `P21:${st.round}`)() * def.count);
      const reshuffle = () => { st.round++; st.used = 0; };
      if (value?.weigh) {
        if (st.used >= def.weighings) { reshuffle(); return { ok: true, solved: false, reply: { reshuffled: true } }; }
        st.used++;
        const L = asList(value.weigh.left).map(Number), R = asList(value.weigh.right).map(Number);
        const w = (side) => side.length + (side.includes(heavy) ? 0.1 : 0);
        const result = w(L) > w(R) ? 'left' : w(L) < w(R) ? 'right' : 'equal';
        return { ok: true, solved: false, reply: { result, used: st.used } };
      }
      if (value && 'pick' in value) {
        const ok = +value.pick === heavy;
        if (!ok) reshuffle();
        return { ok: true, solved: ok, reply: ok ? {} : { reshuffled: true } };
      }
      return { ok: false, error: 'bad_value' };
    }
    case 'doll': { // P31：value＝{ pick: 娃娃編號 }
      const st = ctx.state; st.round ??= 0;
      if (!value || !('pick' in value)) return { ok: false, error: 'bad_value' };
      const ok = +value.pick === cryingDoll(ctx.seed, st.round, def.count);
      if (!ok) st.round++; // 抱錯了：換另一個娃娃哭
      return { ok: true, solved: ok, reply: ok ? {} : { reshuffled: true } };
    }
    case 'roof': { // P29：value＝{ cell: [欄, 排] }；每個人自己的進度。踩錯石板就碎掉，從頭來
      if (value?.reset) { ctx.state[ctx.uid] = { at: null, i: 0 }; return { ok: true, solved: false, reply: { reset: true } }; } // 退回起點（離開石板）
      const me = (ctx.state[ctx.uid] ??= { at: null, i: 0 });
      const [c, r] = Array.isArray(value?.cell) ? value.cell.map(Math.trunc) : [];
      if (!(c >= 0 && c < 6 && r >= 0 && r < 6)) return { ok: false, error: 'bad_value' };
      const near = me.at ? Math.abs(me.at[0] - c) + Math.abs(me.at[1] - r) === 1 : r === 5;
      const want = [...def.word][me.i % [...def.word].length];
      if (!near || [...ROOF[r]][c] !== want) { ctx.state[ctx.uid] = { at: null, i: 0 }; return { ok: true, solved: false, reply: { broke: [c, r] } }; }
      me.at = [c, r]; me.i++;
      return { ok: true, solved: r === 0, reply: { step: me.i } };
    }
    case 'counter': case 'dupname': case 'vigenere': case 'direction': case 'liar': {
      const want = rescueAnswer(pid, ctx.seed, ctx.key);
      const ok = def.kind === 'counter' || def.kind === 'direction' ? normSeq(want) === normSeq(value) : norm(want) === norm(value);
      return { ok: true, solved: ok };
    }
    default: return { ok: false, error: 'bad_puzzle' };
  }
}

// P09 第三張提示：這一趟要注意哪一類東西
const FOCUS = {
  candle: { ids: ['candle_down', 'candle_missing'], zh: '燭台和火焰', en: 'the candles and flames' },
  paint: { ids: ['pose', 'empty_frame', 'frame_count', 'back_turned', 'eyes_follow', 'black_ooze', 'liana', 'face_gouged', 'plaque_changed'], zh: '兩旁的畫', en: 'the paintings' },
  floor: { ids: ['carpet', 'green_lamp', 'handprints', 'shadow_lag', 'glowing_steps'], zh: '地上和牆上', en: 'the floor and walls' },
  sound: { ids: ['rain_stops', 'lullaby', 'armor_breath'], zh: '聲音', en: 'the sounds' },
  space: { ids: ['longer', 'door_handle', 'clock_reverse', 'clock_slow', 'hanging_cat', 'rush_figure', 'familiar_gone'], zh: '走廊本身：長度、門、窗外、天花板', en: 'the corridor itself: its length, the door, the window, the ceiling' },
};
export function corridorFocus(anomaly, lang) {
  const k = lang === 'en' ? 'en' : 'zh';
  if (!anomaly) return k === 'en' ? 'compare everything carefully — nothing may be wrong this time' : '每個地方都仔細比對，這一趟也可能完全正常';
  const f = Object.values(FOCUS).find((x) => x.ids.includes(anomaly.id));
  return f ? f[k] : FOCUS.space[k];
}

// 提示（第 n 張，0～2）
export function hint(pid, n, lang, ctx = {}) {
  const def = PUZZLES[pid];
  const list = def?.hints?.[lang === 'en' ? 'en' : 'zh'];
  if (!list || n < 0 || n >= list.length) return null;
  let text = list[n];
  if (pid === 'P09' && ctx.focus) text = text.replace('{focus}', ctx.focus);
  if (pid === 'Q06' && ctx.spot) text = text.replace('{spot}', ctx.spot);
  if (pid === 'Q13' && ctx.cells) text = text.replace('{cells}', ctx.cells);
  if (pid === 'Q17' && ctx.jug) text = text.replace('{jug}', ctx.jug);
  if (pid === 'Q19' && ctx.runes) text = text.replace('{runes}', ctx.runes);
  if (pid === 'Q24' && ctx.letters) text = text.replace('{letters}', ctx.letters);
  return text;
}

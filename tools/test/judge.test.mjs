// 答案判斷的單元測試：每一題的正確答案要對、錯誤答案要錯
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { judge, hint, circledChar, greenSpots, SEATS, simulateHourglass, corridorLoop, corridorFocus, rescueContent, PUZZLES, LIAR_SETS } from '../../server/judge.mjs';
import { ROOF as ROOF_GAME } from '../../game/src/data/act4-ch1.mjs';
import { ROOF } from '../../data/puzzles/ch1.mjs';
import { CHAPTER1 } from '../../data/puzzles/ch1.mjs';
import { CHAPTER2 } from '../../data/puzzles/ch2.mjs';

const ctx = (o = {}) => ({ seed: 'test-seed', lang: 'zh', house: null, solo: true, state: {}, ...o });
const ok = (pid, v, o) => judge(pid, v, ctx(o)).solved;

test('文字、順序、集合題', () => {
  // 第二章（序幕、第一幕）
  assert.equal(ok('Q01', '3104'), true); assert.equal(ok('Q01', '4013'), false);
  assert.equal(ok('Q02', 'tri,stitch'), true); assert.equal(ok('Q02', 'stitch,tri'), false);
  assert.equal(ok('Q03', 'mandrake,shriek,serpent'), true); assert.equal(ok('Q03', 'shriek,mandrake,serpent'), false);
  assert.equal(ok('Q05', 'moonwort,batwing,silver'), true);
  assert.equal(ok('Q08', 'blackroot,thirteen,hername'), true);
  assert.equal(ok('Q09', '8:36'), true); assert.equal(ok('Q09', '836'), true); assert.equal(ok('Q09', '8:24'), false);
  assert.equal(ok('P10', 'nw|1626'), true);
  assert.equal(ok('P11', '257'), true);
  assert.equal(ok('P12', 'wind,fire,earth,water'), true);
  assert.equal(ok('P14', '鐘在井底'), true);
  assert.equal(ok('P14', 'the bell lies in the well.', { lang: 'en' }), true);
  assert.equal(ok('P14', '鐘在井底', { lang: 'en' }), false); // 英文房間要英文答案
  assert.equal(ok('P15', '3141'), true);
  assert.equal(ok('P16', 'xxxiii'), true); assert.equal(ok('P16', '33'), true);
  assert.equal(ok('P17', '110111'), true);
  assert.equal(ok('P18', 'b,l,i,g,h,t'), true);
  assert.equal(ok('P23', '1,6,11,16,15,14,13'), true); assert.equal(ok('P23', '4,7,10,13,14,15,16'), false);
  assert.equal(ok('P24', 'well'), true);
  assert.equal(ok('P25', '5,7,3'), true);
  assert.equal(ok('P27', '12,24,18,36'), true);
  assert.equal(ok('P28', 'LSSLLSL'), true);
});

test('第二章：點名簿的紅圈（Q04）、溫室的異常（Q06）由房間決定', () => {
  const c = circledChar('seed-x', ['vaughn', 'elora']); assert.ok(['vaughn', 'elora'].includes(c));
  assert.equal(judge('Q04', SEATS[c], ctx({ seed: 'seed-x', chars: ['vaughn', 'elora'] })).solved, true);
  assert.equal(judge('Q04', '99', ctx({ seed: 'seed-x', chars: ['vaughn', 'elora'] })).solved, false);
  const sp = greenSpots('seed-x'); assert.equal(new Set(sp).size, 3);
  assert.equal(judge('Q06', [...sp].reverse(), ctx({ seed: 'seed-x' })).solved, true);
  assert.equal(judge('Q06', sp.slice(0, 2), ctx({ seed: 'seed-x' })).solved, false);
  assert.match(hint('Q06', 2, 'zh', { spot: '仙人掌' }), /仙人掌/);
});

test('沙漏：要剛好在沙漏漏完的那一刻敲第 15 分', () => {
  const right = [{ t: 0, a: 'flip', g: [7, 11] }, { t: 7, a: 'flip', g: [7] }, { t: 11, a: 'flip', g: [7] }, { t: 15, a: 'knock' }];
  assert.deepEqual(simulateHourglass([7, 11], right).events, [7, 11, 15]);
});

test('拉桿：A＋B 或 C＋D', () => {
  assert.equal(ok('P26', ['A', 'B']), true);
  assert.equal(ok('P26', ['C', 'D']), true);
  assert.equal(ok('P26', ['A']), false);
  assert.equal(ok('P26', ['A', 'B', 'C', 'D']), false);
});

test('天平：秤兩次就能找到，第三次會重新洗牌', () => {
  const st = {};
  const c = () => ctx({ state: st, house: 'ouroboros', solo: false });
  // 照提示的方法找
  let r = judge('P21', { weigh: { left: [0, 1, 2], right: [3, 4, 5] } }, c()).reply.result;
  const group = r === 'left' ? [0, 1, 2] : r === 'right' ? [3, 4, 5] : [6, 7, 8];
  r = judge('P21', { weigh: { left: [group[0]], right: [group[1]] } }, c()).reply.result;
  const heavy = r === 'left' ? group[0] : r === 'right' ? group[1] : group[2];
  assert.equal(judge('P21', { weigh: { left: [0], right: [1] } }, c()).reply.reshuffled, true); // 第三次：洗牌
  assert.equal(st.round, 1);
  // 洗牌後重新找一次，指認正確
  st.used = 0;
  r = judge('P21', { weigh: { left: [0, 1, 2], right: [3, 4, 5] } }, c()).reply.result;
  const g2 = r === 'left' ? [0, 1, 2] : r === 'right' ? [3, 4, 5] : [6, 7, 8];
  r = judge('P21', { weigh: { left: [g2[0]], right: [g2[1]] } }, c()).reply.result;
  const h2 = r === 'left' ? g2[0] : r === 'right' ? g2[1] : g2[2];
  assert.equal(judge('P21', { pick: h2 }, c()).solved, true);
  assert.ok(Number.isInteger(heavy));
});

test('異常長廊：連續答對 8 趟才過，答錯歸零', () => {
  const st = {};
  const c = () => ctx({ state: st });
  let res;
  for (let i = 0; i < 8; i++) {
    const anomaly = corridorLoop('test-seed', st.attempt ?? 0, st.n ?? 0);
    if (i === 0) assert.equal(anomaly, null); // 第一趟一定正常
    res = judge('P09', { loop: st.n ?? 0, choice: anomaly ? 'back' : 'forward' }, c());
    assert.equal(res.reply.right, true);
  }
  assert.equal(res.solved, true);
  const st2 = {};
  judge('P09', { loop: 0, choice: 'forward' }, ctx({ state: st2 }));
  const a = corridorLoop('test-seed', 0, 1);
  judge('P09', { loop: 1, choice: a ? 'forward' : 'back' }, ctx({ state: st2 })); // 故意答錯
  assert.equal(st2.streak, 0); assert.equal(st2.n, 0); assert.equal(st2.attempt, 1);
});

test('救援題、自救題：內容和答案一致', () => {
  const c3 = rescueContent('R3', 'seed-x', 'k', { house: 'belmont' }).cipher;
  const plain = ['FREE', 'LIGHT', 'AWAKE', 'BREAK'].find((w) => w.replace(/[A-Z]/g, (ch) => String.fromCharCode((ch.charCodeAt(0) - 65 + 9) % 26 + 65)) === c3);
  assert.ok(plain);
  assert.equal(judge('R3', plain, ctx({ seed: 'seed-x', key: 'k' })).solved, true);
  const roots = rescueContent('R1', 'seed-x', 'k').roots;
  const counter = { fire: 'water', wind: 'fire', earth: 'wind', water: 'earth' };
  assert.equal(judge('R1', roots.map((r) => counter[r]).join(','), ctx({ seed: 'seed-x', key: 'k' })).solved, true);
  const dirs = rescueContent('S2', 'seed-x', 'k').rounds;
  assert.equal(judge('S2', dirs.join(','), ctx({ seed: 'seed-x', key: 'k' })).solved, true);
});

test('每一題（除了不計分的）都有三張中英文提示，難度比例接近目標', () => {
  const scored = Object.entries(CHAPTER1).filter(([, d]) => d.score !== false);
  assert.equal(scored.length, 30); // P02～P32 扣掉不計分的 P22（單人限定的 P07 也算在內）
  for (const [pid, d] of scored) {
    assert.equal(d.hints?.zh?.length, 3, pid); assert.equal(d.hints?.en?.length, 3, pid);
    if (PUZZLES[pid]) assert.ok(hint(pid, 2, 'en')); // 序幕、第一幕已經換成第二章的題目
  }
  for (const [pid, d] of Object.entries(CHAPTER2)) if (d.kind !== 'event') { assert.equal(d.hints?.zh?.length, 3, pid); assert.equal(d.hints?.en?.length, 3, pid); assert.ok(hint(pid, 2, 'en'), pid); }
  const count = {}; for (const [, d] of scored) count[d.diff] = (count[d.diff] ?? 0) + 1;
  assert.deepEqual(count, { 6: 5, 7: 8, 8: 9, 9: 5, 10: 3 }); // docs/04-map-ch1.md 的難度分配＋2026-10-26 新增的 P30（7）、P31（8）、P32（7）
  assert.ok(Object.keys(PUZZLES).length >= 36);
});

test('異常長廊的第三張提示會填入要注意的地方', () => {
  assert.equal(hint('P09', 2, 'zh', { focus: corridorFocus({ id: 'lullaby' }, 'zh') }), '這一趟要特別注意：聲音');
  assert.match(hint('P09', 2, 'en', { focus: corridorFocus(null, 'en') }), /nothing may be wrong/);
});

test('P29 屋頂的符文路：一步一步踩，踩錯就碎掉', () => {
  const state = {}, step = (c, r, uid = 'a') => judge('P29', { cell: [c, r] }, ctx({ state, uid }));
  assert.deepEqual(ROOF_GAME, ROOF); // 畫面和伺服器用同一份石板
  assert.equal(step(4, 4).reply.broke.join(), '4,4'); // 第一步要在最南邊那排
  const path = [[1, 5], [1, 4], [2, 4], [2, 3], [3, 3], [3, 2], [3, 1], [4, 1], [4, 0]];
  for (const [i, [c, r]] of path.entries()) {
    const res = step(c, r);
    assert.equal(!!res.reply.broke, false, `第 ${i + 1} 步`); assert.equal(res.solved, i === path.length - 1);
  }
  // 另一個人走自己的；拼錯字（M 之後踩 L）會碎掉
  assert.equal(step(1, 5, 'b').solved, false); assert.ok(step(2, 5, 'b').reply.broke);
  assert.equal(step(0, 0, 'b').reply.broke.join(), '0,0');
});

test('S4 說謊者題：每一組都只有一個解', () => {
  const H = ['left', 'middle', 'right'];
  const ev = (s, root, tv) => s.endsWith('_lies') ? !tv[H.indexOf(s.split('_')[0])] : s.startsWith('not_') ? root !== s.slice(4) : root === s.split('_')[0];
  for (const L of LIAR_SETS) {
    const sols = [];
    for (const root of H) for (let m = 0; m < 8; m++) {
      const tv = H.map((_, i) => !!((m >> i) & 1));
      if (tv.filter(Boolean).length === 1 && L.says.every((s, i) => ev(s, root, tv) === tv[i])) sols.push(root);
    }
    assert.deepEqual(sols, [L.root], L.says.join());
  }
});

test('多人：電腦控制的學院的題目誰都可以做；那個學院的長廊異常不會出現', () => {
  const multi = (o) => ctx({ solo: false, house: 'grimoire', ...o });
  assert.equal(judge('P20', 'done', multi()).error, 'not_your_house');
  assert.equal(judge('P20', 'done', multi({ aiHouses: ['belmont'] })).solved, true);
  for (let a = 0; a < 40; a++) for (let n = 1; n < 9; n++) {
    const x = corridorLoop('seed-skip', a, n, { skip: ['eldrin', 'belmont'] });
    assert.ok(!x || !['eldrin', 'belmont'].includes(x.house));
  }
});

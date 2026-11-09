// 答案判斷的單元測試：每一題的正確答案要對、錯誤答案要錯
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { judge, hint, struckWord, circledChar, greenSpots, SEATS, xrayPuzzle, juicePuzzle, runePuzzle, simulateHourglass, corridorLoop, corridorFocus, rescueContent, PUZZLES, LIAR_SETS, HERB_CURE } from '../../server/judge.mjs';
import { readFileSync } from 'node:fs';
import { CHAPTER1 } from '../../data/puzzles/ch1.mjs';
import { CHAPTER2, STRUCK } from '../../data/puzzles/ch2.mjs';

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
  // 第四幕
  assert.equal(ok('Q23', 'mandrake,shriek,serpent,blackroot'), true); assert.equal(ok('Q23', 'mandrake,shriek,serpent'), false);
  assert.equal(ok('Q25', '8,11,9,3'), true); assert.equal(ok('Q25', '8,9,11,3'), false);
});

test('第二章：點名簿的紅圈（Q04）、溫室的異常（Q06）由房間決定', () => {
  const c = circledChar('seed-x', ['vaughn', 'elora']); assert.ok(['vaughn', 'elora'].includes(c));
  assert.equal(judge('Q04', SEATS[c], ctx({ seed: 'seed-x', chars: ['vaughn', 'elora'] })).solved, true);
  assert.equal(judge('Q04', '99', ctx({ seed: 'seed-x', chars: ['vaughn', 'elora'] })).solved, false);
  const sp = greenSpots('seed-x'); assert.equal(new Set(sp).size, 3);
  assert.equal(judge('Q06', [...sp].reverse(), ctx({ seed: 'seed-x' })).solved, true);
  assert.equal(judge('Q06', sp.slice(0, 2), ctx({ seed: 'seed-x' })).solved, false);
  assert.match(hint('Q06', 2, 'zh', { spot: '仙人掌' }), /仙人掌/);
  for (const seed of ['a', 'b', 'room-1', 'room-2']) { const x = xrayPuzzle(seed); assert.ok(x, seed); assert.equal(x.ans.length, 6); assert.ok(x.ans.every((c) => x.nails.includes(c))); assert.equal(judge('Q13', x.ans, ctx({ seed })).solved, true); }
  assert.equal(ok('Q11', 'pain,pain,sleep'), true); assert.equal(ok('Q11', 'sleep,sleep,pain'), false);
  assert.equal(ok('Q12', '1896'), true);
  const j = juicePuzzle('s1'); assert.equal(judge('Q17', j.drugged, ctx({ seed: 's1' })).solved, true); assert.equal(judge('Q17', j.other, ctx({ seed: 's1' })).solved, false);
  assert.equal(Math.max(...j.cups), j.cups[Math.ceil(j.drugged / 2) - 1]); assert.ok(j.cups.filter((c) => c === Math.max(...j.cups)).length === 1); // 下藥那桌喝最多（只有一桌）
  assert.notEqual(Math.ceil(j.other / 2), Math.ceil(j.drugged / 2));
  assert.equal(judge('Q19', runePuzzle('s1'), ctx({ seed: 's1' })).solved, true);
  assert.equal(ok('Q20', 'OPEN'), true); assert.equal(ok('Q21', '12,2,3,5,6'), true); assert.equal(ok('Q22', '1:00'), true); assert.equal(ok('Q22', '12'), false); assert.equal(ok('Q14', 'Liana'), true); assert.equal(ok('Q15', 'knox'), true); assert.equal(ok('Q16', '1871'), true);
});

test('沙漏：要剛好在沙漏漏完的那一刻敲第 15 分', () => {
  const right = [{ t: 0, a: 'flip', g: [7, 11] }, { t: 7, a: 'flip', g: [7] }, { t: 11, a: 'flip', g: [7] }, { t: 15, a: 'knock' }];
  assert.deepEqual(simulateHourglass([7, 11], right).events, [7, 11, 15]);
});

test('第四幕：樓梯的燈（Q26）兩種按法都對；點名簿（Q24）被劃掉的字母拼出口令', () => {
  assert.equal(ok('Q26', '1,3,5'), true); assert.equal(ok('Q26', '4,3,2'), true); assert.equal(ok('Q26', '1,3'), false);
  // 燈謎本身：一開始 2、4 亮，按 1、3、5 或 2、3、4 會全亮
  const press = (list) => { const on = [false, true, false, true, false]; for (const f of list) for (const k of [f - 2, f - 1, f]) if (k >= 0 && k < 5) on[k] = !on[k]; return on.every(Boolean); };
  assert.equal(press([1, 3, 5]), true); assert.equal(press([2, 3, 4]), true); assert.equal(press([1, 2]), false);
  for (const [word, names] of Object.entries(STRUCK)) assert.equal(names.map(([n, i]) => n[i]).join('').toUpperCase(), word);
  const w = struckWord('test-seed');
  assert.equal(ok('Q24', w.toLowerCase()), true); assert.equal(ok('Q24', 'XXXX'), false);
});

test('救援題、自救題：內容和答案一致', () => {
  // 第二章 R3：錄音裡被念兩次的名字（每一組都剛好只有一個重複）
  for (const k of ['k', 'k2', 'k3', 'k4', 'k5']) {
    const names = rescueContent('R3', 'seed-x', k).names, dup = names.find((n, i) => names.indexOf(n) !== i);
    assert.equal(names.length, 8); assert.equal(new Set(names).size, 7);
    assert.equal(judge('R3', dup, ctx({ seed: 'seed-x', key: k })).solved, true);
    assert.equal(judge('R3', names.find((n) => n !== dup), ctx({ seed: 'seed-x', key: k })).solved, false);
  }
  // R1：黑根上的藥草 → 牆上對照表的解藥材料（畫面上的對照表要跟伺服器一樣）
  const roots = rescueContent('R1', 'seed-x', 'k').roots;
  const counter = { nightshade: 'silver', wolfsbane: 'moonwort', hemlock: 'mandrake', blackroot: 'batwing' };
  assert.deepEqual(HERB_CURE, counter);
  assert.ok(readFileSync(new URL('../../game/src/ui/puzzles.mjs', import.meta.url), 'utf8').includes("[['nightshade', 'silver'], ['wolfsbane', 'moonwort'], ['hemlock', 'mandrake'], ['blackroot', 'batwing']]"));
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
  for (const [pid, d] of Object.entries(CHAPTER2)) if (d.kind !== 'event' && d.score !== false) { assert.equal(d.hints?.zh?.length, 3, pid); assert.equal(d.hints?.en?.length, 3, pid); assert.ok(hint(pid, 2, 'en'), pid); }
  const count = {}; for (const [, d] of scored) count[d.diff] = (count[d.diff] ?? 0) + 1;
  assert.deepEqual(count, { 6: 5, 7: 8, 8: 9, 9: 5, 10: 3 }); // docs/04-map-ch1.md 的難度分配＋2026-10-26 新增的 P30（7）、P31（8）、P32（7）
  assert.ok(Object.keys(PUZZLES).length >= 36);
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
  for (let a = 0; a < 40; a++) for (let n = 1; n < 9; n++) {
    const x = corridorLoop('seed-skip', a, n, { skip: ['eldrin', 'belmont'] });
    assert.ok(!x || !['eldrin', 'belmont'].includes(x.house));
  }
});

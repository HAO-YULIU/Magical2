// 房間的整合測試：在本機啟動真正的 Worker＋Durable Object（wrangler），用 WebSocket 模擬玩家。
// 登入用 DEV_AUTH 的假帳號（dev-名字）。
import { runePuzzle } from '../../server/judge.mjs';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { unstable_dev } from 'wrangler';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
let worker, base;

before(async () => {
  if (!existsSync(join(ROOT, 'dist/index.html'))) { mkdirSync(join(ROOT, 'dist'), { recursive: true }); writeFileSync(join(ROOT, 'dist/index.html'), 'dev'); }
  // 測試用的設定：跟 wrangler.jsonc 一樣，但不跑 build（避免測試途中重裝套件）
  const cfg = JSON.parse(readFileSync(join(ROOT, 'wrangler.jsonc'), 'utf8').replace(/^\s*\/\/.*$/gm, ''));
  delete cfg.build; cfg.main = join(ROOT, 'server/worker.mjs'); cfg.assets.directory = join(ROOT, 'dist');
  mkdirSync(join(ROOT, '.wrangler'), { recursive: true });
  const cfgPath = join(ROOT, '.wrangler/test.wrangler.json'); writeFileSync(cfgPath, JSON.stringify(cfg));
  worker = await unstable_dev(join(ROOT, 'server/worker.mjs'), {
    config: cfgPath, vars: { DEV_AUTH: '1', TEST_PASS: 'moon.light' }, experimental: { disableExperimentalWarning: true },
    logLevel: 'warn', persist: false, ip: '127.0.0.1',
  });
  base = `http://${worker.address}:${worker.port}`;
  // wrangler 會把全域的連線設定改成「全部走 HTTPS_PROXY」，連本機也一樣；改回會遵守 NO_PROXY 的版本
  const { EnvHttpProxyAgent, setGlobalDispatcher } = await import('undici');
  setGlobalDispatcher(new EnvHttpProxyAgent());
});
after(async () => { await worker?.stop(); });

const create = async (name, mode = 'multi', lang = 'zh') => {
  const r = await fetch(`${base}/api/rooms`, { method: 'POST', headers: { authorization: `Bearer dev-${encodeURIComponent(name)}`, 'content-type': 'application/json' }, body: JSON.stringify({ mode, lang }) });
  return (await r.json()).code;
};

// 一個模擬玩家：收到的訊息排隊，可以等某一種訊息
function player(code, name) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${base.replace('http', 'ws')}/api/rooms/${code}/ws?lang=zh`, ['milner', `dev-${encodeURIComponent(name)}`]);
    const inbox = []; const waiters = []; let id = 1;
    const p = {
      ws, inbox, uid: `dev-${encodeURIComponent(name)}`,
      send: (m) => ws.send(JSON.stringify(m)),
      raw: (m) => { const mid = id++; ws.send(JSON.stringify({ ...m, id: mid })); return p.wait((x) => x.id === mid); },
      async request(m) { // 選角色前要先分學院：測試裡自動補上
        if (m.t === 'char' && m.char && !p.sorted) { p.sorted = true; await p.raw({ t: 'house', house: 'eldrin' }); }
        return p.raw(m);
      },
      wait(pred, ms = 3000) {
        const i = inbox.findIndex(pred); if (i >= 0) return Promise.resolve(inbox.splice(i, 1)[0]);
        return new Promise((res, rej) => { const w = { pred, res }; waiters.push(w); setTimeout(() => rej(new Error('timeout waiting')), ms); });
      },
      count: (pred) => inbox.filter(pred).length,
      close: () => ws.close(),
    };
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      const w = waiters.findIndex((x) => x.pred(m));
      if (w >= 0) waiters.splice(w, 1)[0].res(m); else inbox.push(m);
    };
    ws.onopen = () => resolve(p); ws.onerror = () => reject(new Error('ws error'));
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test('沒登入不能建房；房號不存在會回 404', async () => {
  const r = await fetch(`${base}/api/rooms`, { method: 'POST', body: '{}' });
  assert.equal(r.status, 401);
  const i = await fetch(`${base}/api/rooms/ZZZZ`);
  assert.equal(i.status, 404);
});

test('多人：加入、選角色、準備、開始、同步、聊天、作答', async () => {
  const code = await create('阿明');
  const a = await player(code, '阿明');
  const b = await player(code, '小華');
  let s = await b.wait((m) => m.t === 'state' && m.members.length === 2);
  assert.equal(s.host, a.uid);

  // 還沒分學院不能選角色
  assert.equal((await a.raw({ t: 'char', char: 'vaughn' })).error, 'need_sorting');
  // 同一個角色不能兩個人選
  assert.equal((await a.request({ t: 'char', char: 'vaughn' })).t, 'ok');
  assert.equal((await b.request({ t: 'char', char: 'vaughn' })).error, 'character_taken');
  await b.request({ t: 'char', char: 'elora' });
  assert.equal((await a.request({ t: 'start' })).error, 'not_ready');
  await a.request({ t: 'ready', ready: true });
  await b.request({ t: 'ready', ready: true });
  assert.equal((await b.request({ t: 'start' })).error, 'not_host');
  assert.equal((await a.request({ t: 'start' })).t, 'ok');
  s = await b.wait((m) => m.t === 'state' && m.phase === 'playing');

  // 遊戲開始後，第三個人不能加入
  const info = await (await fetch(`${base}/api/rooms/${code}`)).json();
  assert.equal(info.phase, 'playing');

  // 區域：同一區才收到詳細位置（B）
  a.send({ t: 'pos', z: 'hall', p: [1, 2], v: [0, 1], y: 0, s: 1 });
  b.send({ t: 'pos', z: 'hall', p: [3, 4], v: [0, 0], y: 0, s: 0 });
  await a.wait((m) => m.t === 'pos' && m.uid === b.uid);
  a.send({ t: 'pos', z: 'hall', p: [1, 3], v: [0, 1], y: 0, s: 1 });
  const got = await b.wait((m) => m.t === 'pos' && m.uid === a.uid && m.p[1] === 3);
  assert.deepEqual(got.p, [1, 3]);
  a.send({ t: 'pos', z: 'library', p: [9, 9], v: [0, 0], y: 0, s: 0 });
  const zone = await b.wait((m) => m.t === 'zone' && m.uid === a.uid && m.z === 'library');
  assert.equal(zone.z, 'library');
  a.send({ t: 'pos', z: 'library', p: [9, 8], v: [0, 1], y: 0, s: 1 });
  await sleep(300);
  assert.equal(b.count((m) => m.t === 'pos' && m.uid === a.uid && m.p[0] === 9), 0, '不同區的人不該收到詳細位置');

  // 聊天、標記
  await a.request({ t: 'chat', text: '這裡有一扇門' });
  const chat = await b.wait((m) => m.t === 'chat');
  assert.equal(chat.text, '這裡有一扇門'); assert.equal(chat.name, '阿明');
  a.send({ t: 'mark', kind: 'danger', z: 'library', p: [1, 1] });
  assert.equal((await b.wait((m) => m.t === 'mark')).kind, 'danger');

  // 段落（第二章）：序幕還不能答第一幕的題目；解開 Q01、Q02 進入第一幕
  assert.equal((await a.request({ t: 'answer', pid: 'Q05', value: 'moonwort,batwing,silver' })).error, 'not_yet');
  assert.equal((await a.request({ t: 'answer', pid: 'Q01', value: '3104' })).solved, true);
  assert.equal((await a.request({ t: 'answer', pid: 'Q02', value: 'tri,stitch' })).solved, true);
  s = await b.wait((m) => m.t === 'state' && m.segment === 'act1');
  assert.deepEqual(s.ai.sort(), ['grimoire', 'ouroboros']); // 沒人選的月晞、西里爾由電腦控制

  // 作答：答錯冷卻、答對全隊都知道
  assert.equal((await b.request({ t: 'answer', pid: 'Q03', value: 'serpent,shriek,mandrake' })).solved, false);
  assert.equal((await b.request({ t: 'answer', pid: 'Q03', value: 'mandrake,shriek,serpent' })).error, 'cooldown');
  const right = await a.request({ t: 'answer', pid: 'Q05', value: 'moonwort,batwing,silver' });
  assert.equal(right.solved, true);
  assert.equal((await b.wait((m) => m.t === 'solved' && m.pid === 'Q05')).by, a.uid);

  // Q04：空白紅圈是房間裡某個玩家角色的學院（沃恩＝貝爾蒙特、艾洛拉＝艾爾德林）；答案是他的座號
  const pk4 = await b.request({ t: 'peek', pid: 'Q04' });
  assert.ok(['belmont', 'eldrin'].includes(pk4.content.house));
  assert.equal((await a.request({ t: 'answer', pid: 'Q04', value: pk4.content.house === 'belmont' ? '03' : '07' })).solved, true);
  // Q06：溫室裡三個不對勁的地方
  const pk6 = await a.request({ t: 'peek', pid: 'Q06' });
  assert.equal(pk6.content.spots.length, 3);
  assert.equal((await a.request({ t: 'answer', pid: 'Q06', value: pk6.content.spots })).solved, true);
  await sleep(3100);
  for (const [pid, v] of [['Q03', 'mandrake,shriek,serpent'], ['Q07', 'done'], ['Q08', 'blackroot,thirteen,hername'], ['Q09', '836']]) assert.equal((await b.request({ t: 'answer', pid, value: v })).solved, true, pid);
  assert.equal((await b.wait((m) => m.t === 'state' && m.segment === 'act2')).segment, 'act2');

  // 第二幕（第二章）：醫務室與舊檔案室；Q13 雙人對照（伺服器出題，peek 不含答案）；C2 沒人扮演西里爾時誰都可以替他決定
  for (const [pid, v] of [['Q10', '13'], ['Q11', 'pain,sleep,pain'], ['Q12', '1896'], ['Q14', 'liana'], ['Q15', 'knox']]) assert.equal((await a.request({ t: 'answer', pid, value: v })).solved, true, pid);
  const pk13 = await b.request({ t: 'peek', pid: 'Q13' });
  assert.equal(pk13.content.nails.length, 10); assert.equal(pk13.content.ans, undefined);
  assert.equal(pk13.content.row.reduce((x, y) => x + y, 0), 6);
  const combos = (arr, k) => (k === 0 ? [[]] : arr.flatMap((x, i) => combos(arr.slice(i + 1), k - 1).map((c) => [x, ...c])));
  const fit = combos(pk13.content.nails, 6).filter((c) => [0, 1, 2, 3].every((r) => c.filter((x) => x >> 2 === r).length === pk13.content.row[r]) && [0, 1, 2, 3].every((k) => c.filter((x) => (x & 3) === k).length === pk13.content.col[k]));
  assert.equal(fit.length, 1); // 只有一組解
  assert.equal((await b.request({ t: 'answer', pid: 'Q13', value: fit[0] })).solved, true);
  assert.equal((await b.request({ t: 'answer', pid: 'C2', value: 'tear' })).solved, true); // 房間裡沒人扮演西里爾
  assert.equal((await b.request({ t: 'answer', pid: 'Q16', value: '1871' })).solved, true);
  assert.equal((await b.wait((m) => m.t === 'state' && m.segment === 'act3a')).segment, 'act3a');
  assert.equal((await b.request({ t: 'answer', pid: 'Q05', value: 'moonwort,batwing,silver' })).error, 'already_solved');

  // 第三幕 A（第二章）：晚宴。喝南瓜汁（艾洛拉不喝）、Q17 指出被下藥的壺 → 遇襲、15 分鐘倒數；Q18、Q19 之後救低年級生
  assert.equal((await b.request({ t: 'drink', drink: true })).error, 'not_yours'); // b 是艾洛拉
  assert.equal((await a.request({ t: 'drink', drink: true })).t, 'ok');
  assert.equal((await a.request({ t: 'answer', pid: 'Q18', value: 'done' })).error, 'not_yet'); // 還沒遇襲
  const pk17 = await a.request({ t: 'peek', pid: 'Q17' }); assert.equal(pk17.content.knox.length, 2);
  const big = pk17.content.cups.indexOf(Math.max(...pk17.content.cups)) + 1, jug = pk17.content.knox.find((k) => Math.ceil(k / 2) === big);
  assert.equal((await a.request({ t: 'answer', pid: 'Q17', value: jug })).solved, true);
  s = await b.wait((m) => m.t === 'state' && m.feast?.attack);
  assert.ok(s.feast.deadline - s.feast.attack >= 14 * 60 * 1000); assert.deepEqual(s.feast.lost, []); assert.equal(s.juice[a.uid], true);
  assert.ok((await a.request({ t: 'answer', pid: 'Q17', value: jug })).error); // 已經解開／來不及了
  assert.equal((await b.request({ t: 'firstyear', kid: 0 })).error, 'door_locked');
  // 提示：全隊都看得到，最多三張；第三張會填入答案的一部分
  await a.request({ t: 'hint', pid: 'Q19' }); assert.equal((await b.wait((m) => m.t === 'hint')).pid, 'Q19');
  await a.request({ t: 'hint', pid: 'Q19' }); assert.match((await a.request({ t: 'hint', pid: 'Q19' })).text, /[ᚠ-ᛪ]/);
  assert.equal((await a.request({ t: 'hint', pid: 'Q19' })).error, 'no_more_hints');
  assert.equal((await a.request({ t: 'answer', pid: 'Q18', value: 'done' })).solved, true);
  const desc = (await b.request({ t: 'peek', pid: 'Q19' })).content.desc; assert.equal(desc.length, 4);
  const RD = { 像一把倒過來的叉子: 'algiz', 像兩座山: 'mannaz', 像一道閃電: 'sowilo', 像沒有門的門框: 'uruz', '像一個打勾，躺下來': 'kenaz', 像一個菱形: 'ingwaz', 像一支往上指的箭: 'tiwaz', 像一個大叉叉: 'gebo' };
  assert.equal((await b.request({ t: 'answer', pid: 'Q19', value: desc.map((d) => RD[d]).join(',') })).solved, true);
  for (let i = 0; i < 8; i++) await (i % 2 ? a : b).request({ t: 'firstyear', kid: i });
  s = await b.wait((m) => m.t === 'state' && m.segment === 'act3b');
  assert.equal(s.feast.rescued.length, 8); assert.equal(s.feast.timeout, false);
  // 第三幕 B：校長倒下之後 → 第四幕
  for (const [pid, v] of [['Q20', 'open'], ['Q21', '12,2,3,5,6'], ['Q22', '1']]) assert.equal((await a.request({ t: 'answer', pid, value: v })).solved, true, pid);
  assert.equal((await b.wait((m) => m.t === 'state' && m.segment === 'act4')).segment, 'act4');

  // 房主斷線：負責計算守夜人的人換手
  a.close();
  s = await b.wait((m) => m.t === 'state' && m.sim === b.uid);
  assert.equal(s.members.find((m) => m.uid === a.uid).online, false);
  b.close();
});

test('單人：只能一個人，英文謎題', async () => {
  const code = await create('Solo', 'solo', 'en');
  const p = await player(code, 'Solo');
  await p.request({ t: 'char', char: 'yuexi' });
  await p.request({ t: 'ready', ready: true });
  assert.equal((await p.request({ t: 'start' })).t, 'ok');
  await p.request({ t: 'dev', segment: 'act3a' }); // 本機測試可以跳段
  const info = await (await fetch(`${base}/api/rooms/${code}`)).json();
  assert.equal(info.max, 1);
  // 英文房間：Q19 的描述是英文；Q17 指錯 → 兩個低年級生救不回來
  const pk = await p.request({ t: 'peek', pid: 'Q17' }); const wrongJug = [1, 2, 3, 4, 5, 6].find((k) => !pk.content.knox.includes(k));
  assert.equal((await p.request({ t: 'answer', pid: 'Q17', value: wrongJug })).solved, false);
  assert.deepEqual((await p.wait((m) => m.t === 'feast')).lost, [6, 7]);
  assert.match((await p.request({ t: 'peek', pid: 'Q19' })).content.desc[0], /^like /);
  // 重新連線（舊連線會被關掉）會回到同一段
  const again = await player(code, 'Solo');
  assert.equal((await again.wait((m) => m.t === 'state')).segment, 'act3a');
  again.close();
});

test('等待室裡離開的人會被移出，房主換人', async () => {
  const code = await create('房主');
  const a = await player(code, '房主');
  const b = await player(code, '客人');
  await a.wait((m) => m.t === 'state' && m.members.length === 2);
  a.close();
  const s = await b.wait((m) => m.t === 'state' && m.members.length === 1);
  assert.equal(s.host, b.uid);
  b.close();
});

test('製作人的測試登入：密碼對才能用，可以跳段', async () => {
  const enc = (x) => encodeURIComponent(x).replace(/\./g, '%2E');
  const post = (token) => fetch(`${base}/api/rooms`, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: '{"mode":"solo"}' });
  assert.equal((await post(`test.${enc('wrong')}.${enc('製作人')}`)).status, 401);
  const r = await post(`test.${enc('moon.light')}.${enc('製作人')}`);
  assert.equal(r.status, 200);
  const { code } = await r.json();
  const ws = await new Promise((res, rej) => { const w = new WebSocket(`${base.replace('http', 'ws')}/api/rooms/${code}/ws`, ['milner', `test.${enc('moon.light')}.${enc('製作人')}`]); w.onopen = () => res(w); w.onerror = rej; });
  const got = []; ws.onmessage = (e) => got.push(JSON.parse(e.data));
  const ask = async (m) => { ws.send(JSON.stringify({ ...m, id: m.t })); for (let i = 0; i < 50; i++) { const x = got.find((g) => g.id === m.t); if (x) return x; await sleep(40); } };
  await ask({ t: 'house', house: 'ouroboros' }); await ask({ t: 'char', char: 'cyril' }); await ask({ t: 'ready', ready: true }); await ask({ t: 'start' });
  assert.equal((await ask({ t: 'dev', segment: 'act1' })).t, 'ok');
  assert.equal(got.find((g) => g.t === 'hello').you, 'test-製作人');
  ws.close();
});

test('第四幕單人：倒數、齒輪多 90 秒、被抓到復活 3 次、用完判定輸、重來', async () => {
  const code = await create('守夜人', 'solo');
  const p = await player(code, '守夜人');
  await p.request({ t: 'char', char: 'vaughn' }); await p.request({ t: 'ready', ready: true }); await p.request({ t: 'start' });
  await p.request({ t: 'dev', segment: 'act4' });
  let s = await p.wait((m) => m.t === 'state' && m.segment === 'act4');
  const left = s.act4.deadline - s.now;
  assert.ok(left > 34.9 * 60000 && left <= 35 * 60000, `剩 ${left}`);
  assert.equal(s.revives, 3);
  const ans = (pid, value) => p.request({ t: 'answer', pid, value });
  assert.equal((await ans('P26', ['A'])).solved, false);
  await sleep(3100); // 答錯要等 3 秒
  assert.equal((await ans('P26', ['C', 'D'])).solved, true);
  assert.equal((await ans('P27', '12,24,18,36')).solved, true);
  s = await p.wait((m) => m.t === 'state' && m.act4?.bonus);
  assert.ok(s.act4.deadline - s.now > 36 * 60000); // 多了 90 秒
  assert.equal((await ans('P32', '4162')).solved, true); // 稻草人的工具箱：再多 60 秒
  s = await p.wait((m) => m.t === 'state' && m.act4 && m.act4.deadline - m.now > 37 * 60000);
  // 貝爾蒙特擊退守夜人：冷卻 60 秒
  assert.equal((await p.request({ t: 'repel' })).t, 'ok');
  assert.equal((await p.request({ t: 'repel' })).error, 'cooldown');
  // 被抓到：掙脫成功不算；沒掙脫用掉一次復活
  assert.equal((await p.request({ t: 'catch', uid: p.uid })).t, 'ok');
  let g = await p.wait((m) => m.t === 'grab'); assert.equal(g.free, 2);
  assert.equal((await p.request({ t: 'escape' })).escaped, true);
  await sleep(10); await p.request({ t: 'catch', uid: p.uid });
  assert.equal((await p.request({ t: 'escape' })).escaped, true); // 第二次掙脫
  // 掙脫兩次之後：再被抓就掙脫不了（2026-10-31 製作人）
  await sleep(10); await p.request({ t: 'catch', uid: p.uid });
  assert.equal((await p.request({ t: 'escape' })).escaped, false);
  assert.equal((await p.wait((m) => m.t === 'revived')).left, 2);
  for (const n of [1, 0]) {
    await sleep(10);
    await p.request({ t: 'catch', uid: p.uid });
    assert.equal((await p.request({ t: 'caught' })).escaped, false);
    assert.equal((await p.wait((m) => m.t === 'revived')).left, n);
  }
  await p.request({ t: 'catch', uid: p.uid }); await p.request({ t: 'caught' });
  assert.equal((await p.wait((m) => m.t === 'lost')).reason, 'revives');
  assert.equal((await ans('P28', 'LSSLLSL')).error, 'lost');
  assert.equal((await p.request({ t: 'retry' })).t, 'ok');
  s = await p.wait((m) => m.t === 'state' && m.act4 && !m.act4.lost && !m.solved.includes('P26')); // 第四幕的進度清掉
  assert.equal(s.revives, 3);
  // 時間到：判定輸
  await p.request({ t: 'dev', deadline: 300 });
  assert.equal((await p.wait((m) => m.t === 'lost', 5000)).reason, 'time');
  await p.request({ t: 'retry' });
  // 走完第四幕：P26、P28、屋頂 → 尾聲
  assert.equal((await ans('P26', ['A', 'B'])).solved, true);
  assert.equal((await ans('P28', 'LSSLLSL')).solved, true);
  assert.ok((await ans('P29', { cell: [3, 3] })).reply.broke); // 第一步不能從中間開始
  for (const cell of [[1, 5], [1, 4], [2, 4], [2, 3], [3, 3], [3, 2], [3, 1], [4, 1]]) assert.equal((await ans('P29', { cell })).reply.step > 0, true);
  assert.equal((await ans('P29', { cell: [4, 0] })).solved, true);
  assert.equal((await p.wait((m) => m.t === 'state' && m.segment === 'epilogue')).segment, 'epilogue');
  p.close();
});

test('第四幕多人：被拖進蝕巢、同伴救援、自救、全員被抓判定輸', async () => {
  const { rescueAnswer } = await import('../../server/judge.mjs');
  const code = await create('救援甲');
  const a = await player(code, '救援甲'), b = await player(code, '救援乙');
  await a.request({ t: 'char', char: 'elora' }); await b.request({ t: 'char', char: 'vaughn' });
  await a.request({ t: 'ready', ready: true }); await b.request({ t: 'ready', ready: true }); await a.request({ t: 'start' });
  await a.request({ t: 'dev', segment: 'act4' });
  await b.wait((m) => m.t === 'state' && m.segment === 'act4');
  // 只有負責算守夜人的人（房主）能說「抓到了」
  assert.equal((await b.request({ t: 'catch', uid: a.uid })).error, 'bad_args');
  assert.equal((await a.request({ t: 'catch', uid: b.uid })).t, 'ok');
  assert.equal((await b.wait((m) => m.t === 'grab')).uid, b.uid);
  await b.request({ t: 'caught' });
  let s = await a.wait((m) => m.t === 'state' && m.nest?.[b.uid]);
  const q = s.nest[b.uid];
  assert.ok(['R1', 'R2', 'R3', 'R4'].includes(q.r) && ['S1', 'S2', 'S3', 'S4'].includes(q.s));
  assert.equal((await b.request({ t: 'answer', pid: 'P26', value: ['A', 'B'] })).error, 'captured'); // 被綁著不能解題
  const peek = await a.request({ t: 'peek', pid: 'R', target: b.uid });
  assert.equal(peek.pid, q.r);
  assert.equal((await b.request({ t: 'peek', pid: 'S' })).pid, q.s);
  // 同伴救援：答錯不會放人；答對放人（本機測試才拿得到房間的亂數種子）
  const { seed } = await a.request({ t: 'dev', seed: true });
  const right = (pid, key) => rescueAnswer(pid, seed, key) ?? 'done'; // 畫面判斷的題目（R2、R4、S3）送出就算
  assert.equal((await b.request({ t: 'rescue', target: b.uid, value: 'x' })).error, 'bad_args'); // 不能自己救自己
  if (!['R2', 'R4'].includes(q.r)) assert.equal((await a.request({ t: 'rescue', target: b.uid, value: 'NOPE' })).solved, false);
  await sleep(3100); // 答錯要等 3 秒
  assert.equal((await a.request({ t: 'rescue', target: b.uid, value: right(q.r, `${b.uid}:0:R`) })).solved, true);
  assert.equal((await a.wait((m) => m.t === 'freed')).uid, b.uid);
  // 再被抓一次，這次自己解（自救題）
  await sleep(3100);
  await a.request({ t: 'catch', uid: b.uid }); await b.request({ t: 'caught' });
  const sp = (await b.request({ t: 'peek', pid: 'S' })).pid; // 這次抽到的自救題
  assert.equal((await b.request({ t: 'selfrescue', value: right(sp, `${b.uid}:1:S0`) })).solved, true);
  // 兩個人都被抓：判定輸
  await sleep(3100);
  await a.request({ t: 'catch', uid: b.uid }); await b.request({ t: 'caught' });
  await a.request({ t: 'catch', uid: a.uid }); await a.request({ t: 'caught' });
  assert.equal((await a.wait((m) => m.t === 'lost')).reason, 'captured');
  a.close(); b.close();
});

test('整章：單人從序幕玩到尾聲，存檔記下結果，可以回來繼續', async () => {
  const name = `整章${Date.now() % 100000}`; // 每次用新的玩家（存檔在測試之間會留著）
  const auth = { authorization: `Bearer dev-${encodeURIComponent(name)}` };
  const code = await create(name, 'solo');
  const p = await player(code, name);
  await p.request({ t: 'char', char: 'yuexi' }); await p.request({ t: 'ready', ready: true }); await p.request({ t: 'start' });
  const ans = async (pid, value) => { const r = await p.request({ t: 'answer', pid, value }); assert.equal(r.solved, true, `${pid} ${JSON.stringify(r)}`); return r; };
  const seg = (s) => p.wait((m) => m.t === 'state' && m.segment === s, 5000).catch((e) => { throw new Error(`沒進到 ${s}`); });
  // 序幕、第一幕
  await ans('Q01', '3104'); await ans('Q02', 'tri,stitch'); await seg('act1');
  await sleep(200);
  const me = await (await fetch(`${base}/api/me`, { headers: auth })).json();
  assert.equal(me.last.code, code, JSON.stringify(me)); assert.equal(me.last.segment, 'act1'); // 中途離開可以從這裡繼續
  assert.equal((await (await fetch(`${base}/api/rooms/${code}`, { headers: auth })).json()).member, true);
  assert.equal((await (await fetch(`${base}/api/rooms/${code}`)).json()).member, false);
  for (const [pid, v] of [['Q03', 'mandrake,shriek,serpent'], ['Q05', 'moonwort,batwing,silver'], ['Q07', 'done'], ['Q08', 'blackroot,thirteen,hername'], ['Q09', '836']]) await ans(pid, v);
  await ans('Q04', (await p.request({ t: 'peek', pid: 'Q04' })).content.house === 'grimoire' ? '12' : 'x');
  await ans('Q06', (await p.request({ t: 'peek', pid: 'Q06' })).content.spots); await seg('act2');
  // 第二幕（第二章）：醫務室與舊檔案室
  for (const [pid, v] of [['Q10', '13'], ['Q11', 'sleep,pain,pain'], ['Q12', '1896'], ['Q14', 'liana'], ['Q15', 'KNOX']]) await ans(pid, v);
  { const c = (await p.request({ t: 'peek', pid: 'Q13' })).content; const combos = (arr, k) => (k === 0 ? [[]] : arr.flatMap((x, i) => combos(arr.slice(i + 1), k - 1).map((y) => [x, ...y])));
    await ans('Q13', combos(c.nails, 6).find((cc) => [0, 1, 2, 3].every((r) => cc.filter((x) => x >> 2 === r).length === c.row[r]) && [0, 1, 2, 3].every((k) => cc.filter((x) => (x & 3) === k).length === c.col[k]))); }
  await ans('Q16', '1871'); await seg('act3a');
  // 第三幕
  // 第三幕（第二章）：晚宴 → 遇襲 → 救低年級生 → 校長倒下之後
  { const pk = (await p.request({ t: 'peek', pid: 'Q17' })).content; const big = pk.cups.indexOf(Math.max(...pk.cups)) + 1; await ans('Q17', pk.knox.find((k) => Math.ceil(k / 2) === big)); }
  await ans('Q18', 'done'); await ans('Q19', runePuzzle(await (async () => { const st = await p.request({ t: 'dev', seed: true }); return st.seed; })()));
  for (let i = 0; i < 8; i++) { const fr = await p.request({ t: 'firstyear', kid: i }); if (fr.t !== 'ok') console.log('firstyear', i, JSON.stringify(fr)); }
  await seg('act3b');
  for (const [pid, v] of [['Q20', 'open'], ['Q21', '12,2,3,5,6'], ['Q22', '1']]) await ans(pid, v);
  await seg('act4');
  // 第四幕：被抓一次（復活），然後逃出去
  await p.request({ t: 'catch', uid: p.uid }); await p.request({ t: 'caught' });
  await ans('P26', ['A', 'B']); await ans('P28', 'LSSLLSL');
  for (const cell of [[1, 5], [1, 4], [2, 4], [2, 3], [3, 3], [3, 2], [3, 1], [4, 1], [4, 0]]) await p.request({ t: 'answer', pid: 'P29', value: { cell } });
  const end = await seg('epilogue');
  assert.equal(end.result.notes, 2); assert.equal(end.result.cyril, 'tear'); assert.equal(end.result.rescued, 8); assert.equal(end.result.caught, 1); assert.ok(end.result.time > 0);
  await sleep(200);
  const save = await (await fetch(`${base}/api/me`, { headers: auth })).json();
  assert.deepEqual(save.cleared, [1]); assert.equal(save.ch1.notes, 2); assert.equal(save.ch1.char, 'yuexi'); assert.equal(save.ch1First.code, code);
  assert.equal(save.last, undefined); // 通關了，選單不再顯示「繼續」
  assert.equal((await fetch(`${base}/api/me`)).status, 401);
  p.close();
});


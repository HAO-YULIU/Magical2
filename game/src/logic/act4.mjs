// 第四幕的玩法（第二章：諾克斯點名）：倒數（結界關上前）、諾克斯（追逐、點名、躲藏、擊退）、被抓（掙脫、單人復活、多人拖進蝕巢＋救援／自救）、
// 大門的四學院徽記台（Q27）、判定輸與重來、高潮與尾聲。謎題畫面在 ui/puzzles-ch2.mjs。
import { createWarden } from '../world/warden.mjs';
import { createAct4Scene } from '../world/act4scene.mjs';
import { createWardenAI } from './warden-ai.mjs';
import { A4_SPAWN, CHECKPOINTS, NEST_SPOT, NEST_EXIT, WARDEN, WARDEN_POINTS, WARDEN_START } from '../data/act4-ch1.mjs';
import { ROOMS, DOORS, SPAWNS } from '../data/world-ch1.mjs';
import { SCRIPT } from '../data/story-ch1.mjs';
import { playFile, scream, chime } from '../world/sound.mjs';
import { sfx, setMusic, setTension, hasSound, setLoop } from '../art/sfx.mjs';
import { openPanel, closePanel, panelOpen, el, L } from '../ui/overlay.mjs';
import { openRescue } from '../ui/puzzles.mjs';
import { t } from './i18n.mjs';
import { caption } from '../ui/captions.mjs';
import { CHARS } from './chars.mjs';

const $ = (id) => document.getElementById(id);
const fmt = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

// 通關結算：用時、莉安娜的筆記、西里爾的抉擇、被抓幾次、提示、重來幾次
function summary(r) {
  if (!r) return [];
  const min = Math.round(r.time / 60000), time = min >= 60 ? t('time_hm', { h: Math.floor(min / 60), m: min % 60 }) : t('time_m', { m: min });
  const rows = [[t('res_time'), time], [t('res_notes'), `${r.notes} / 2`], [t('res_cyril'), t(r.cyril === 'tell' ? 'res_cyril_show' : 'res_cyril_hide')], [t('res_rescued'), `${r.rescued ?? 0} / 8`],
    [t('res_caught'), String(r.caught)], [t('res_hints'), String(r.hints)], [t('res_retries'), String(r.retries)]];
  return [el('table', { class: 'result' }, ...rows.map(([k, v]) => el('tr', {}, el('th', { text: k }), el('td', { text: v }))))];
}

export function createAct4({ world, conn, toast, say, talking, S, myUid, myChar, receiver, serverNow, holding, solvedByMe, playScript, finale = (done) => done(), dev }) {
  const warden = createWarden(world.scene, { view: WARDEN.view, fov: WARDEN.fov });
  const scenery = createAct4Scene(world.scene);
  const newAI = () => createWardenAI({ rooms: ROOMS, doors: DOORS, points: WARDEN_POINTS, params: WARDEN, start: WARDEN_START });
  let ai = newAI();
  let shown = { x: WARDEN_START.x, z: WARDEN_START.z, yaw: 0, mode: 'idle', zone: WARDEN_START.zone }, target = { ...shown };
  let active = false, introDone = false, startAt = 0, npcAt = 0, runFor = 0, tiredUntil = 0, humAt = 0;
  let faceYaw = 0, lastMode = null, nextCall = performance.now() + 50000; // 第二章：下一次點名
  let grabbed = null, boundOpen = false, ending = null; // ending：'climax'（大門）→ 'epilogue'（尾聲）→ 結束畫面
  const isSim = () => S().sim === myUid;
  const captured = () => !!S().nest?.[myUid];

  // ---- 畫面：倒數、心跳（守夜人靠近時畫面邊緣變紅）、掙脫、被綁住、判定輸 ----
  const hud = el('div', { id: 'a4clock', hidden: true }); $('hud').append(hud);
  const wstate = el('div', { id: 'a4state', hidden: true }); $('hud').append(wstate); let wsKey = '', begunAt = 0; // 守夜人現在在做什麼（2026-10-31：玩家要知道什麼時候可以安心解題）
  const veil = el('div', { id: 'a4veil' }); document.body.append(veil);
  // 畫面邊緣的紅／黑：只在數值真的變了才改（每一格都重畫整個畫面的漸層，守夜人靠近時會卡）
  let veilKey = '', dangerAt = 0;
  const setVeil = (bg, op) => { const key = bg + op; if (key === veilKey) return; veilKey = key; if (bg) veil.style.background = bg; veil.style.opacity = op; };
  const RED = 'radial-gradient(circle, transparent 55%, rgba(120,0,0,0.55) 100%)';
  const fight = el('div', { id: 'a4grab', hidden: true }, el('b', { text: t('a4_grab') }), el('div', { class: 'bar' }, el('i')));
  const bound = el('div', { id: 'a4bound', hidden: true }, el('p', { text: t('a4_bound') }),
    el('button', { text: t('a4_self'), onclick: () => openRescue(conn, 'S', myUid, toast) }));
  const lost = el('div', { id: 'a4lost', hidden: true }, el('h2', { id: 'a4lost-title' }), el('p', { id: 'a4lost-text' }),
    el('button', { text: t('a4_retry'), onclick: () => conn.request({ t: 'retry' }) }));
  const warn = el('div', { id: 'a4warn', hidden: true, text: t('a4_danger') }); // 視窗上面的警告（提示框在視窗底下會被蓋住）
  const callBanner = el('div', { id: 'a4call', hidden: true }); // 第二章：「諾克斯：○○○——」
  document.body.append(fight, bound, lost, warn, callBanner);
  // 被抓到：血噴在畫面上，慢慢淡掉（2026-11-04 加重血腥）
  const splash = el('div', { id: 'a4blood' }); document.body.append(splash);
  const bloodSplash = () => { splash.style.transition = 'none'; splash.style.opacity = '1'; splash.classList.toggle('flip'); void splash.offsetWidth; splash.style.transition = 'opacity 4s ease-in 2s'; splash.style.opacity = '0'; };

  // ---- 被抓到：1.5 秒內連點（空白鍵／畫面）掙脫 ----
  function struggle(until, free = 1) {
    if (panelOpen()) closePanel();
    let hits = 0; const need = 10; fight.hidden = false; fight.querySelector('i').style.width = '0%';
    fight.querySelector('b').textContent = t(free > 0 ? 'a4_grab' : 'a4_grab_none'); fight.classList.toggle('none', free <= 0); // 掙脫次數用完：怎麼點都沒用
    const hit = (e) => { if (e.type === 'keydown' && e.code !== 'Space') return; e.preventDefault?.(); if (free <= 0) return; hits++; fight.querySelector('i').style.width = `${Math.min(100, (hits / need) * 100)}%`; if (hits >= need) done(true); };
    const done = (ok) => {
      if (!grabbed) return; grabbed = null; fight.hidden = true;
      removeEventListener('keydown', hit); fight.removeEventListener('pointerdown', hit);
      conn.request({ t: ok ? 'escape' : 'caught' });
      if (ok) toast(t(free > 1 ? 'a4_escaped' : 'a4_escaped_last'));
    };
    grabbed = setTimeout(() => done(false), Math.max(300, until - serverNow()));
    addEventListener('keydown', hit); fight.addEventListener('pointerdown', hit);
    bloodSplash();
    if (hasSound('grab_scream')) sfx('grab_scream'); else scream(); sfx('stinger'); navigator.vibrate?.([200, 80, 200]);
  }

  // 這一幀所有玩家的狀況（給守夜人的 AI，只有 sim 在跑）
  function players(mine, h) {
    const nest = S().nest ?? {}, out = [];
    const online = new Set(S().members.filter((m) => m.online).map((m) => m.uid));
    out.push({ uid: myUid, zone: mine.z, x: mine.p[0], z: mine.p[1], moving: Math.hypot(...mine.v) > 0.3, running: Math.hypot(...mine.v) > 2.6, hidden: !!(h & 1), holding: !!(h & 2), captured: !!nest[myUid] });
    for (const [uid, p] of receiver.peers) {
      if (!online.has(uid)) continue;
      out.push({ uid, zone: p.z, x: p.shown[0], z: p.shown[1], moving: Math.hypot(...p.v) > 0.3, running: Math.hypot(...p.v) > 2.6, hidden: !!(p.h & 1), holding: !!(p.h & 2), captured: !!nest[uid] });
    }
    return out;
  }

  // 判定輸：「你們被同化了」＋重來的按鈕（收到訊息時，或重新整理後從房間狀態看到）
  const crestTimers = {};
  function crestLit(house, until) { scenery.crest?.(house, true); clearTimeout(crestTimers[house]); crestTimers[house] = setTimeout(() => scenery.crest?.(house, false), Math.max(0, until - serverNow())); }

  function showLost(reason) {
    if (grabbed) { clearTimeout(grabbed); grabbed = null; fight.hidden = true; }
    closePanel(); lost.hidden = false;
    $('a4lost-title').textContent = t('a4_lost_title');
    $('a4lost-text').textContent = t(`a4_lost_${reason}`);
    ai.stun(9999, performance.now());
  }

  function begin(retry) {
    active = true; introDone = false; ai = newAI(); begunAt = performance.now(); nextCall = performance.now() + 50000;
    if (boundOpen) { boundOpen = false; world.controls.setEnabled(true); } // 重來：被綁住的人也回到開頭
    if (retry) { if (S().nest) S().nest = {}; if (S().act4) S().act4.lost = null; } // 新的房間狀態馬上會到，先清掉，免得又被拉回蝕巢、又顯示判定輸
    shown = { ...shown, x: WARDEN_START.x, z: WARDEN_START.z, mode: 'idle', zone: WARDEN_START.zone }; target = { ...shown };
    lost.hidden = true; bound.hidden = true; fight.hidden = true;
    world.teleport(A4_SPAWN);
    if (retry) { say(SCRIPT['act4:retry']); return; }
    // 十二響，然後第十三響；守夜人哼著童謠從樓梯下來
    for (let i = 0; i < 13; i++) setTimeout(() => chime(false), i * 380);
    caption('cap.bells');
  }

  return {
    get ai() { return ai; },
    begin,
    // 每一幀：回傳要放進位置訊息的躲藏狀態
    frame(dt, mine, segment) {
      if (segment !== 'act4') {
        if (active) { active = false; hud.hidden = true; wstate.hidden = true; setVeil(null, 0); document.body.classList.remove('a4danger'); warn.hidden = true; world.tired = false; setMusic(null); setLoop('hide_breath', 0); }
        if (ending === 'climax' && !talking()) { // 守夜人墜下屋頂之後：回到宿舍，播尾聲
          ending = 'epilogue'; warden.set({ visible: false }); world.setDark(false);
          world.teleport({ x: 270, z: 20, yaw: -Math.PI / 2 }); playScript('segment:epilogue'); // 第二章：結界關上了，四人站在大門內
          { const st = S(), lines = [...(SCRIPT[st.flags?.C2 === 'tell' ? 'epi:tell' : 'epi:tear'] ?? [])];
            lines.push(...(SCRIPT[(st.feast?.rescued?.length ?? 0) >= 8 ? 'epi:rescued_all' : 'epi:rescued_some'] ?? []));
            const drank = Object.entries(st.juice ?? {}).filter(([, v]) => v).map(([u]) => st.members.find((m) => m.uid === u)?.name).filter(Boolean);
            if (drank.length) lines.push(...SCRIPT['epi:juice'].map(([w, zh, en]) => [w, zh.replace('{who}', drank.join('、')), en.replace('{who}', drank.join(', '))]));
            say(lines); } // 尾聲的分支：西里爾的抉擇、救出幾個低年級生、誰喝了南瓜汁
        } else if (ending === 'epilogue' && !talking()) { // 尾聲講完：最後的演出（熄燈、鏡子），然後第一章結束
          ending = 'finale'; setMusic(null);
          finale(() => { ending = null; setMusic('menu');
          // 第一章完：關掉（✕、Esc）也會再跳出來，不然玩家會卡在尾聲回不了選單（2026-11-03）
          const showEnd = () => openPanel(t('ch1_end'), (body, panel) => { body.append(...summary(S().result), el('p', { text: t('ch1_end_body') }),
            el('button', { text: t('to_menu'), onclick: () => { panel.onClose = null; const q = new URLSearchParams(location.search); q.delete('room'); location.href = location.pathname + (q.size ? `?${q}` : ''); } }));
            panel.onClose = () => setTimeout(showEnd, 600); });
          showEnd();
          });
        }
        return 0;
      }
      const now = serverNow(), st = S();
      scenery.frame(dt, mine.z, { lit: st.solved.includes('Q26'), close: 1 - Math.max(0, Math.min(1, ((st.act4?.deadline ?? now) - now) / 1800000)) });
      if (st.act4?.lost && lost.hidden) showLost(st.act4.lost); // 重新整理後也要看得到「重來」
      else if (!st.act4?.lost && !lost.hidden) lost.hidden = true;
      // 倒數
      const left = (st.act4?.deadline ?? now) - now;
      hud.hidden = false; hud.textContent = `${t('a4_clock')} ${fmt(left)}`;
      { const m = shown.mode, k = m === 'idle' || (m === 'rest' && performance.now() - begunAt < (WARDEN.calm ?? 0) * 1000) ? 'leave' : m === 'rest' || m === 'idle' ? 'rest' : m === 'chase' || m === 'grab' ? 'chase' : m === 'stun' ? 'stun' : 'hunt'; if (k !== wsKey) { wsKey = k; wstate.textContent = t(`a4_state.${k}`); wstate.className = k; } wstate.hidden = false; } hud.classList.toggle('urgent', left < 180000);
      // 劇情講完 3 秒後守夜人開始行動
      if (!introDone && !talking()) { introDone = true; startAt = performance.now() + 3000; }
      if (introDone && startAt && performance.now() > startAt) { ai.start(); startAt = 0; begunAt = performance.now(); } // begunAt：開場走開的那段從這裡算
      // 被綁在蝕巢
      const me = captured();
      if (me) {
        if (!boundOpen) { boundOpen = true; world.teleport({ ...NEST_SPOT, yaw: Math.PI / 2 }); world.controls.setEnabled(false); bound.hidden = false; toast(t('a4_dragged')); }
        const k = Math.min(1, (Date.now() - (st.nest[myUid].at ?? Date.now())) / 240000); // 黑根慢慢爬上來，畫面越來越暗
        const kq = Math.round(k * 20) / 20; setVeil(`radial-gradient(circle, transparent ${45 - kq * 40}%, rgba(0,0,0,${(0.6 + kq * 0.35).toFixed(2)}) 100%)`, 1);
      } else if (boundOpen) {
        boundOpen = false; bound.hidden = true; world.controls.setEnabled(true); world.teleport(NEST_EXIT); toast(t('a4_freed'));
      }
      // 體力：跑 8 秒要喘 4 秒
      const speed = Math.hypot(...mine.v);
      if (performance.now() < tiredUntil) world.tired = true;
      else { world.tired = false; runFor = speed > 2.6 ? runFor + dt : Math.max(0, runFor - dt * 0.5); if (runFor > 8) { tiredUntil = performance.now() + 4000; runFor = 0; toast(t('a4_tired')); playFile('assets/audio/ch1/breath_panting.mp3', { volume: 0.5 }); } }
      const h = (world.hidden() ? 1 : 0) + (holding() ? 2 : 0);
      // 躲起來時聽得到自己壓低的呼吸；屏息時停住（守夜人越近，呼吸越重）
      const d0 = shown.zone === mine.z ? Math.hypot(shown.x - mine.p[0], shown.z - mine.p[1]) : 99;
      setLoop('hide_breath', h === 1 && !me ? 0.25 + 0.35 * Math.max(0, 1 - d0 / 12) : 0);
      // 守夜人：sim 計算，其他人跟著 sim 的訊息
      if (isSim()) {
        const ps = players(mine, h);
        for (const ev of ai.update(dt, ps, performance.now())) {
          if (ev.type === 'catch') conn.request({ t: 'catch', uid: ev.uid }).then((r) => { if (r.t === 'error') ai.resolve(true, performance.now(), ps); });
          if (ev.type === 'spotted' && ev.uid === myUid) toast(t('a4_spotted'));
        }
        // 第二章：點名。休息、還沒出來時不點；每 45～60 秒點一個還在外面的人
        if (['patrol', 'search', 'chase'].includes(ai.state.mode) && performance.now() > nextCall) {
          const cand = ps.filter((p) => !p.captured).flatMap((p) => (S().juice?.[p.uid] ? [p, p] : [p])); const pick = cand[Math.floor(Math.random() * cand.length)]; // 喝過南瓜汁的人比較常被點到
          const [lo, hi] = WARDEN.rollEvery ?? [45, 60]; nextCall = performance.now() + (lo + Math.random() * (hi - lo)) * 1000;
          if (pick) conn.request({ t: 'rollcall', uid: pick.uid });
        }
        const w = ai.state; target = { x: w.x, z: w.z, yaw: w.yaw, mode: w.mode, zone: w.zone };
        shown = target;
        if (S().mode === 'multi' && performance.now() - npcAt > 120) { npcAt = performance.now(); conn.send({ t: 'npc', z: w.zone, w: [+w.x.toFixed(2), +w.z.toFixed(2), +w.yaw.toFixed(2)], m: w.mode }); }
      } else {
        const a = 1 - Math.exp(-dt * 6);
        shown = { ...target, x: shown.x + (target.x - shown.x) * a, z: shown.z + (target.z - shown.z) * a };
      }
      // 轉身慢慢轉（不要一下子轉過去；多人時位置每 0.12 秒才來一次，轉向會一格一格的）
      let dy = shown.yaw - faceYaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); faceYaw += dy * Math.min(1, dt * 10);
      if (shown.mode !== lastMode) { // 守夜人回蝕巢／又出來找人：告訴大家
        if (shown.mode === 'rest' && lastMode && lastMode !== 'idle') toast(t('a4_rest'));
        if (lastMode === 'rest' && shown.mode !== 'rest') toast(t('a4_hunt'));
        lastMode = shown.mode;
      }
      warden.set({ ...shown, yaw: faceYaw, visible: true });
      warden.frame(dt, shown.mode);
      // 靠近的感覺：畫面邊緣變紅、童謠
      const d = shown.zone === mine.z ? Math.hypot(shown.x - mine.p[0], shown.z - mine.p[1]) : 99;
      if (!me) setVeil(RED, (Math.round(Math.max(0, 1 - d / 14) * 10) / 10).toFixed(1));
      // 開著謎題視窗時守夜人來了：視窗邊框閃紅光＋提醒（2026-10-31：手機玩家專心解題時看不到他靠近）
      const danger = !me && panelOpen() && (d < 8 || (shown.mode === 'chase' && d < 18));
      if (danger !== document.body.classList.contains('a4danger')) { document.body.classList.toggle('a4danger', danger); warn.hidden = !danger; if (danger && performance.now() > dangerAt) { dangerAt = performance.now() + 8000; navigator.vibrate?.(120); } }
      // 配樂：守夜人越近越緊張；在追人時至少一半；被綁在蝕巢時只剩一點點
      if (!ending) setMusic('chase'); const near = Math.max(0, 1 - d / 22);
      setTension(me ? 0.12 : shown.mode === 'rest' ? 0.15 * near : shown.mode === 'chase' || shown.mode === 'grab' ? 0.5 + 0.5 * near : shown.mode === 'search' ? 0.25 + 0.5 * near : 0.6 * near);
      if (d < 20 && performance.now() > humAt) { humAt = performance.now() + 16000; sfx(d < 10 ? 'whisper' : 'paper'); } // 第二章：諾克斯靠近時聽得到翻點名簿、低聲念名字
      return h;
    },
    // 調查：蝕巢裡被綁住的同伴
    interact(tg) {
      if (tg.kind === 'crest') { // 第二章 Q27：點亮學院徽記台
        if (S().mode !== 'solo' && CHARS[myChar()]?.house !== tg.house && !(S().ai ?? []).includes(tg.house)) { toast(t('a4_crest_not_yours')); return true; }
        conn.request({ t: 'crest', house: tg.house }).then((r) => { if (r.t === 'error') toast(t('wrong')); else if (!r.solved) toast(t('a4_crest_lit', { n: r.lit?.length ?? 1 })); });
        return true;
      }
      if (tg.kind !== 'nest') return false;
      const list = Object.keys(S().nest ?? {}).filter((u) => u !== myUid);
      if (!list.length) { toast(t('a4_nest_empty')); return true; }
      if (list.length === 1) { openRescue(conn, 'R', list[0], toast); return true; }
      openPanel(L(tg.label), (body) => {
        for (const u of list) body.append(el('button', { text: S().members.find((m) => m.uid === u)?.name ?? '?', onclick: () => { closePanel(); openRescue(conn, 'R', u, toast); } }));
      });
      return true;
    },
    // 貝爾蒙特：擊退
    repel() {
      const mine = world.me();
      const d = shown.zone === mine.z ? Math.hypot(shown.x - mine.p[0], shown.z - mine.p[1]) : 99;
      if (d > 10) return toast(t('a4_repel_far'));
      conn.request({ t: 'repel' }).then((r) => { if (r.t === 'error') toast(t('a4_repel_cool', { s: Math.ceil((r.wait ?? 0) / 1000) })); });
    },
    canRepel: () => CHARS[myChar()]?.house === 'belmont',
    // 伺服器傳來的第四幕訊息
    onMessage(msg) {
      const now = performance.now();
      switch (msg.t) {
        case 'npc': if (!isSim() && msg.w) target = { x: msg.w[0], z: msg.w[1], yaw: msg.w[2], mode: msg.m, zone: msg.z }; break;
        case 'grab': if (msg.uid === myUid) struggle(msg.until, msg.free ?? 1); else toast(t('a4_grab_other', { name: S().members.find((m) => m.uid === msg.uid)?.name ?? '?' })); break;
        case 'escaped': if (isSim()) ai.resolve(true, now, []); break;
        case 'revived': // 單人：使魔把你拉回來（越來越虛弱）。就在原地醒來，不送回起點（2026-10-31 製作人）；守夜人退到遠處回蝕巢休息
          if (isSim()) ai.resolve(false, now, players(world.me(), 0));
          if (msg.uid === myUid) { say([[null, t('a4_revived', { n: msg.left }), t('a4_revived', { n: msg.left })]]); }
          break;
        case 'captured': if (isSim()) ai.resolve(false, now, players(world.me(), 0)); if (msg.uid !== myUid) toast(t('a4_captured_other', { name: S().members.find((m) => m.uid === msg.uid)?.name ?? '?' })); break;
        case 'freed': if (msg.uid !== myUid) toast(t('a4_freed_other', { name: S().members.find((m) => m.uid === msg.uid)?.name ?? '?' })); break;
        case 'repel': if (isSim()) ai.stun(WARDEN.repel, now); toast(t('a4_repelled')); $('flash')?.classList.add('on'); setTimeout(() => $('flash')?.classList.remove('on'), 300); break;
        case 'noise': if (isSim()) { const p = S().members.find((m) => m.uid === msg.uid); if (p && msg.p) ai.noise({ x: msg.p[0], z: msg.p[1], zone: msg.z }); } break;
        case 'rollcall': { // 第二章：諾克斯點名
          if (isSim()) ai.call(msg.uid, now + 10000);
          const name = S().members.find((m) => m.uid === msg.uid)?.name ?? '?';
          if (msg.uid === myUid) { callBanner.textContent = t('a4_call_me', { name }); callBanner.hidden = false; setTimeout(() => { callBanner.hidden = true; }, 10000); sfx('stinger'); navigator.vibrate?.([300, 100, 300]); }
          else toast(t('a4_call_other', { name }));
          break;
        }
        case 'crest': crestLit(msg.house, msg.until); break;
        case 'lost': showLost(msg.reason); break;
        case 'retry': begin(true); break;
      }
    },
    // 尾聲：先在大門演完高潮（艾洛拉燒掉點名簿），再播尾聲
    end() {
      active = false; ending = 'climax'; hud.hidden = true; wstate.hidden = true; setMusic(null); setLoop('hide_breath', 0); setVeil(null, 0); ai.stun(9999, performance.now());
      world.teleport({ x: 268, z: 20, yaw: Math.PI / 2 }); // 第二章：大門前庭，背對著正在關上的結界
      warden.set({ x: 262.5, z: 20, yaw: -Math.PI / 2, visible: true, mode: 'stun' }); // 諾克斯追到最後
      playScript('climax');
    },
    dev: dev ? { warden: () => shown } : null,
  };
}

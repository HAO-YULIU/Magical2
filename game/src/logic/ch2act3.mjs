// 第二章第三幕的玩法（帳號二，2026-11-09）：萬聖晚宴。
//   遇襲前：聽閒聊、打翻被下藥的那一壺（Q17）、喝不喝南瓜汁。
//   遇襲後（15 分鐘倒數，時間到不算輸）：蝕化學生看不太到、聽得到（跑步 10 公尺、走路 4 公尺；喝了南瓜汁的人加倍）；
//   打下最裡面的吊燈引開他們（Q18）、側門的符文（Q19，謎題視窗）、把躲起來的低年級生帶出去。被碰到：被拖倒、回到門口。
// 位置都由伺服器時間算（每個人看到的一樣）；「聽到聲音轉頭」只在自己的畫面上（簡化）。
import * as THREE from 'three';
import { openPanel, closePanel, el } from '../ui/overlay.mjs';
import { getLang } from './i18n.mjs';
import { JUGS, FIRSTYEARS, SIDE_DOOR, CHANDELIER_FAR, CH2_A3_SPAWNS } from '../data/ch2-act1.mjs';
import { loadCharacter } from '../art/characters.mjs';
import { erode } from '../art/ch2/erode.mjs';
import { sfx, buzz } from '../art/sfx.mjs';

const T = (zh, en) => (getLang() === 'en' ? en : zh);
const ERODED = 6;

export function createCh2Act3({ world, conn, toast, say, S, myUid, myChar, solvedByMe, serverNow, playScript, scene: ch2scene }) {
  const scene_ = ch2scene;
  const scene = world.scene;
  // ---- 倒數（畫面上方）----
  const hud = el('div', { id: 'feasthud', hidden: true }); document.body.append(hud);
  // ---- 蝕化的學生 ----
  const students = []; let loaded = false;
  async function loadStudents() {
    if (loaded) return; loaded = true;
    const keys = ['vaughn', 'yuexi', 'cyril', 'elora', 'vaughn', 'yuexi'];
    for (let i = 0; i < ERODED; i++) {
      try {
        const c = await loadCharacter(keys[i]); erode(c.root, 0.9); c.root.visible = false; scene.add(c.root);
        students.push({ c, home: [SIDE_DOOR.x + 2 + (i % 3) * 1.1, SIDE_DOOR.z + 1 + Math.floor(i / 3) * 1.4], chase: 0, pos: new THREE.Vector2(), ph: i * 1.7 });
      } catch { /* 模型載不到：沒有蝕化學生（不影響解題） */ }
    }
  }
  // ---- 躲起來的低年級生：小小的、縮成一團的人影（救出去／蝕化就消失） ----
  const kids = FIRSTYEARS.map(([x, z], i) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), new THREE.MeshStandardMaterial({ color: '#2a2a3a', roughness: 0.9 })); body.scale.set(1, 0.8, 1); body.position.y = 0.25; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), new THREE.MeshStandardMaterial({ color: '#e0c4aa', roughness: 0.7 })); head.position.set(0, 0.5, 0.12); g.add(head);
    g.position.set(x, 0, z); g.visible = false; scene.add(g); return g;
  });

  let caughtCool = 0, lastFeast = null;
  const feast = () => S().feast;
  const attacked = () => !!feast()?.attack;
  const drank = () => !!S().juice?.[myUid];

  function caught() {
    caughtCool = performance.now() + 4000;
    sfx('stinger'); buzz([200, 80, 200]);
    const b = document.getElementById('a4blood'); if (b) { b.style.transition = 'none'; b.style.opacity = '1'; void b.offsetWidth; b.style.transition = 'opacity 4s ease-in 1.5s'; b.style.opacity = '0'; }
    world.teleport(CH2_A3_SPAWNS.act3a);
    toast(T('一隻冰冷的手抓住你的腳踝，把你拖倒在地——你掙脫了，退回門口。', 'A cold hand seizes your ankle and drags you down — you tear free and stagger back to the door.'));
  }

  return {
    interact(tg) {
      if (tg.kind === 'gossip') {
        conn.request({ t: 'peek', pid: 'Q17' }).then((r) => {
          if (r.t !== 'peek') return; const { knox, helga, cups } = r.content, tb = tg.table;
          const lines = [
            [T(`「諾克斯教授剛剛親自端了兩壺過來，第 ${knox[0]} 壺跟第 ${knox[1]} 壺。她平常根本不碰廚房的事。」`, `“Professor Knox carried two jugs over herself — jug ${knox[0]} and jug ${knox[1]}. She never touches kitchen work.”`)],
            [T(`「第 ${helga} 壺是赫爾嘉夫人倒的，她倒完還嚐了一口。」`, `“Jug ${helga} was poured by Madam Helga — she even tasted it.”`)],
            [T(`「你看第 ${cups.indexOf(Math.max(...cups)) + 1} 桌，喝得最兇的就是他們……被下藥的話，一定是放在那一桌吧。」`, `“Look at table ${cups.indexOf(Math.max(...cups)) + 1} — they’re drinking the most… if anything’s been dosed, it must be on that table.”`)],
          ][tb - 1];
          say([[null, T(`（第 ${tb} 桌：桌上空了 ${cups[tb - 1]} 個杯子）`, `(Table ${tb}: ${cups[tb - 1]} empty cups)`), T(`（第 ${tb} 桌：桌上空了 ${cups[tb - 1]} 個杯子）`, `(Table ${tb}: ${cups[tb - 1]} empty cups)`)], ['student', lines[0], lines[0]]]);
        });
        return true;
      }
      if (tg.kind === 'jug') {
        if (attacked()) { toast(T('來不及了。', 'Too late.')); return true; }
        openPanel(T(`第 ${tg.jug} 壺南瓜汁`, `Jug ${tg.jug}`), (body) => body.append(
          el('p', { text: T('要「不小心」把這一壺打翻嗎？只有一次機會——打翻之後，鐘聲就會響。', 'Knock this jug over “by accident”? You only get one chance — once it spills, the bell will toll.') }),
          el('div', { class: 'row' }, el('button', { class: 'primary small', text: T('打翻它', 'Knock it over'), onclick: async () => {
            const r = await conn.request({ t: 'answer', pid: 'Q17', value: tg.jug }); closePanel();
            scene_?.knockJug(tg.jug);
            if (r.solved) { solvedByMe('Q17', r); toast(T('南瓜汁灑了一地，表面浮著一層黑色的油膜——就是這一壺。', 'Juice splashes across the floor, a black oily film on its surface — this was the one.')); }
            else if (r.t !== 'error') toast(T('南瓜汁灑了一地……看起來沒什麼不對勁。', 'Juice splashes everywhere… nothing seems wrong with it.'));
          } }), el('button', { text: T('算了', 'Leave it'), onclick: closePanel }))));
        return true;
      }
      if (tg.kind === 'mycup') {
        if (myChar() === 'elora') { say([['elora', T('（手好痛……我不喝了。）', '(My hand hurts too much… I won’t drink.)'), T('（手好痛……我不喝了。）', '(My hand hurts too much… I won’t drink.)')]]); return true; }
        if (attacked()) { toast(drank() ? T('你喝過了。喉嚨深處有東西在動。', 'You drank it. Something stirs at the back of your throat.') : T('你沒有喝。還好。', 'You didn’t drink. Thank goodness.')); return true; }
        openPanel(T('一杯南瓜汁', 'A cup of pumpkin juice'), (body) => body.append(
          el('p', { text: T('甜甜的南瓜香。大家都在喝。', 'Sweet, spiced pumpkin. Everyone is drinking.') }),
          el('div', { class: 'row' }, el('button', { text: T('喝一口', 'Take a sip'), onclick: async () => { await conn.request({ t: 'drink', drink: true }); closePanel(); toast(T('……有一點苦。', '…A little bitter.')); } }),
            el('button', { text: T('不喝', 'Don’t drink'), onclick: async () => { await conn.request({ t: 'drink', drink: false }); closePanel(); } }))));
        return true;
      }
      if (tg.kind === 'lure') {
        if (!attacked()) { toast(T('吊燈上的南瓜燈輕輕搖晃。', 'The lanterns on the chandelier sway gently.')); return true; }
        if (S().solved.includes('Q18')) { toast(T('吊燈已經砸在地上了。', 'The chandelier already lies shattered.')); return true; }
        conn.request({ t: 'answer', pid: 'Q18', value: 'done' }).then((r) => { if (r.solved) { sfx('stinger'); solvedByMe('Q18', r); toast(T('吊燈轟然砸下！所有蝕化的學生都轉頭，往聲音的方向走過去。', 'The chandelier crashes down! Every one of the Eroded turns and shuffles towards the noise.')); } });
        return true;
      }
      if (tg.kind === 'decoy') { if (attacked()) { sfx('metal'); toast(T('盔甲倒下的聲音太近了——他們往你這邊轉過來了！', 'The armour clatters down far too close — they’re turning towards you!')); for (const s of students) s.chase = 4; } return true; }
      if (tg.kind === 'firstyear') {
        const f = feast();
        if (!attacked()) { toast(T('一個低年級生在桌子底下撿掉下去的叉子。', 'A first-year is under the table, fishing for a dropped fork.')); return true; }
        if (f?.rescued?.includes(tg.kid)) return true;
        if (f?.lost?.includes(tg.kid)) { toast(T('他抬起頭——眼睛全黑了。來不及了。', 'They look up — eyes completely black. Too late.')); return true; }
        conn.request({ t: 'firstyear', kid: tg.kid }).then((r) => {
          if (r.t === 'ok') toast(T(`你摀住他的嘴，帶他從側門出去。赫爾嘉夫人接住了他。（救出 ${r.rescued}）`, `You hush them and lead them out of the side door. Madam Helga catches them. (${r.rescued} rescued)`));
          else toast(T('側門還封著，外面也還有蝕化的學生。先想辦法引開他們、打開側門。', 'The side door is still sealed, and the Eroded are out there. Lure them away and open the door first.'));
        });
        return true;
      }
      return false;
    },
    frame(dt, mine, segment) {
      const f = feast();
      const active = segment === 'act3a';
      // 倒數
      if (active && f?.attack) {
        const left = Math.max(0, f.deadline - serverNow()), m = Math.floor(left / 60000), s = Math.floor(left / 1000) % 60;
        hud.hidden = false; hud.textContent = `${T('魔蝕擴散', 'The Blight spreads')} ${m}:${String(s).padStart(2, '0')}　${T('救出', 'Rescued')} ${f.rescued.length}／${8 - f.lost.length}`;
      } else hud.hidden = true;
      if (active && f?.attack && !lastFeast) { loadStudents(); if (serverNow() - f.attack < 60000) playScript?.('feast:attack'); } // 遇襲的那一刻（重新連線時太久以前的就不播）
      lastFeast = active ? f?.attack : null;
      // 低年級生
      kids.forEach((k, i) => { k.visible = active && !!f?.attack && !f.rescued.includes(i) && !f.lost.includes(i); });
      // 蝕化的學生
      const on = active && !!f?.attack;
      const lured = S().solved.includes('Q18');
      const t = serverNow() / 1000;
      const me = new THREE.Vector2(mine.p[0], mine.p[1]);
      const speed = Math.hypot(mine.v[0], mine.v[1]);
      const hear = (speed > 2.6 ? 10 : speed > 0.3 ? 4 : 0) * (drank() ? 2 : 1);
      students.forEach((st, i) => {
        st.c.root.visible = on; if (!on) return;
        const base = lured ? [CHANDELIER_FAR.x + Math.cos(t * 0.3 + st.ph) * 2.5, CHANDELIER_FAR.z - 2 + Math.sin(t * 0.4 + st.ph) * 1.5] : [st.home[0] + Math.sin(t * 0.5 + st.ph) * 0.4, st.home[1] + Math.cos(t * 0.6 + st.ph) * 0.4];
        if (!st.pos.x && !st.pos.y) st.pos.set(base[0], base[1]);
        const d = st.pos.distanceTo(me);
        if (mine.z === 'banquet' && d < hear) st.chase = Math.max(st.chase, 5);
        st.chase = Math.max(0, st.chase - dt);
        const target = st.chase > 0 && mine.z === 'banquet' ? me : new THREE.Vector2(base[0], base[1]);
        const dir = target.clone().sub(st.pos), len = dir.length(), v = st.chase > 0 ? 1.9 : 1.1;
        if (len > 0.05) { st.pos.addScaledVector(dir.normalize(), Math.min(len, v * dt)); st.c.root.rotation.y = Math.atan2(dir.x, dir.y); }
        st.c.root.position.set(st.pos.x, 0, st.pos.y); st.c.setMoving?.(len > 0.1 ? v : 0); st.c.update?.(dt, null);
        if (mine.z === 'banquet' && d < 0.9 && performance.now() > caughtCool) { st.chase = 0; caught(); }
      });
    },
  };
}

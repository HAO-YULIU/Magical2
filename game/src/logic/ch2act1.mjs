// 第二章第一幕的玩法（帳號二，2026-11-05）：溫室找異常（Q06）、四學院的線索（Q07）。
// 謎題視窗的題目（Q01～Q05、Q08、Q09）在 ui/puzzles.mjs；這裡是「走過去調查」的那幾種。
import { t, getLang } from './i18n.mjs';
import { openPanel, el } from '../ui/overlay.mjs';
const T = (zh, en) => (getLang() === 'en' ? en : zh);

const HOUSES = ['eldrin', 'grimoire', 'belmont', 'ouroboros'];

export function createCh2({ conn, toast, say, S, myHouse, solvedByMe, scene }) {
  const marked = new Set();
  const items = () => S().items ?? [];
  const multi = () => S().mode !== 'solo';

  async function markSpot(tg) {
    if (S().solved.includes('Q06')) return toast(T('溫室的門已經開了。', 'The greenhouse door is already open.'));
    if (marked.has(tg.spot)) { marked.delete(tg.spot); scene?.mark(tg.spot, false); return toast(T(`取消標記（已標記 ${marked.size}／3）`, `Mark removed (${marked.size}/3 marked)`)); }
    marked.add(tg.spot); scene?.mark(tg.spot, true);
    if (marked.size < 3) return toast(T(`光照咒在這裡留下一圈光（已標記 ${marked.size}／3）`, `The light spell leaves a ring of light here (${marked.size}/3 marked)`));
    const r = await conn.request({ t: 'answer', pid: 'Q06', value: [...marked] });
    if (r.solved) { solvedByMe('Q06', r); toast(T('三個地方都對了！', 'All three are right!')); return; }
    // 找錯：燈閃一下，所有植物轉向你；標記清掉
    for (const s of marked) scene?.mark(s, false);
    marked.clear(); scene?.stare();
    toast(r.t === 'error' ? t('wrong') : T('燈閃了一下——所有的植物都轉過來看著你。標記全部消失了。', 'The lights flicker — every plant turns to look at you. The marks are gone.'));
  }

  async function houseClue(tg) {
    const ai = S().ai ?? [];
    if (multi() && myHouse() !== tg.house && !ai.includes(tg.house)) return toast(T('這是別的學院的線索，你看不懂。請那個學院的同伴來看。', 'This clue belongs to another house — you can’t read it. Ask a teammate from that house.'));
    say([[null, tg.text.zh, tg.text.en]]);
    const id = `clue_${tg.house}`;
    if (!items().includes(id)) await conn.request({ t: 'collect', item: id });
    const have = new Set([...items(), id]);
    if (!S().solved.includes('Q07') && HOUSES.every((h) => have.has(`clue_${h}`))) {
      const r = await conn.request({ t: 'answer', pid: 'Q07', value: 'done' });
      if (r.solved) { solvedByMe('Q07', r); setTimeout(() => toast(T('四個學院的線索拼起來了。', 'The four houses’ clues fit together.')), 2500); }
    }
  }

  return {
    interact(tg) {
      if (tg.kind === 'greenspot') { markSpot(tg); return true; }
      if (tg.kind === 'houseclue') { houseClue(tg); return true; }
      if (tg.kind === 'xraynails') { // Q13：13 號床的床板（醫務室這一邊的線索：哪幾格有釘子）
        if (!S().solved.includes('Q10')) { toast(T('床板被床墊壓著。', 'The board is pinned under the mattress.')); return true; }
        conn.request({ t: 'peek', pid: 'Q13' }).then((r) => {
          if (r.t !== 'peek') return;
          const nails = new Set(r.content.nails), grid = el('div', { class: 'ch2-xray nails' });
          grid.append(el('i'), ...[1, 2, 3, 4].map((c) => el('b', { text: String(c) })));
          for (let rr = 0; rr < 4; rr++) { grid.append(el('b', { text: 'ABCD'[rr] })); for (let c = 0; c < 4; c++) grid.append(el('span', { class: 'cell' + (nails.has(rr * 4 + c) ? ' nail' : ''), text: nails.has(rr * 4 + c) ? '✚' : '' })); }
          openPanel(T('13 號床的床板', 'The board of bed 13'), (body) => body.append(el('p', { class: 'dim', text: T('床板背面刻著 4×4 的格子，有十個格子被釘了釘子。告訴在檔案室的隊友。', 'A 4×4 grid is carved on the underside; ten of the cells have nails driven in. Tell your teammate in the archive.') }), grid));
        });
        return true;
      }
      return false;
    },
  };
}

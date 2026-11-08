# 《魔蝕milner》第二章《萬聖夜》

夜語工作室《魔蝕milner》的**第二章**。第一章在另一個儲存庫（`HAO-YULIU/Kooomp`），**兩邊分開，不要混在一起**：第一章已經上線，改第二章不能動到第一章。

## 每次開工先做
1. 讀 `docs/DECISIONS.md`（製作人確認過的決定）和 `README.md`（目前有什麼、還在等什麼）。
2. 第一章的決定（`Kooomp/docs/DECISIONS.md`）第二章沿用，除非第二章的 DECISIONS 另外寫。

## 程式（2026-11-04 從第一章複製過來當底，製作人確認）
- 跟第一章一樣：`game/`（畫面）、`server/`（Cloudflare Worker＋房間，**答案只在伺服器判斷**）、`data/puzzles/`（答案與提示，不發佈）、`tools/`（build、測試）、`prototype/`（三方程式庫、角色雛形）。
- 目前內容**還是第一章的**（複製時的狀態），之後一段一段換成第二章。
- Worker 名稱是 `magical2`（`wrangler.jsonc`），跟第一章的 `kooomp` 分開。網址 https://magical2.noron.workers.dev/ （2026-11-08 製作人要求部署，給製作人測試）。部署：在儲存庫根目錄跑 `npx --prefix tools wrangler deploy`（會自動 build、混淆）。
- 本機：`cd tools && npm ci && npm run build:plain`，再 `npx --prefix tools wrangler dev --config wrangler.plain.jsonc`（`wrangler.plain.jsonc` 是 `wrangler.jsonc` 拿掉 build 那一段，不 commit），網址加 `?dev=名字` 免登入。
- 測試：`cd tools && npm test`。

## 開發方式
- 跟製作人溝通用繁體中文、用詞淺白。
- 每個階段做完先停下來等製作人確認；還沒決定的事不要自己定案，寫進 `README.md` 的「還沒決定」。

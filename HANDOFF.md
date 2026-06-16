# 新勝 GDP 專案交接（精簡版）

> 最後更新：2026-06-16（第118次，登入卡住修復＋開工資料精簡）
> 原則：本檔只保留「最新可接狀態、當前待辦、關鍵踩坑」。舊輪次完整流水帳不再放在開工入口；歷史重點已整理進第二大腦專案筆記與踩坑紀錄。

---

## 1. 最新狀態

| 項目 | 狀態 |
|---|---|
| 專案 | 新勝醫藥 GDP 內訓 HTML 資料庫 |
| 主檔 | `HTML資料庫/新勝GDP資料庫.html` |
| Firebase rules | `Firebase設定/firestore.rules` |
| 分支 | `codex/gdp-html-training-pages` |
| 永久網址 | `https://n1116839.github.io/xinshing-gdp-training/` |
| 最新本輪修正 | 登入 gate 不再永遠卡在「登入狀態確認中」 |
| 本輪驗收 | `JS_PARSE_OK 1`、`verify_facts_ghpages.mjs 1296/1296` |

### 第118次本輪修正

使用者回報：Claude 接續做登入三頁後，最後一次收工線上無法登入，畫面停在「登入狀態確認中...」。

已修正 `HTML資料庫/新勝GDP資料庫.html`：

- `authStore.onAuthStateChanged` 每次登入狀態更新時清除舊 `gateError`。
- `ensureSuperAdmin()` 若超管初始化失敗，會設定明確錯誤訊息，不再只 `console.warn`。
- `gateState()` 中，超管已登入但 profile 未 active 時，改回 `error`，不再回 `loading`。
- 錯誤畫面新增「登出後重新登入」按鈕，避免舊 Google 登入狀態把使用者鎖在 loading。

判斷：原本只要超管快取登入存在，但 Firestore profile 讀取或超管 bootstrap 寫入失敗，`gateState()` 會永久回 `loading`，使用者只看到登入狀態確認中，沒有可操作出口。

---

## 2. 開工必讀順序

每次開工仍需讀：

1. `AGENTS.md`
2. `HANDOFF.md`（本檔）
3. `G:\我的雲端硬碟\我的第二大腦\踩坑紀錄.md`
4. `G:\我的雲端硬碟\我的第二大腦\專案\2026codex AI測試.md`
5. `GDP_智慧查詢規範.md`
6. 若涉及視覺、互動、登入或權限：`HTML視覺權限改善報告_2026-06-02.md`
7. 若涉及測驗：`GDP_測驗平台與考題規範.md`

注意：開工時不可把舊輪次全部當現況。以本檔最新狀態與第二大腦最新日期為準。

---

## 3. 當前功能狀態

### 登入／權限

- Google 登入已建立為進站前全屏 gate。
- Line / Outlook 已移除，不做付費或需金鑰方案。
- 超管 email：`tom741285@gmail.com`，登入後應自動 active＋`doc_superadmin`。
- 進站前同意書已加入 `consent` state，超管也需同意。
- 帳號申請與審核 UI 已加入管理面板。
- 目前登入 gate 已補錯誤出口；若 Firestore rules 或 profile 寫入失敗，會顯示可診斷錯誤與登出按鈕。

### Firebase

- `firestore.rules` 已包含：
  - `gdpUsers`
  - `gdpUserApplications`
  - `gdpChangeDrafts`
  - `gdpAuditLogs`
  - `gdpRoleChangeLogs`
  - `gdpConsentLogs`
- 修改 store 寫入欄位或 docId 時，必須同步改 rules 並部署；只 commit rules 不等於線上生效。

### KB / 智慧查詢

- Phase 1 KB 已完成：122 筆 fact、全 8 章。
- `verify_facts_ghpages.mjs` 最新通過：`1296/1296`。
- 公司無冷藏倉，教材與 KB 不可寫冷鏈、冷藏倉、冷藏庫等公司做法。

### 測驗平台

- 測試專區已可作答、抽題、計分與列印/送交資料。
- 題庫仍是草稿性質；正式上架需逐題補齊來源、解析與審核欄位。
- 測驗功能修改前必讀 `GDP_測驗平台與考題規範.md`。

---

## 4. 下一步待辦

| 優先 | 項目 | 備註 |
|---|---|---|
| 最高 | 線上登入實測 | 推送後用 Chrome/無痕開永久網址，確認不再卡 loading；若仍錯，畫面應顯示可診斷錯誤與登出。 |
| 高 | 管理面板加「同意書／審核紀錄查詢」頁 | 讀 `gdpConsentLogs`、`gdpRoleChangeLogs`、`gdpAuditLogs`；限管理者。 |
| 中 | page③ 依職稱過濾各部門內容 | 需用 §44.5 標籤與 §48 權限矩陣，注意靜態站前端遮蔽不是真正資料保護。 |
| 中 | 帳號審核擴充 | 晉升、降職、離職停用、兼任/代理。 |
| 中 | 測驗正式題庫 | 需逐題來源、解析、審核者、審核日期；不可 AI 自行上架。 |

---

## 5. 重要踩坑摘要

### 登入 gate

- 進站前登入要用覆蓋層 gate，不要重寫整站 `showSection()`。
- 超管 bootstrap 需同時前端 hardcode email 與 rules 放行。
- `gateState()` 不可在錯誤狀態回 `loading`；所有可能失敗的遠端初始化都要有錯誤出口、重試與登出。
- Google 登入問題常見兩種 Firebase Console 設定：Google provider 未啟用、`n1116839.github.io` 未加入 Authorized domains。
- 使用者桌面捷徑可能用 IE 或舊快取；驗收請用 Chrome 或無痕。

### Firestore

- 改前端寫入欄位時，必須同步改 rules 的 `hasOnly` / docId 條件並部署。
- 本機 localhost permission-denied 可能是授權網域限制；正式 GH Pages 若 permission-denied 才是 rules/部署問題。
- 同意書 log 要用 append-only `gdpConsentLogs`，不要寫 `gdpAuditLogs`，因一般員工沒有 admin create 權限。

### 文件與開工入口

- 不再新增 `OPENAI_...`、`開工指導...`、`臨時交接...` 類長期輔助文件。
- `HANDOFF.md` 不放百輪流水帳，只保留最新狀態與精簡摘要。
- 歷史踩坑與回饋要放第二大腦：`踩坑紀錄.md` 與 `專案/2026codex AI測試.md`。
- Agent 暫存檔必須 `_暫存` 結尾；下載檔必須 `codex_` 前綴。未符合者視為使用者資料，不得清理。

### HTML / 視覺

- 整頁 layout 放入 `#content.grid` 時要 `grid-column:1/-1`，否則桌面表單會被壓成窄欄。
- 視覺修改必須桌機與手機實機看過；DOM 找得到不代表使用者看得到。
- 固定驗收題 `data-q` 不可任意改字串。

---

## 6. 收工必做

1. 更新本檔最新狀態。
2. 更新第二大腦：
   - `G:\我的雲端硬碟\我的第二大腦\踩坑紀錄.md`
   - `G:\我的雲端硬碟\我的第二大腦\專案\2026codex AI測試.md`
3. 跑必要驗收。
4. `git commit`
5. `git push`
6. 推送後用永久網址驗收。

# 新勝 GDP 專案交接（精簡版）

> 最後更新：2026-06-16（第121次，手機 Google 登入改為 mobile redirect）
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
| 最新本輪修正 | 手機 Google 登入改為 mobile redirect；App 內建瀏覽器保留明確導引提示 |
| 本輪驗收 | `JS_PARSE_OK 1`；尚未做 GitHub Pages 手機實機複測 |

### 第121次本輪修正

使用者回報：手機依然無法登入。進一步檢查後確認，前一輪只補了「請改用 Chrome / Safari」提示，但登入核心仍是 `signInWithPopup`，這在手機正式瀏覽器也可能失敗。

本輪已修正 `HTML資料庫/新勝GDP資料庫.html`：

- `authStore.signInWithGoogle()` 改為：桌機維持 `signInWithPopup`；手機改走 `signInWithRedirect`。
- 新增 `GOOGLE_REDIRECT_FLAG` 與 redirect returning 狀態處理；頁面往返 Google 後，會清掉 redirect flag，避免使用者卡在不明狀態。
- `authStore._init()` 補 `getRedirectResult()`，若手機 redirect 返回失敗，會轉成可讀錯誤訊息，而不是只留在瀏覽器 console。
- 前一輪加入的手機提示卡保留，但定位改為輔助說明；真正解法是登入策略改為 mobile redirect，不再只靠提示。

下次若手機仍無法登入，優先確認：

- 是否已推送到 GitHub Pages 最新版。
- 使用者是否真的是從 Chrome / Safari 開啟，而不是 App 內建瀏覽器。
- 手機返回頁是否出現 Firebase `auth/unauthorized-domain`、`auth/configuration-not-found` 或其他 redirect 錯誤。

### 第120次本輪修正

使用者要求：進站前「平台使用聲明」不要直接顯示完整姓名，應以員工編號為主；若需顯示姓名，只能顯示遮罩格式，例如 `黎O嘉`。

本輪已修正 `HTML資料庫/新勝GDP資料庫.html`：

- 同意書卡片副標改為以 `員工編號` 為主顯示，不再把完整姓名放在最前面。
- 新增 `maskName(name)`，姓名遮罩規則為：1 字保留原字、2 字顯示 `首字+O`、3 字以上顯示 `首字+O+末字`。
- `consent` 狀態畫面目前會顯示 `員工編號 XXX（遮罩姓名）`；若沒有姓名資料，則只顯示員工編號。
- 本輪未更動 Firestore rules、登入流程狀態機或其他頁面權限邏輯。

下次若再調整同意書個資顯示，原則是：**員工編號優先、姓名不得全名裸露；若要帶姓名，只能用遮罩格式**。

### 第119次本輪處理

使用者回報：永久網址仍無法登入，畫面不再卡「登入狀態確認中」，而是顯示「超管帳號初始化失敗，請確認 Firestore rules 已部署，或登出後重新登入。」

本輪判斷與處理：

- 永久網址實測 HTML 已包含第118次修正：`超管帳號初始化失敗`、`gdpConsentLogs`、`roles:["doc_superadmin"]`、`CONSENT_VERSION = "2026-06-16"` 皆命中，排除線上 HTML 舊版問題。
- 本機 `Firebase設定/firestore.rules` 已有超管 email 放行、`gdpUsers` 超管自建 active profile 分支，以及 `gdpConsentLogs` append-only 規則。
- 重新執行 `npx firebase-tools deploy --only firestore:rules`，目標專案 `xinshing-gdp-training-20260525`，部署結果：rules 編譯成功並 release 到 Cloud Firestore。
- 本輪未修改 HTML / rules 檔案內容；Git 工作樹無已追蹤檔差異，沒有未推送 commit。

下次若使用者仍看到同一錯誤，優先請使用者按畫面「登出後重新登入」，或用 Chrome 無痕重新登入 `tom741285@gmail.com`。若仍失敗，再查 Firebase Console Authentication 使用者 email、Firestore `gdpUsers/{uid}` 是否已有舊 pending profile，以及 browser console 的 permission-denied 詳細錯誤。

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
| 最高 | 手機登入實測與導引修正 | 使用者手機畫面顯示 `requirements do not comply with Google secure browser policy`，疑似從 App 內建瀏覽器 / WebView 開啟 Google 登入，被 Google 安全瀏覽器政策封鎖；下次開工先確認是否需加偵測與明確提示「請改用 Chrome / Safari 開啟」。 |
| 最高 | 線上登入實測 | 已重新部署 Firestore rules；請用 Chrome/無痕重新登入，若仍錯需抓 browser console `permission-denied` 細節與 `gdpUsers/{uid}` 狀態。 |
| 高 | 權限管理畫面完成度盤點 | 使用者回報「沒有權限管理的畫面」；需先分清是未登入導致看不到，還是管理面板功能尚未補齊，再決定補 UI 或補角色顯示說明。 |
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

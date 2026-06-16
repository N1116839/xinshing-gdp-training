# 新勝 GDP 專案交接（精簡版）

> 最後更新：2026-06-16（第124次：管理面板手機排版、AI 管理助理自然語言入口、帳號權限矩陣改版；commit `5adf34a` 已成功推送並用永久網址確認線上是最新版）
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
| 最新本輪修正 | 管理面板改成手機單欄可讀；待審核帳號改為左側部門/工號樹＋右側角色權限矩陣；AI 管理助理改為自然語言需求入口，並清楚區分帳號職務、教材題庫、網站功能需求的核准後邊界 |
| 本輪驗收 | `JS_PARSE_OK 1`；`node verify_facts_ghpages.mjs` = `1296/1296`；靜態檢查命中 `admin-permission-shell`、`permission-table`、`admin-assistant-shell`、`data-admin-example`、`建立網站功能需求單`；in-app Browser 因 URL policy 擋住本地預覽，未能提供自動截圖驗收 |

### 第124次本輪修正（管理面板手機版＋AI 助手＋權限矩陣）

使用者指出三個目標：手機管理畫面直式縮在左邊、AI 助手選項太多且核准後是否會真正維護不清楚、管理權限畫面需接近 ERP 權限設定表格。

**已修正 `HTML資料庫/新勝GDP資料庫.html`：**
- 管理區 CSS 新增 `admin-stack`、`admin-summary-grid`、`admin-assistant-shell`、`admin-permission-shell` 等版型；手機寬度下強制單欄、按鈕滿寬、權限矩陣橫向捲動，避免整個管理畫面縮在左側窄欄。
- 待審核帳號改為左側依部門分組的員工樹，右側為「角色群組 × 功能」權限矩陣。核准仍使用既有 roles/status 寫入流程，不新增 Firestore 欄位或 rules。
- AI 管理助理改為自然語言入口，提供停用帳號、職務異動、題庫修正、網站改版四個範例按鈕；進階欄位收進 `<details>`，降低一般管理者理解負擔。
- 新增自然語言分類：像「倉管介面我想改成橘色」會判斷為網站功能需求，產生功能需求單，不由前台直接改正式站檔案。
- 畫面文案明確區分核准後邊界：帳號職務可在權限矩陣核准後生效；教材、題庫、KB 先進待審核草稿；HTML/CSS/JS/Firebase rules/GitHub Pages 需求需走 Codex / PR / 預覽 / 測試 / 部署流程。

**本輪驗收：**
- `JS_PARSE_OK 1`
- `node verify_facts_ghpages.mjs`：`1296/1296`
- 靜態檢查：新管理 UI 標記均已命中。
- in-app Browser 嘗試用本地預覽檢查桌機/手機畫面時被 URL policy 擋下；不可再繞路使用其他瀏覽器面達成同一預覽。

**後續確認（同一交接，補推送）：**
- 上輪 `git push` 曾被 Codex 用量限制擋下，commit `5adf34a` 當時只進了本機 HEAD 沒上 GitHub。本次開工重新執行 `git push origin codex/gdp-html-training-pages` 成功（`b28bd8b..5adf34a`）。
- 重跑 `node verify_facts_ghpages.mjs`：仍 `1296/1296` 通過。
- `curl` 永久網址子路徑確認線上 HTML 已含本輪標記：`admin-permission-shell`×3、`admin-assistant-shell`×3、`建立網站功能需求單`×1。
- 本機有未追蹤資料夾（第一章品質管理、第三章作業場所與設備、第六章申訴退回疑似偽禁藥及藥品回收、第四章文件），疑為使用者原始資料，未動。

下次優先：① 用手機/桌機永久網址進管理面板實測版面（線上已是最新版，可直接測）。② 若使用者要真正做到截圖中的「逐格功能權限」而非角色模板，需新增 `gdpRolePermissions` / `gdpRolePermissionOverrides` 類資料表與 Firestore rules，不能只改前端畫面。③ Android 手機 Google 登入仍需實機複測。④ EmailJS 三值仍待使用者提供。

### 第123次本輪修正（手機登入 redirect → popup）

使用者指定優先處理手機登入。依第122次影片診斷，LINE 跳出外部瀏覽器已成功，真卡點是 Android 選完 Google 帳號轉址回 GitHub Pages 後，Firebase `signInWithRedirect` 的 redirect result / session 在跨網域儲存隔離下遺失，畫面又回到「使用 Google 登入」picker。

**已修正 `HTML資料庫/新勝GDP資料庫.html`：**
- `authStore.signInWithGoogle()` 的手機分支改用 `signInWithPopup()`。
- 移除手機登入時設定 `GOOGLE_REDIRECT_FLAG` 與呼叫 `signInWithRedirect()` 的路徑。
- 桌機仍使用 `signInWithPopup()`。
- 既有 `getRedirectResult()` 與 `GOOGLE_REDIRECT_FLAG` 清理保留，用於相容舊版 redirect 返回或使用者尚在舊流程中的狀態，不再由新的登入按鈕主動觸發。
- LINE / Android 的 `openExternalBrowser=1` 與 `intent://` 跳出外部瀏覽器邏輯未更動。

**本輪驗收：**
- `JS_PARSE_OK 1`
- `node verify_facts_ghpages.mjs`：`1296/1296`
- 靜態檢查：`signInWithRedirect` 已不在 HTML；`signInWithGoogle()` 手機分支命中 `signInWithPopup`。
- 內建 Browser 嘗試開 `file://` 與 `http://127.0.0.1:8787` 均被企業網路政策封鎖，因此本輪無法完成自動瀏覽器實測；需推送後由使用者用 Android 手機在 GitHub Pages 永久網址實機複測。

下次優先：① 請使用者用 Android 手機從 LINE 點連結 → 跳出外部瀏覽器 → 點 Google 登入實測。若 popup 被手機瀏覽器封鎖，先允許此網站彈出視窗再重試；若仍失敗，備案改自訂 authDomain / 同網域 auth handler。② EmailJS 三個值仍待使用者提供。

### 第122次本輪修正（手機登入修好＋審核通知）

使用者回報手機（從 LINE 點進）仍無法登入，並要求做「申請通知」。決策：登入交由本對話接手（方案 A，保留 Google），通知做「後台角標＋email」。

**手機登入真因與修法（`HTML資料庫/新勝GDP資料庫.html`）：**
- 真因：iOS LINE 使用者點「改用外部瀏覽器」時跑 `window.open(_blank)`，在 LINE 內只會再開一個 LINE 內分頁、跳不出去，Google 永遠擋。
- 修法（iOS）：iOS LINE 用官方參數 `openExternalBrowser=1`，`location.href` 過去 → LINE 用 Safari 重開本頁。
- 修法（Android，第二輪修正）：使用者回報 Android 仍失敗。原因 ① openExternalBrowser=1 在 Android LINE 頁內導頁不一定攔截跳出 ② 舊 `intent://` 帶了頁面 hash → 變成 `intent://...#xxx#Intent;...` 雙 # 壞網址、又硬指定 `com.android.chrome`。改為：Android 一律走乾淨 `intent://host/path?[openExternalBrowser=1]#Intent;scheme=https;action=android.intent.action.VIEW;end`（用 origin+pathname+search 去掉頁面 hash、不強制 Chrome 用系統預設瀏覽器）。
- **保證退路**：LINE picker 加「複製本頁網址」鈕＋手動提示（LINE 右上「⋯」→用其他瀏覽器開啟，或複製貼到 Chrome），自動跳出失敗也能登入。
- `detectMobileLoginRisk()` 新增 `isLine`；picker 在 LINE 內按鈕文字「跳出 LINE 用瀏覽器開啟並登入」、不顯示 Google 鈕。

**待審核角標（§38.2 後台角標）：**
- 頁首「管理面板」鈕加 `#adminPendingBadge` 紅色數字；`refreshPendingBadge()` 讀 `userApprovalStore.listPending()`，在 `updateChip()`（管理者登入時）與核准/退回後刷新；0 筆隱藏。
- 釐清：汪意華那筆申請本來就有成功寫入 Firestore，「沒收到通知」是因系統原本無通知機制，不是 bug。

**管理者 email 名單＋EmailJS 通知（§38.6，使用者裁示：管理者權限、名單只有超管能改、走 EmailJS 免 Blaze）：**
- Firestore `gdpConfig/access`（`{adminEmails:[...]}`）：超管在管理面板「管理者 email 名單（超管專用）」卡片新增/移除；登入時 `authStore.loadAccessConfig()` 載入到 `configuredAdminEmails`。
- 這份名單同時驅動：① **權限**——`isConfiguredAdminEmail()` 進 `canAdmin()`＋`gateState()` 的 `isPrivilegedEmail()`；首次登入由 `ensureConfiguredAdmin()` 自建 active+`gdp_admin`（沿用超管 bootstrap 模式）。② **通知收件人**——`getNotifyEmails()`＝超管 email∪configuredAdminEmails。
- `firestore.rules`：加 `isConfiguredAdminEmail()`（讀 `gdpConfig/access`）進 `isAdmin()`；`gdpUsers` create 加 `||(isSelf&&isConfiguredAdminEmail())` 自建分支；新增 `gdpConfig/{cfg}`（signedIn 可讀、isSuperAdminEmail 可寫）；**移除原 `/mail` 區塊**（改 EmailJS）。**已 deploy**。
- email 改走 **EmailJS（client-side、免 Blaze）**：`notifyAdminsOfApplication()` 用 `loadEmailJs()` 動態載 SDK→`emailjs.send()` 寄給 `getNotifyEmails()`；`EMAILJS_CONFIG` 三值留空＝略過不寄（不影響申請）。
- 起因：實測 Trigger Email 擴充需 Blaze，本專案 Spark→改 EmailJS。
- gate 回歸驗證（preview mock）：超管 ready/consent、員工 ready/profile/pending、configured-admin active→ready+canAdmin/未啟用→error/未同意→consent、一般員工不受影響，全部正確；JS_PARSE_OK 1、無 console error。

下次優先：① 使用者 LINE/Android 手機實機複測登入；② 使用者開 EmailJS 帳號給三個憑證值，我填入 `EMAILJS_CONFIG` 即可寄信；③ 超管在管理面板加管理者 email 實測權限與通知。

### 第121次本輪修正

使用者回報：手機依然無法登入。進一步檢查後確認，前一輪只補了「請改用 Chrome / Safari」提示，但登入核心仍是 `signInWithPopup`，這在手機正式瀏覽器也可能失敗。

本輪已修正 `HTML資料庫/新勝GDP資料庫.html`：

- `authStore.signInWithGoogle()` 改為：桌機維持 `signInWithPopup`；手機改走 `signInWithRedirect`。
- 新增 `GOOGLE_REDIRECT_FLAG` 與 redirect returning 狀態處理；頁面往返 Google 後，會清掉 redirect flag，避免使用者卡在不明狀態。
- `authStore._init()` 補 `getRedirectResult()`，若手機 redirect 返回失敗，會轉成可讀錯誤訊息，而不是只留在瀏覽器 console。
- 前一輪加入的手機提示卡保留，但定位改為輔助說明；真正解法是登入策略改為 mobile redirect，不再只靠提示。
- 若偵測為 `LINE` 等 App 內建瀏覽器，登入頁不再直接提供 Google 登入，而是先導向「改用外部瀏覽器開啟」，避免員工在 LINE 內反覆撞上 Google secure browser policy。

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
| 🔴 最高 | 手機登入真因＝signInWithRedirect session 遺失（下次帶使用者實機改＋測） | 第122次影片診斷（Android）：**LINE 跳出已成功**（使用者已進 Chrome、出現 Google 帳戶選擇頁、可選 tom741285）。真卡點在**選完帳號轉址回來後 session 沒建立，又被打回「使用 Google 登入」picker**（影格：帳戶選擇→「登入狀態確認中」→又回 picker）。屬 Firebase `signInWithRedirect` 在手機跨網域（github.io ↔ firebaseapp.com）儲存隔離把 redirect result 弄丟的已知問題；桌機 popup 不受影響。**下次開工：把手機分支從 `signInWithRedirect` 改 `signInWithPopup` 實測；若 popup 被擋，備案＝自訂 auth 網域/同網域 auth handler。一定要帶使用者用其 Android 手機實機驗證，勿盲推。** 影格暫存於 `%TEMP%\gdp_login_frames_暫存`。 |
| 最高 | EmailJS 設定（下次開工帶使用者一步步操作） | 已改走 EmailJS（免 Blaze）。前端 `EMAILJS_CONFIG={publicKey,serviceId,templateId}` 目前空字串＝不寄信（不影響申請）。**下次開工要帶使用者做這幾步並把值填回 `EMAILJS_CONFIG` 後 push：**<br>1. emailjs.com 開免費帳號。<br>2. Email Services 接一個服務（用 Gmail 即可）→ 取得 **Service ID**。<br>3. Email Templates 建一個模板：收件人欄填 `{{to_email}}`、主旨 `{{subject}}`、內文可用 `{{applicant_name}}`/`{{applicant_empid}}`/`{{applicant_department}}`/`{{applicant_title}}`/`{{applicant_email}}`/`{{message}}` → 取得 **Template ID**。<br>4. Account → API Keys/General 取得 **Public Key**。<br>5. Account → Security 把 allowed origin 限 `https://n1116839.github.io`（防盜用額度）。<br>三個值給 Claude 填入 `EMAILJS_CONFIG`。計費按 send() 次數（非收件人數），一次寄全部管理者＝1 封，免費 200/月足夠。收件人＝超管 email∪超管在面板設定的管理者 email。 |
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

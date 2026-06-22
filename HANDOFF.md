# 新勝 GDP 專案交接（精簡版）

> 最新補記：2026-06-22（第132次：**管理面板新增「同意書／審核紀錄查詢」頁 ✅＋確認在職員工權限面板線上實測通過**）。
> 第132次（commit `2758fd8`，永久網址已驗收上線）：① 使用者用截圖確認第126次新增的「在職員工權限管理」常駐面板線上正常（部門樹、超管鎖定、職務×平台權限矩陣、儲存/停用鈕齊全）→ **🔴「待測」項目結案**。② 依使用者指定開始做「同意書／審核紀錄查詢」頁：在 `HTML資料庫/新勝GDP資料庫.html` 管理面板「在職員工權限管理」下方新增常駐可收合區塊，**純前端唯讀、零 rules 變動**（`gdpConsentLogs`/`gdpRoleChangeLogs`/`gdpAuditLogs` 三 collection 的 `read` 規則本來就 `isAdmin()`，已核對 firestore.rules 第72/90/94 行）。新增 `auditLogStore`（`consentLogs/roleChangeLogs/auditLogs`，各 `createdAt` 單欄 orderBy desc limit 100、免複合索引、錯誤回 null 區分「失敗」與「無紀錄」）；UI 三分頁切換（同意書紀錄＝時間/工號/姓名/決定[同意綠·不同意紅]/版本/Email；角色異動＝時間/對象/原因/異動前後[角色中文標籤+狀態]/操作者；其他稽核＝時間/動作/對象/備註/操作者）；用獨立 `.auditlog-*` class 避開既有部門頁 `.audit-*`；`bindAdminConsole` 加 `auditLogDetails` toggle 展開時載入。驗收：`JS_PARSE_OK 1`、`verify_facts 1296/1296`、preview 模擬管理者＋樣本資料三分頁/表頭/標色/前後角色標籤/空清單/讀取失敗訊息全正確、console 無 error。③ **測試帳號 `n1116839@ntub.edu.tw`**：使用者要求刪除。本 session 無 Firebase admin 工具、且 `gdpUsers` rules 無 `allow delete`（前端無法刪）→ 建議使用者自行在 Firebase Console 刪 `gdpUsers` doc＋Authentication 使用者（方式 A）；若日後要面板常態刪帳號需另加 `allow delete:if isAdmin()`＋刪除鈕（方式 C，未做）。**下次待辦**：page③依職稱過濾各部門內容｜帳號審核擴充（晉升/降職/離職/兼任）｜測驗正式題庫｜（可選）面板刪除帳號功能。）

> 第131次補記：2026-06-17（第131次：**EmailJS 帳號申請通知信設定完成並實測成功 ✅**。帶使用者一步步在 emailjs.com 完成：①Gmail 服務（Service ID `service_xyhyvcq`，已連 `tom741285@gmail.com`、測試信收到）②信件範本（Template ID `template_bk3op8r`；主旨 `{{subject}}`、收件人 `{{to_email}}`、回覆 `{{applicant_email}}`、內文用 `{{applicant_name/empid/department/title/email}}`+`{{message}}`，對應 `notifyAdminsOfApplication` 送出的變數）③Public Key `kflw9_lWXjPPtStjF`。三值填入 `HTML資料庫/新勝GDP資料庫.html` 的 `EMAILJS_CONFIG`（約 1818 行）。驗收 `JS_PARSE_OK 1`、`verify_facts 1296/1296`、永久網址子路徑確認三值已上線；**使用者無痕模式申請帳號→超管信箱實收通知信**，端到端成功。收件人＝`getNotifyEmails()`＝超管 email ∪ 管理者 email 名單。commit `475f38e`。**另澄清使用者疑問「停用員工後怎麼重新開啟」**：非 bug，功能已存在——被停用者仍留在「在職員工權限管理」清單（`renderActiveUserList` filter 含 `status==="suspended"`，約 6548 行），顯示紅字「已停用」，按鈕由「停用帳號」變綠色「重新啟用」，按下即恢復；唯一例外是 email 在管理者名單者登入會被 `ensureConfiguredAdmin` 自動重啟用，需先移除其管理者 email。待辦：建議使用者在 EmailJS 後台「帳號/安全」把 Allowed Origins 設為 `https://n1116839.github.io` 防盜用額度（可選）。**另依使用者要求建立私人懶人包 repo `N1116839/xinshing-gdp-admin-guides`（PRIVATE），收錄本次 EmailJS 完整設定步驟＋停用/重新啟用＋管理者 email 名單操作，供日後維護查閱；後續管理操作懶人包都放這個 repo，不塞進公開的主專案。**）

> 第130次補記：2026-06-17（第130次：**115年度訓練資料三邊核對（純核對、未改任何檔）**。使用者要求核對本機兩份 Word（`Z:\倉管\GDP 新勝表格(完成)\第二章\員工教育訓練\訓練表\115年\FR22-02 職責【職前】訓練對照表.docx`、`FR24-01 年度訓練計畫表.docx`）與「SMF 第參·人事各職稱訓練評鑑」（`第一章品質管理\WI10-01 SMF廠商基本資料.docx`）及「網站受測範圍」是否一致。結論：**各職稱 DP 範圍三邊完全相同**（管理藥師 DP15/64/65、品管 DP12-02/03/04+34-02+35-01+36-01+82-01、業務 DP53/62/63、人事 DP22/24、文管 DP42-01/02、倉管＝倉庫組長 DP25-01/02+32/33/34-01+55/56/57、採購 DP52/54/72，GDP權責主管 DM10-01+DP12-01+DP14-01）。唯一差異即使用者預期的：**DM10-01 與 WI10-01(SMF) 在網站是全員共同基礎（聯集只計一次，HTML 1467 行）**，而 FR22-02／SMF人事 只把 DM10-01 掛在 GDP權責主管、WI10-01 不列為職前訓練項目。**已知可接受差異一項（使用者裁示不補）**：網站內部測驗只有 7 份職務試卷（管理藥師/品管/業務/人事/文管/倉管/採購），**無 GDP權責主管獨立試卷**，故其 DP12-01／DP14-01 不在網站內部受測範圍——但 GDP權責＋管理藥師那批走的是 FR24-01 的「外部教育訓練＋筆試（10/17）」，非內部測驗，屬合理。本輪無程式碼變更。**）

> 第129次補記：2026-06-17（第129次：**032 智慧問答兩個 bug 修正**。使用者回報：① 倉管問人事的問題，應顯示「非該部門」提示而非錯答案；② 問「合格分數幾分」顯示無關的「4Q 確效」答案，但超管問同樣問題會顯示正確答案。根因查清：(a) 智慧查詢中文被切成 2 字滑動詞，「合格」誤命中確效 fact 的關鍵字「合格設備」，讓與分數無關的確效 4Q 拿到 strongHit 分數浮上來（連超管也中，top5 並列 52）；(b) codex 第128次的 `canSeeKbDoc` 把跨部門 fact 濾掉後沒有「非該部門」出口，反而掉到同範圍弱匹配錯答案。已修 `HTML資料庫/新勝GDP資料庫.html`：① `kbStore.search` 改成對全 KB 算分、評分後才做可見性過濾，並以「最佳 fact vs 最佳可見 fact」判斷——若最佳強匹配 fact 落在其他部門且無可比的可見 fact，回 `{outOfScope:true,depts}`，`kbResultsHtml` 顯示「這個問題屬於『XX』的權責範圍…」（新增 `deptIdLabel` id→中文）。② 加分數類查詢守則：問合格分數/及格時，body/keyword 不含「分/及格」的 fact 一律 score=0，消除確效誤匹配（「設備確效怎麼做」仍正確回確效）。③ 依使用者裁示「DM10-01 品質手冊＋SMF＝全員共同知識」，把 5 筆被誤標單一部門的全公司共同 fact 改 `departments:["*"]`：教育訓練合格標準(70分)、教育訓練頻率、職前訓練評量、品質政策目標(DM10-01)、PDCA(DM10-01)。各「職責」fact、人事職責、外部訓練、訓練紀錄保存維持原部門。驗收：`verify_facts 1296/1296`、`JS_PARSE_OK 1`、preview 模擬 032＋超管全部正確、無 console error。032：合格分數→教育訓練合格標準70分(正確)；人事/採購/委外/變更管制→非該部門；倉庫盤點/溫度/設備確效→正常。**）

> 第128次補記：2026-06-17（**032 倉管帳號前台可見範圍修正**。使用者回報 032 身為倉管人員仍可看到採購、文管等範圍；根因不是管理面板矩陣列出所有可指派角色，而是 §44.5/§48.7 的 `departments/allowedRoles` 標籤尚未接到真正的前台 chokepoint。已修 `HTML資料庫/新勝GDP資料庫.html`：新增 `visibilityContext/canShowSection/canSeeKbDoc`，登入後導覽、`showSection()`、智慧查詢資料來源與快速查詢按鈕都依角色/部門過濾。032 即使 Firestore roles 暫仍為 `staff`，也會依部門「倉庫」與職稱「倉管人員」推得 warehouse 範圍：只顯示品質手冊、SMF、倉管、GDP 智慧查詢、測試專區；不顯示各部門分類、採購、文管、品保、行事曆、管理面板。倉管智慧查詢只回倉管/共同範圍；採購問題不回採購答案。管理面板在職員工矩陣也會對 staff-only 但部門/職稱明確者預勾推得職務，032 會預勾「倉管」，按儲存後才正式寫入 Firestore roles。驗收：`JS_PARSE_OK 1`、`verify_facts_ghpages.mjs 1296/1296`、本機 032 權限模擬通過。**

> 最後更新：2026-06-17（第127次：**權限管理需求重新沉澱與模型修正完成**。使用者明確不滿意前幾輪未把反饋寫入交接；本輪已把「職務角色 ≠ 平台管理者」與「左側固定部門員工樹」寫入 `GDP_智慧查詢規範.md` §48、`HANDOFF.md` 與第二大腦，並修正 HTML 管理面板。）

### 第127次（權限管理模型修正：職務角色與平台管理權限分離）✅

使用者再次明確指出：目前公司人員現況是 GDP權責人＝總經理、業務組長＝經理、採購目前由業務組長兼任、品保＝經理、文管＝031（開發者）、另有倉庫組長、倉管、會計/人事。現況中品保、業務組長、GDP權責人應為網站平台管理者，031 為文管與開發者超管。但這不能寫成永久死規則，因為未來可能有新採購、新業助、採購兼業助、或新任品保但不是平台管理者。

本輪已確定的需求（不可再漏）：
- **職務/部門角色與平台管理者權限分離**：品保、業務組長、GDP權責人、倉庫組長、採購、業助等只代表工作範圍；是否可審核帳號/進管理面板需另授予 `gdp_admin`。
- **目前人員可同時勾職務＋平台管理者**：例如目前品保可勾「品保」＋「平台管理者」；目前業務組長可勾「業務組長」＋「採購」＋「平台管理者」；目前 GDP權責人可勾「GDP權責人」＋「平台管理者」。
- **未來同職稱新人不自動成為管理者**：例如新進品保只勾「品保」即可，不得因職稱叫品保就自動有帳號審核權。
- **左側固定部門員工樹**：待審核與在職員工管理都要有左側部門樹。032 申請倉管就出現在「倉管」下；新採購就出現在「採購」下；業助、新採購兼業助、採購/業助拆成兩人都要能呈現。
- **目前權限表舊問題**：前一版把 `qa_admin/rp_admin/sales_lead/warehouse_lead` 等職務型 role 直接當 `isAdmin()`，導致「職稱＝平台管理者」太死；且品保未清楚呈現可審核帳號的權限，與使用者需求不符。

本輪已修改方向：
- `HTML資料庫/新勝GDP資料庫.html`：新增職務角色 `role_rp/role_qa/role_sales_lead/role_purchase/role_sales_assistant/role_warehouse_*...`，並把 `gdp_admin` 改成獨立「平台管理者（可審核帳號）」。
- 待審核與在職員工 UI 改為左側固定部門樹＋右側「職務／平台權限」表。
- `Firebase設定/firestore.rules` 加註過渡相容：新核准只用 `gdp_admin/doc_superadmin`；舊 `rp_admin/qa_admin/sales_lead/warehouse_lead` 暫時仍放行，避免既有管理者尚未正規化前被鎖出。待所有舊 profile 重存成新 roles 後，再移除 legacy 放行。
- `GDP_智慧查詢規範.md` §48 已寫入上述需求，避免下輪 agent 漏接。

⚠️ 本輪尚未收工前不可視為已部署。若修改 rules，需驗收後明確部署 Firestore rules，並用線上 rules 比對確認生效。

本輪驗收：
- `JS_PARSE_OK 1`
- `node verify_facts_ghpages.mjs`：`1296/1296`
- 函式級檢查通過：032 倉管→倉管、申請採購→採購、採購兼業助→業助且具採購＋業助角色、品保/業務組長不自動取得 `gdp_admin`。
- Node REPL/Playwright 被 Windows sandbox 擋住（`CreateProcessWithLogonW failed: 267`），本輪未完成瀏覽器截圖驗收；需推送後用永久網址人工實測管理面板。

部署注意：
- 本輪 HTML 需 commit + push 才會上 GitHub Pages。
- `firestore.rules` 只新增 legacy 過渡相容註解，未改線上 rules 行為；除非後續真的移除 legacy 放行，否則本輪不需要部署 Firestore rules。

### 第126次（登入真根因＝線上 rules 被別專案覆蓋；已修復＋管理面板兩項調整）✅

**🎯 登入 permission-denied 真根因（推翻第119~125次所有假設）**：使用者參考「codex b28bd8b 改 popup」的做法要求修登入。先比對 b28bd8b 與 HEAD，發現登入邏輯只多了上輪猜測的 `await user.getIdToken(true)`（移除回到乾淨 popup）。移除後仍 `permission-denied`，且**桌機也一樣失敗**。加暫時診斷印出 token claims → 證實 `token.email=tom741285@gmail.com、verified=true、provider=google.com` **完全正確**，徹底排除 token/手機/快取。

接著用 **Firebase MCP `firebase_get_security_rules` 抓線上實際生效的 rules**，發現線上是**別的專案（wordcloud 文字雲 App）的 rules**：`match /wordcloud_words` 放行、`match /{document=**} allow read,write:if false` 把所有 GDP 寫入全擋 → 超管 bootstrap 寫 `gdpUsers` 必然 permission-denied。**過去幾輪「rules 部署成功」其實沒真的落到這個專案、或事後被 wordcloud 蓋掉**，所以重部署也沒用。修法：從 `Firebase設定/`（`.firebaserc`/`firebase.json` 都正確指向 `xinshing-gdp-training-20260525`）重新 `npx firebase-tools deploy --only firestore:rules`，**再用 MCP 抓線上 rules 確認已換成 GDP 版本**（逐字相同）。使用者實機登入成功 ✅。暫時診斷碼已移除。

**🧹 移除 AI 助手殘留文字**：section 標題「管理面板與 AI 助手」→「管理面板」；tag/lead/pills 移除「AI 變更草稿／修改前後對照／核准退回草稿」用語；登入資料卡「核准與退回管理草稿」改為帳號審核/權限管理描述。

**🔧 新增「在職員工權限管理」常駐面板**：管理面板加常駐可收合（`<details>`）區塊，列出所有 active/suspended 員工，可隨時改角色或停用/重新啟用，不需等到有新申請（解第125次「權限矩陣只在有待審核帳號時才出現」的設計缺口）。超管在清單中被鎖定不可操作。`userApprovalStore` 新增 `listUsers/setRoles/setStatus`，變更寫 `gdpRoleChangeLogs`。**零 rules 變動**（gdpUsers read/update 對 isAdmin 已放行）。
- ⚠️ 限制：停用＝設 status 非 active；但若該員工 email 在「管理者 email 名單」內，登入時 `ensureConfiguredAdmin` 會自動把他重新啟用。要真正封鎖「管理者」需先從 email 名單移除再停用；一般員工停用即生效。

**本輪驗收**：`JS_PARSE_OK 1`、`verify_facts 1296/1296`；preview mock 超管渲染管理面板——新面板/超管鎖定/「待審核新帳號」標題/無 AI 殘留文字/activeUserCard 正常員工有停用鈕、超管卡鎖定，全部正確、無 runtime error。線上 rules 已用 MCP 確認為 GDP 版本。

**下次優先**：① 使用者線上實測「在職員工權限管理」面板實際改角色/停用是否正常寫入（localhost 無法測 Firestore 授權）。② EmailJS 三值仍待提供。③ 管理面板「同意書／審核紀錄查詢」頁。

### 第125次續（手機登入 permission-denied，已下修法但未驗證成功，收工時仍是「無法登入」狀態）

使用者在今天移除 AI 管理助理＋修手機版面之後，回報手機又無法登入，畫面顯示「超管帳號初始化失敗，請確認 Firestore rules 已部署，或登出後重新登入。」

**先排除回歸**：用 `git diff b28bd8b HEAD -- 兩個檔` 逐字比對，確認 `ensureSuperAdmin` 函式與 `gdpUsers`/`isAdmin` rules 跟上次能登入的版本**完全相同（byte-identical）**，今天唯一動到的 rules 差異是刪掉不相關的 `gdpChangeDrafts`。確認不是今天改動造成回歸。

**問出真正錯誤代碼**：原本畫面文字是寫死的，不管實際錯誤都顯示同一句。先把 `e.code`/`e.message` 顯示進錯誤訊息（commit `de0df08`），請使用者重試，拿到真正代碼是 **`permission-denied`**——確認是真的權限被拒，不是網路/快取問題（使用者已用無痕模式排除快取）。

**目前的假設與已下的修法（commit `92d7875`，尚未驗證生效）**：`isSuperAdminEmail()` rules 比對的是**請求 ID token 裡的 email claim**，跟瀏覽器本機 `user.email` 是兩份不同資料。手機剛用 `signInWithPopup` 登入完成瞬間，本機 `user` 物件已更新，但送往 Firestore 的 ID token 可能還沒刷新到含正確 email claim 的版本，導致 rules 判定不符 → `permission-denied`。手機比桌機更容易踩到這個時間差。已在 `onAuthStateChanged` 偵測到登入後，加 `await user.getIdToken(true)` 強制刷新 token，確保後續 `loadProfile`/`ensureSuperAdmin`/`ensureConfiguredAdmin` 的 Firestore 請求都帶最新 claim。

**⚠️ 收工時這個修法還沒被使用者實機驗證**，使用者本輪選擇先收工、尚未回報重試結果。**下次開工第一件事：請使用者用手機（無痕模式）重新整理永久網址、重新登入一次，確認是否解決。如果還失敗，這次錯誤訊息裡會帶真正的 `e.code`，直接看那個代碼縮小範圍，不要再重複猜測 popup/redirect/rules 部署這些已經排除過的方向。**

### 第125次本輪修正（取消 AI 管理助理＋修手機版管理面板版面）

使用者實機測試後回報兩個問題：① 手機版管理面板仍擠在左邊、沒有滿版 ② 質疑「AI 管理助理」核准後是否真的會自動改網站、誰來維護的問題。討論後使用者決定：AI agent 自動改網站這個想法**目前不可行就先取消整個入口**，不要留一半做不到的功能困惑管理者；其餘想法（即時查資料、權限矩陣常駐畫面）留待之後評估，今天不做。

**已修正 `HTML資料庫/新勝GDP資料庫.html`：**
- 用 preview_eval 量出手機版 bug 根因：`.admin-section{grid-column:1/-1}`（CSS 第221行附近）想讓管理區塊在巢狀 `.admin-layout` grid 裡滿版，但同特異度（單 class）、程式碼順序更晚的 `.wide{grid-column:span 12}`（在 `@media max-width:960px` 區塊內）蓋掉了它，造成隱性展開成12欄、大部分0寬，視覺上整塊被擠到最左邊一小條。修法：加 `.wide.admin-section{grid-column:1/-1}` 用雙 class 特異度蓋過去。已用 preview_eval 量測 `gridTemplateColumns` 確認修好（347px 單欄、子區塊 `gridColumn:1/-1` 滿版347px）。
- 完全移除「AI 管理助理」整個 UI 區塊（自然語言輸入框、前後對照預覽、核准/退回按鈕、處理流程說明、邊界聲明）與「近期草稿」區塊。
- 移除相關死代碼：`adminDraftStore`、`inferAdminRequestType`、`inferTargetFromRequest`、`inferChangeDraft`、`changeRows`、`renderChangePreview`、`renderAdminDraftList`，以及 `bindAdminConsole` 裡對應的表單/按鈕綁定與 `activeAdminDraft` 變數。
- `Firebase設定/firestore.rules` 移除 `gdpChangeDrafts` collection 規則，**已 `npx firebase-tools deploy --only firestore:rules` 部署成功**。
- 「帳號與權限設定」（待審核員工樹＋角色×功能權限矩陣）保留不變；釐清矩陣**目前只在有待審核帳號時顯示**（綁在 `permissionMatrixForApp`），公司全員都已審核完畢時不會出現，這是設計缺口非 bug——下輪若要做「ERP 風格、隨時可開的在職員工權限管理」需另外加一個常駐區塊（讀 active 員工清單，非僅 pending）。

**本輪驗收：**
- `JS_PARSE_OK 1`
- `node verify_facts_ghpages.mjs`：`1296/1296`
- grep 確認 `adminDraftStore`、`adminAssistantForm`、`gdpChangeDrafts` 等字串已從 HTML/rules 完全清除，無殘留死代碼
- preview_eval 模擬 admin 登入直接渲染 `adminConsoleSection()+bindAdminConsole()` 無報錯，DOM 確認無「AI 管理助理」文字、權限矩陣表格正常出現、`.admin-section` 數量符合預期（1：帳號與權限設定；超管才會多一個管理者email名單）

下次優先：① 若使用者要做「在職員工權限管理」常駐畫面，需新增讀取 active 員工清單的函式（目前只有 listPending）。② Android 手機 Google 登入仍需實機複測。③ EmailJS 三值仍待使用者提供。
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
  - `gdpAuditLogs`
  - `gdpRoleChangeLogs`
  - `gdpConsentLogs`
  - `gdpConfig`（管理者 email 名單）
  - （`gdpChangeDrafts` 已於第125次隨 AI 管理助理功能一併移除並 deploy）
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
| ✅ 已解決 | ~~手機登入卡 permission-denied~~（第126次修復，使用者實機登入成功） | 真根因＝線上 Firestore rules 被別專案（wordcloud）的 rules 覆蓋，所有 GDP 寫入被 `allow read,write:if false` 擋。重新從 `Firebase設定/` 部署正確 GDP rules 並用 MCP 抓線上 rules 確認生效後解決。跟 token/手機/快取/popup 全無關。 |
| ✅ 已完成 | ~~「在職員工權限管理」常駐面板線上實測~~（第132次使用者截圖確認） | 部門樹、超管鎖定、職務×平台權限矩陣、儲存/停用鈕均正常。 |
| ✅ 已完成 | ~~管理面板加「同意書／審核紀錄查詢」頁~~（第132次完成） | 純前端唯讀、零 rules 變動；讀 `gdpConsentLogs`/`gdpRoleChangeLogs`/`gdpAuditLogs`，三分頁切換。本機驗收通過，待永久網址複測。 |
| ✅ 已完成 | ~~EmailJS 設定~~（第131次完成並實測成功） | 三值已填入 `EMAILJS_CONFIG`（`service_xyhyvcq`/`template_bk3op8r`/`kflw9_lWXjPPtStjF`）、commit `475f38e` 已上線；使用者無痕申請→超管實收通知信，端到端成功。剩可選項：EmailJS 後台「帳號/安全」設 Allowed Origins=`https://n1116839.github.io` 防盜用額度。 |
| 最高 | 線上登入實測 | 已重新部署 Firestore rules；請用 Chrome/無痕重新登入，若仍錯需抓 browser console `permission-denied` 細節與 `gdpUsers/{uid}` 狀態。 |
| 高 | 權限管理畫面完成度盤點 | 使用者回報「沒有權限管理的畫面」；需先分清是未登入導致看不到，還是管理面板功能尚未補齊，再決定補 UI 或補角色顯示說明。 |
| ✅ 第132次完成 | ~~管理面板加「同意書／審核紀錄查詢」頁~~ | 讀 `gdpConsentLogs`、`gdpRoleChangeLogs`、`gdpAuditLogs`；限管理者；純前端唯讀免改 rules。 |
| 中 | （可選）面板「刪除帳號」功能 | 需加 `gdpUsers` rules `allow delete:if isAdmin()`＋刪除鈕＋部署；目前刪測試帳號走 Firebase Console。 |
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

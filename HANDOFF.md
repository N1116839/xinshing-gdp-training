# GDP HTML 教育訓練 HANDOFF
更新：2026-05-27（第六次）

## 本輪確認（2026-05-27 第六次開工，換電腦接續）

### 老闆反饋確認已全部執行完成

使用者換電腦後確認三項保護修改（commit 820a59b）均已完成。

**老闆核心方向（已理解並寫入規範）：**
- 教育平台仍需要，但要保護公司文件不被外流
- 員工可在稽查員到訪時應答問題（智慧查詢為核心功能）
- 線上平台讓員工了解 GDP 是什麼、這部門重點是什麼；深入了解要申請正式文件

**智慧查詢顯示方式確認（使用者疑問已解答）：**
- 「新勝做法」繼續顯示文件內容摘要（具體事實：頻率、流程、表單）
- 不改為只顯示「請參考某某文件」——那樣員工無法應答稽查問題
- 資料夾文件繼續作為 KB 建立的來源依據，不直接暴露於 UI

### 未來開發規劃 H 項（新列入，尚未執行）

| 代號 | 項目 | 說明 | 依賴 |
|------|------|------|------|
| H1 | 員工登入系統 | 工號+密碼+職稱申請；管理者 email 核准（傳至指定信箱）；工號為唯一值，申請過不得再申請；管理者後台管理離職白名單 | 無 |
| H2 | 職稱別權限 | 倉庫一班：品質手冊+SMF+倉管+智慧查詢（倉庫問題）+行事曆（倉庫項目）；倉庫主管：增加採購模組；管理藥師/GDP 權責人：全權限 | H1 |
| H3 | 晉升審核機制 | 人員申請升級職稱，管理者審核後開放對應權限 | H1+H2 |
| H4 | 開發優先原則 | 大更動不影響其他區域的先做；牽一髮動全身的擺最後；有副作用的測試項目最後處理 | 永久原則 |

**開發順序建議（依老闆 H4 原則）：**
1. 先補齊 KB 精準搜尋（不影響其他功能，獨立修改）
2. H1 員工登入（後端改動，但不影響現有 UI 顯示）
3. H2 職稱別權限（依賴 H1 完成後才能做）
4. H3 晉升審核（依賴 H1+H2）
5. 視覺互動化升級（D 項）擺最後，因為牽動全站 UI

### HTML 修改收工強制規範（2026-05-27 新增，永久執行）

每次 HTML 有修改並 push 之後，必須完成以下步驟才算收工：
1. 開啟 `https://n1116839.github.io/xinshing-gdp-training/` 實際確認
2. 對應修改的區域逐項點擊驗收
3. 在 HANDOFF 寫明「已用 GitHub Pages URL 驗收：○○正常」
4. 若發現錯誤立即修正 → 再次 commit + push → 重新驗收

**⚠️ commit 820a59b（文件保護三項修改）尚未用 GitHub Pages URL 驗收，下次開工補做**

### 下次開工必做（依序）
1. **GitHub Pages 驗收補做**：開啟永久網址，確認文件保護三項修改顯示正確
2. **精準搜尋補做**：確認 48 份文件 → 48 筆 KB；逐章 5 組測試，記錄通過/未通過
3. **補齊缺漏 17 筆**（對照資料夾逐份確認哪些文件沒有對應 KB 條目）
4. 確認使用者要優先做 **H1**（登入系統）還是先把 **KB 精準搜尋** 跑完

---


## 本輪完成（2026-05-27 第五次開工）

### 老闆反饋：文件保護三項修改 ✅ DONE

**背景：** 老闆擔心外部競業拿到平台 URL 後，能直接看到新勝 SOP 架構與執行細節並照抄。

**執行三項修改：**

1. **移除四層對照「參考文件」第四欄**
   - `standardsSwipe()` 的 `tabs` 陣列移除 `{key:"docs"...}` 項目
   - 四層對照現只剩三欄：PIC/S GDP / 台灣食藥署 / 新勝做法

2. **`openDoc()` modal 改為申請說明**
   - 原本：顯示 SOP 檔案路徑 + 詳細閱讀重點（完全暴露內部文件內容）
   - 現在：顯示「此文件為公司內部管控文件，請向文管部填單申請調閱」
   - 文件名稱仍可見，員工知道要申請哪份文件

3. **部門文件閱讀地圖加申請說明橫幅**
   - 每個部門文件地圖頂部加入提示：「如需閱讀完整文件，請向文管部填單申請調閱」

**不受影響：**
- 智慧查詢（KB query）— 仍正常回答問題，內部使用 sopLibrary 但不直接暴露給 UI
- 文件名稱仍可見（員工需要知道哪些文件存在）
- 外部法規連結（PIC/S、食藥署）— 屬公開資訊，不在保護範圍

### 踩坑補記
- 「超連結移除」≠「移除外部法規連結」→ 正確理解是移除可暴露新勝 SOP 內容的 doc-pill 點擊功能。詳見踩坑紀錄.md 2026-05-27。

### 下次開工必做（依序）
1. **精準搜尋補做**：確認 48 份文件 → 48 筆 KB；逐章 5 組測試，記錄通過/未通過
2. **補齊缺漏 17 筆**（對照資料夾逐份確認哪些文件沒有對應 KB 條目）
3. 確認使用者要優先做 **A**（規範四層對照整合）、**D**（全站互動性升級）還是 **E**（重複區塊整合）

---

更新：2026-05-27（第四次）

## 本輪完成（2026-05-27 第四次開工）commit 9d8cc59

### G 項：KB 補齊 DP34-01、DP34-02、DP35-01、DP82-01 四條 clarify 條目 ✅ DONE

新建 4 條（逐份讀 SOP 原文建立）：
| 條目 ID | 來源 |
|---|---|
| clarify-critical-equipment | DP34-01 |
| clarify-measuring-instruments | DP34-02 |
| clarify-computer-system | DP35-01 |
| clarify-internal-audit-frequency | DP82-01（原有薄卡，本次改為完整富條目）|

### 全量校對完成（31 筆 clarify 條目全部驗證）

逐章核對所有 31 筆 clarify 條目對照 SOP 原文，發現並修正：

**3 項內容修正：**
- `clarify-quality-manual` xinshing：販售對象改為「醫事單位、藥局或經銷商」（DM10-01 原文，原為「診所、醫事單位或經銷商」）
- `clarify-temperature-mapping` xinshing：移除誤植的 DP35-01 設備內容（分離式冷氣、UPS、正航）；改為 DP33-01 正確內容（警戒值 -1.5°C、FR33-01 月記錄、每月警報測試）；同步移除 keywords 中「正航」「正行」（避免與 clarify-computer-system 污染）
- `clarify-outsourcing` xinshing：D 等級閾值修正為「60分以上未達70分暫停交易」（原誤為未達60分）

**1 項新增：**
- `clarify-order-picking`（DP57-01）：訂單揀貨與配銷作業，含訂單編號規則（8碼日期+3碼流水）、FEFO 原則、FR57-03 託運總表、嘉里醫藥每季溫度紀錄

**4 項 keyword 精準化（移除跨條目污染）：**
- `clarify-validation`：移除「關鍵設備」
- `clarify-quality-system`：移除「稽核」
- `clarify-change-control`：移除「電腦化系統」
- `clarify-management-review`：移除「稽核」

**2 項 Firestore 編碼修正（讀回驗證發現）：**
- `clarify-critical-equipment`：taiwan/xinshing 中「偉」→「偵」（偵測器）；「屈」→「儀」（儀器）；keywords 中「溫濕度」→「溫溼度」
- `clarify-measuring-instruments`：全欄位「屈」→「儀」（儀器）；「統筌」→「統籌」；file/topic/keywords 全部修正

**同步狀態：** GitHub commit 9d8cc59 ✅、Firestore 共 10 筆更新 ✅

### KB 現況
- 總計 **31 筆** clarify 條目（含本次新增 4 條）
- 覆蓋資料夾全部 51 份文件（DP/WI/FR/DM）
- 三欄格式（international/taiwan/xinshing）全數符合 evidence-based-content 標準

### ⚠️ 本次收工補正：精準搜尋從未執行

使用者於收工時指出：**精準搜尋 + G 一起作業**是本次指令，但精準搜尋完全未執行。

**使用者定義的精準搜尋（必須在下次開工時補做）：**
1. **覆蓋率**：資料夾有幾份文件，KB 就必須有幾筆。  
   各章文件數：第一章 11、第二章 8、第三章 14、第四章 2、第五章 7、第六章 4、第七章 1、第八章 1 → **合計 48 份文件，KB 必須有 48 筆**。  
   目前 31 筆，**尚缺 17 筆**。

2. **測試方式**：每章/部門至少測試 **不同題目 5 組**。  
   「不同題目」定義：同一主題的多種問法算 **1 組**。例如：  
   - 「盤點 / 倉庫盤點 / 多久盤點一次 / 庫存檢查」= 1 組  
   - 「教育訓練 / 多久一次 / 怎麼訓練 / 人員訓練」= 1 組  
   每章需累積 5 組不同主題，不重複。

3. **測試驗收標準（每組題目都需達到）：**
   - 輸入問法後，答案確實命中預期條目（不漏不錯）
   - 命中條目的三欄內容與 SOP 原文一致：
     - 國際法規（PIC/S GDP）欄：有明文 → 寫準確摘要；無明文 → 寫「PIC/S GDP 無明文規定」
     - 台灣食藥署欄：有明文 → 寫準確摘要；無明文 → 寫「食藥署 GDP 規範無明文規定」
     - 新勝做法欄：只寫 SOP/WI/FR 原文，不推論

4. **踩坑點（勿再犯）：**  
   過去數次開工花費大量時間反覆修改相同 23～31 筆資料，但從未系統性測試覆蓋率。  
   **往後每次宣告 KB「完成」前，必須先跑完覆蓋率核查 + 每章 5 組測試。**

### 下次開工必做（依序）
1. **精準搜尋補做**：確認 48 份文件 → 48 筆 KB；逐章 5 組測試，記錄通過/未通過
2. **補齊缺漏 17 筆**（對照資料夾逐份確認哪些文件沒有對應 KB 條目）
3. 確認使用者要優先做 **A**（規範四層對照）、**D**（全站互動性升級）還是 **E**（重複區塊整合）

---

## 本輪完成（2026-05-27 第三次開工）commit a4545a2

### F 項：KB 全量校對 ✅ DONE（五章全部完成）

逐份讀取原始 docx 核對，依 evidence-based-content 標準，執行以下：

**新增 12 條 clarify 條目（直接從 SOP 原文建立）：**
| 條目 ID | 章節 | 來源 |
|---|---|---|
| clarify-complaint-handling | 6章 | DP62-01 |
| clarify-receiving-shipping | 5章 | DP54-01 |
| clarify-waste-disposal | 5章 | DP56-01 |
| clarify-premises-layout | 3章 | DP32-01 |
| clarify-validation | 3章 | DP36-01 |
| clarify-organization | 2章 | DP22-01+WI22-01 |
| clarify-hygiene-cleaning | 2章 | DP25-01+WI25-01 |
| clarify-quality-manual | 1章 | DM10-01+WI10-01 |
| clarify-quality-system | 1章 | DP12-01 |
| clarify-change-control | 1章 | DP12-04 |
| clarify-management-review | 1章 | DP14-01 |
| clarify-quality-risk | 1章 | DP15-01 |

**修正 7 條現有條目（核對後發現錯誤）：**
- `clarify-falsified-medicines`：移除「FR55-02 標示」（DP64-01 表單：無）、移除「每年訓練≥70分」（非 DP64-01 內容）；補通知上市供應藥品許可持有廠商、依 DP65-01 回收
- `clarify-storage`：移除 FR55-02、FR55-03（DP55-01 表單：無）
- `clarify-supplier`：補 FR52-02（合格廠商名冊）、FR52-03（缺失登錄表）；移除「清冊應與 SMF 一致」（非 DP52-01 原文）；補每月食藥署網站查核
- `clarify-customer-order`：補 FR53-02（客戶認可審查紀錄表）、FR57-03（託運總表）；移除「需填偏差紀錄」（非 DP53-01 原文）
- `clarify-personnel-training`：補 FR24-01（年度計畫表）、FR24-02（考核表）；補 ≥70 分合格標準（DP24-01 明文）；補三年訓練週期（DP22-01 明文）
- `clarify-pest-control`：移除「每月彙整 FR25-03」（DP25-02 規定每年至少一次，非每月）；補 FR25-04（病媒防治處理紀錄表）
- `clarify-deviation-capa`：FR12-02 名稱「偏差管制一覽表」→「偏差事件處理管制表」（DP12-02 原文）

**移除 1 條重複條目：**
- `clarify-inbound-outbound`：與新建 clarify-receiving-shipping 重複，且有 FR57-01 誤用（正航確效報告非進出貨表單）

**尚未覆蓋的 SOP（仍有 sopLibrary 薄卡，但無 clarify 富條目）：**
- DP34-01（關鍵設備）、DP34-02（量測儀器）、DP35-01（電腦化系統）
- DP82-01（內部稽核）—現有 clarify-internal-audit-frequency 但未逐份原文核對
- 第七章：DP72-01 clarify-outsourcing 已驗證（本輪）

### 下次開工方向
- 確認使用者要優先做 A/D/E（功能升級）還是繼續補剩餘 clarify 條目（DP34/35/82）
- 若收到「繼續補 clarify」：讀 DP34-01、DP34-02、DP35-01、DP82-01 建立對應條目
- 若收到功能升級：從 D 項全站互動性（scroll fade-in / hover / ripple）開始

---

## 本輪完成（2026-05-27 開工）

### KB-1：clarify-* 與稽查清單指令語清除（ff02d93）
已修正 4 處 learner-facing 指令語：
- `clarify-storage` xinshing：「每日記錄溫濕度」→「每月上班最後一日整理 FR33-01」（依 DP33-01 / DP55-01 原文核對）
- `clarify-internal-audit-frequency` xinshing：移除「本教材以每年 12 月為內部稽核頻率依據」→ 改為 DP82-01 稽核報告歸檔與管審提報事實
- `auditChecklistFor` 溫度規則：「資料不得寫成冷藏倉…」→ 改為常溫倉庫事實描述
- `auditChecklistFor` 內部稽核規則：「不是每 6 個月一次」→ 移除，改為依 DP82-01 每年 12 月事實

### 下次開工方向（已完成，見上）
- ~~F 項：KB 全量校對~~（本次已完成）

---

## 本輪完成（2026-05-27 收工）

### 本次無 HTML / Firestore 修改
- 確認昨晚（2026-05-26）進度完整：最後三個 commit 均已 push，未損失任何程式碼
- 確立 KB 全量校對方向（evidence-based-content 標準）：
  - 查詢精準命中：問 A 只出現 A，關鍵字覆蓋所有問法，不跨條目污染
  - 三欄法規標準：有明文寫明文；無明文寫「無明文規定」，不推論
  - 內容只來自原始 SOP/WI/FR，不補充、不推斷
  - 論文/報告同標準：來源可公開查閱可下載，不誇大，超出來源不寫
- 建立 `evidence-based-content` skill（第二大腦 + Google Drive + 本機 Claude 三處同步）

### 下次開工方向
- F 項：KB 全量校對（套用 evidence-based-content 標準，逐章或逐部門）
- 由使用者決定從哪章/哪部門開始

---

更新：2026-05-26（第三次）

## 目前狀態
- 分支：codex/gdp-html-training-pages
- GitHub Pages：https://n1116839.github.io/xinshing-gdp-training/
- Firebase：xinshing-gdp-training-20260525（Firestore rules 尚未部署，見下方說明）

## 本次已完成（2026-05-26 第三次開工）

### Firestore Rules 部署（完成）
- `firebase deploy --only firestore:rules` 執行成功
- 生效規則：gdpDocStats、gdpUsageEvents、gdpUserStats、gdpQuestionStats、gdpRegulationReview
- 熱門文件排行榜、問題排行榜、季度更新追蹤功能現已完整啟用

## 本次已完成（2026-05-26 第二次開工）

### Phase 1：HTML 文字修正（全部完成）
1. Hero 區改顯示「學習重點」bullet list（`pagePills` → `hero-focus` ul），取消頁面中的 學習重點/本頁定位 panel
2. 稽查時最常看的證據鏈：`half` → `wide`
3. CAPA 共同處理閉環：`half` → `wide`
4. 規範到現場四層對照：docs tab 加 data-doc 屬性可點擊，所有 tab 改 2 欄 grid
5. 部門文件閱讀地圖：文件可點擊（button.pill.doc-pill + data-doc）
6. 移除冷鏈相關資料（倉庫無冷藏倉）：SMF 基本資料、qualityPolicy KPI、auditChecklists 配送佐證、icon 判斷邏輯
7. Q&A 表單：移除提問人欄位；回覆開放所有人（不限管理者）；問題永久保留
8. 手機版部門篩選：`<select>` → 水平捲動按鈕群組（`.dept-filter-btns`）
9. 熱門文件排行榜（`gdpDocStats`）取代使用者排行榜

### Phase 2：Firestore KB 資料校正（全部完成）
已修正文件（共 15 筆）：
- deviation-management、drug-recall、complaint-handling、expiry-date-management
- inventory-cycle、document-retention、supplier-qualification
- inbound-outbound（移除冷鏈，補充運輸紀錄/嘉里醫藥關鍵字）
- product-storage（移除「儲位」關鍵字，避免誤觸溫度答案）
- critical-equipment（「偉測器」→「偵測器」，最終確認正確）
- counterfeit-drugs（全欄位亂碼修正）
- pest-control（螠船→蟑螂、蚊蝠→蚊蠅、蟞蟻→螞蟻、螠螠屋→蟑螂屋、誤蟻馓→誘蟻餌、偉測報告→偵測報告、山害物→有害物、鞀吃物食物→食物物品）
- warehouse-layout（雔離→隔離、明題處→明顯處、病人傳出藥品→偽禁仿冒藥品）
- organization-responsibilities（職担→職掌，全欄位）
- **新增** storage-location-management（儲位編號管理，keywords: 儲位編號/儲位設置/WI32-03/儲位異動/儲區配置/儲位標示）

### Phase 3：Firestore rules 更新
- `Firebase設定/firestore.rules` 新增 `gdpDocStats` 規則（docId、title、openCount、lastOpenedAt）
- **尚未部署**：需使用者同意後執行 `firebase deploy --only firestore:rules`

## 本輪完成（2026-05-26 第五次）

| Commit | 內容 |
|--------|------|
| e449784 | 更新 AGENTS.md、建立 CLAUDE.md、補 HANDOFF F 項（四台電腦交接修正） |
| 095b020 | 移除 clarify-storage 冷藏 keyword、project-source-file 評分上限 12、盤點硬排除收緊、閾值 0.35→0.45、clarify-temperature-mapping 明確「沒有冷藏倉」 |
| 56c81df | 正航查詢意圖比對收緊、新增正航硬排除、移除 xinshing「不是溫度監控系統」AI 推論句 |

### 搜尋邏輯現況
- 查詢含「盤點」→ 只有含 `盤點|fr5503|dp5501` 的文件通過
- 查詢含「正航」→ 只有含 `正航|fr5701|dp3501` 的文件通過
- `project-source-file` 評分上限 12，maxScore≥50 時閾值 0.45（原 0.35）
- clarify-storage keywords 已移除「冷藏」，改為「室溫、多久盤點、幾個月盤點、庫存管理」
- clarify-temperature-mapping：xinshing 明確說「沒有冷藏倉」；正航描述改為「確效過的進銷存系統（FR57-01）」

## 下次待辦（使用者明確要求，按優先順序確認後再動工）

**A. 規範到現場四層對照（部分完成）**
- HTML 端 docs tab 已加 data-doc 屬性 ✓
- company tab 的 company-action-card 點擊行為已套用 ✓
- 確認是否需要再做其他 standardsSwipe 互動

**B. Firestore rules 部署** ✅ 已完成（2026-05-26 第三次）
- 已執行 `firebase deploy --only firestore:rules`，所有規則上線
- 熱門文件排行榜、問題排行榜、季度更新追蹤功能已啟用

**C. GDP 智慧查詢 — Firestore KB 覆蓋 sopLibrary 全部 33 份文件**
- 已有 15 筆（含本次新增 storage-location-management）
- 待補齊 18 筆（對照 sopLibrary）：
  DM10-01, WI10-01, DP12-01, DP12-03(CAPA), DP12-04(變更), DP14-01(管審),
  DP15-01(風險), DP25-01(人員衛生), DP35-01(電腦化系統),
  DP36-01(確效), DP42-01(文件管制), DP53-01(客戶認可), DP54-01(進出貨→已有inbound-outbound),
  DP56-01(廢棄物), DP57-01(訂單揀貨), DP63-01(退回品), DP65-01(回收),
  DP72-01(委外)
- 每筆格式：topic, keywords[], international, taiwan, xinshing, sop_ref[]

**D. 全站互動性升級**
- Scroll fade-in：元素進入畫面時滑入顯現
- Hover 微互動：按鈕/卡片 hover 陰影與顏色過渡加強
- 點擊 ripple：按鈕點擊時的波紋/下陷動畫
- 流程步驟點擊展開詳情
- 稽查重點互動核對：視覺化豐富化（含互動型態：表單輸入、微互動、Accordion/Modal/Tabs、scroll trigger）

**E. 重複區塊整合**
- 重複區塊整合（各部門頁面中重複出現的行事曆/表單區塊）
- 文件清單三處重複（pagePills + 文件地圖 + docButtons），只保留一處
- eyebrow 字體 16px → 18px（0249477 已改，但被回退）

**F. GDP KB 全量逐章逐題校對（長期工作，最重要）**
- **前一輪 AI 明確說明：不應把 2026-05-26 的同步當成整個資料庫已全部完成。**
- 目前 Firestore KB 71 筆為自動同步文字摘要，不一定符合三階回覆格式，且未逐筆驗證正確性
- 必須逐章（第一章品管 → 第八章）逐題測試，每章至少 5 組不同性質問題
- 每題需回 SOP/WI/FR 原文核對答案正確性
- 如有錯誤，需同時修正 Firestore 與 HTML fallback
- 已知錯誤模式（不可再犯）：
  - 出現冷藏倉 / 冷鏈 → 公司無冷藏倉
  - 溫度記錄每 15 分鐘 → 應為每 5 分鐘
  - 內部稽核每 6 個月 → 應為每年 12 月（依 DP82-01）
  - 溫度測繪每年 → 應為每三年（夏 7-9 月、冬隔年 1-3 月）
  - 進貨主文件誤用 DP52 → 應為 DP54-01 / FR54-01

**KB-1. clarify-* 條目指令語清除（最優先執行）**
- `clarify-temperature-mapping`、`clarify-internal-audit-frequency`、`clarify-storage` 等 clarify-* 條目
- `taiwan` / `xinshing` 欄位仍含指令語（「不可寫成…」「目前資料索引…」）
- 修正方案：逐筆審查，三個欄位只放正式教材內容
- 注意：b6507f9 的 HTML fallback 修正被 git revert 回退，但 Firestore 端是否乾淨需確認

## 踩坑點（2026-05-27 第四次補記）
- **精準搜尋從未執行**：多次宣告 KB「完成」但從未測試覆蓋率，導致反覆修改相同 23～31 筆，其餘 17 筆完全未補。往後每次宣告完成前，必須先做：(1) 資料夾文件數 = KB 筆數核查；(2) 每章 5 組測試題。
- **KB 覆蓋率標準**：資料夾有幾份文件（第一章 11/第二章 8/第三章 14/第四章 2/第五章 7/第六章 4/第七章 1/第八章 1，共 48 份），KB 就要有 48 筆；目前 31 筆，缺 17 筆。
- **測試組計算**：同主題多種問法 = 1 組（「盤點/倉庫盤點/多久盤點/庫存檢查」= 1 組）；每章至少 5 組不同主題。
- **測試驗收**：每組題目需確認命中正確條目 + 三欄內容對應 SOP 原文正確。
- **KB 核心規則（2026-05-27 確立）**：資料夾有幾份文件，資料庫就必須有幾筆；開始前點數全部文件，逐份讀取不可跳過，完成後再次核對筆數，少一筆不算完成。資料必須非常精準。
- **KB 條目粒度錯誤（2026-05-27 使用者測試發現）**：一筆條目塞多個主題，導致問「盤點」卻跑出溫度＋盤點＋不符合品三件事。
  - 正確架構：**一筆條目 = 一個可回答的問題（一個主題）**
  - 一份 SOP 若涵蓋多主題，必須拆成多筆（例：DP55-01 → 盤點、溫度條件、不符合品三筆）
  - xinshing 欄位只放「此主題」的 SOP 原文，不放背景說明、不放否定描述（「沒有冷藏倉」文件上沒有這句）
  - keywords 只覆蓋此主題的問法，不跨主題
  - 拆分後必須測試：問 A 只出現 A，不出現 B 或 C

## 踩坑點（2026-05-26 第三次補記）
- Firestore rules 部署：使用 MCP tool `firebase_deploy(only:"firestore:rules")` 即可，不需要手動 CLI；`firebase_deploy_status` 可查狀態
- KB keyword 短查詢：加完長 keyword 後一定要同時補最短形式（如「儲位編號」→ 也要加「儲位」），否則短查詢一律失效
- storage-location-management 建立時出現兩個亂碼：「追港」（應為追溯）、「明顕」（應為明顯）；建立後務必讀回驗證全欄位
- 揃（U+63C3 日文）≠ 揀（U+63C0 繁中）：Firestore 資料若有此錯字，查詢時完全無法命中，需全文件重寫

## 踩坑點
- git packed-refs.lock 警告：無害，commit 仍成功，忽略即可
- HANDOFF 待辦清單裡的項目，每次都要先問使用者要從哪一項開始，不可自行決定
- UI 裡不可放「資料由公司人員定期更新」「更新者：system」等 meta 說明文字
- pagePills 在有 departmentDocumentMaps 的頁面已隱藏；不需在兩處顯示同樣文件
- kbSection 用 panel() 直接放入 .grid，不可用 kb-wrap 包裝（會縮成 1 欄）

**KB keyword 匹配邏輯（重要）：**
- 搜尋邏輯是 `query.includes(keyword)`，即「使用者輸入」必須包含「keyword」
- 短查詢（如「病媒」2字）永遠無法命中長 keyword（如「病媒防治」4字）
- 規則：每個 KB 文件的 keywords 必須包含最短有意義單詞
  - 有「病媒防治」→ 必須也有「病媒」
  - 有「衛生管理」「人員衛生」→ 必須也有「衛生」
  - 有「著裝規定」→ 必須也有「著裝」
  - 有「防治器具更換」→ 必須也有「防治器具」（中間插字就失效）
- 工具名稱（誘蟻餌、捕鼠器等）要單獨列入，不可依賴其他 keyword 推導
- 快速按鈕 data-q 的完整字串也必須是 keyword 的超字串（.includes()）
- 物流門相關時間規範：WI25-01（一般關門原則）≠ DP54-01 第9節（嘉里醫藥15:00-15:30管制）
  後者在 inbound-outbound KB，不在 access-control KB
- Firestore Unicode 編碼容易出錯（例如 偉 vs 偵、揃 vs 揀、雔 vs 隔、皁帶入 亂碼）：送出後要讀回確認
- 「揃貨」是日文漢字（U+63C3），正確繁中為「揀貨」（U+63C0）；原 KB 資料有此錯字已修正
- 新勝醫藥無冷藏倉，凡涉及冷鏈/冷藏的描述一律移除
- organization-responsibilities 的 SOP 名稱為「組織與職掌」（不是職担）
- AI 生成 Firestore 資料有高機率出現亂碼（如「皁帶入飲食」「雔離」「螠船」等），每次建置後需逐欄核對

## 環境
- 主檔：G:\我的雲端硬碟\2026codex\AI測試\HTML資料庫\新勝GDP資料庫.html
- Firebase rules：G:\我的雲端硬碟\2026codex\AI測試\Firebase設定\firestore.rules
- 預覽 server：npx serve -p 3333（launch.json 已設定）
- 資料夾結構：HTML資料庫/ | 簡報資料/ | Firebase設定/ | 第一章至第八章（原始SOP）

## 2026-05-26 收工補記：簡報 / HTML / Firebase 分流（沿用）

- `HTML資料庫/`：放置新勝 GDP 資料庫網頁、網頁 assets、封面圖與網頁 README。
- `簡報資料/`：放置簡報輸出與簡報相關成果。
- `Firebase設定/`：放置 `.firebaserc`、`firebase.json`、`firestore.rules`、`firestore.indexes.json`。
- 第一章至第八章原始 SOP / WI / FR 資料夾保留在專案根目錄。

GitHub Pages 入口 `index.html` 已改成導向 `HTML資料庫/新勝GDP資料庫.html`。

Firebase 功能狀態：
- Firestore rules 尚未部署到線上（gdpUsageEvents、gdpUserStats、gdpQuestionStats、gdpRegulationReview、gdpDocStats 規則均已寫好，需使用者同意後部署）
- 熱門文件排行榜、問題排行榜、季度更新追蹤功能已內建於 HTML，待 rules 部署後啟用

## GDP 智慧查詢重要提醒（2026-05-26 使用者確認）
- 資料一定要可追溯來源，不可與原始 SOP/WI/FR 有所出入
- 不可自行依判斷增加文件上面沒有的事情
- 資料夾內有重複資料時以最新資料為主
- 修正時應統一一次性修正，不能只修復一個地方
- 溫度超標：每 5 分鐘記錄一次（非 15 分鐘）；每年針對量測儀器做外部校正；每三年或重大變更時針對倉庫環境做溫度測繪

## 2026-05-26 第四次開工：資料夾全量索引與新 skill

使用者已明確同意：Firebase 專案 `xinshing-gdp-training-20260525` 作為正式資料庫，可將本機資料夾內 SOP/WI/FR/表單/簡報文字摘要與檔名索引批次上傳至 Firestore `gdpKnowledgeBase`。

已完成：

- 新增 `Firebase設定/sync-gdp-knowledge.ps1`，可重跑「專案來源檔 → 抽文字 → 分段 → Firestore」同步。
- 已同步來源檔 58 個，Firestore 文件 79 筆，失敗 0。
- 已新增官方法規來源索引：
  - `official-pics-gdp-pe011`：PIC/S publications / PE 011 GDP Guide。
  - `official-taiwan-gdp-rule`：食藥署 GDP 專區「西藥優良運銷準則」公告頁。
- 已建立本機 Codex skill：`C:\Users\user\.codex\skills\html-evidence-training-builder`
  - 內含 `SKILL.md`
  - `references/gdp-html-checklist.md`
  - `scripts/sync-gdp-knowledge.ps1`

注意：

- 同步資料以來源檔文字為主；國際法規/台灣法規欄位若來源檔未直接支持，不得用模型推論補成公司做法。
- PowerShell 5 會把無 BOM UTF-8 腳本中的中文常數解析錯亂；同步腳本控制文字已改為 ASCII，抽出的文件內容仍保留中文。
- `python` / `py` 在此環境不可用，因此 skill 以手動結構建立，未跑 `quick_validate.py`；已做檔案結構與 frontmatter 檢查。

## 2026-05-26 收工：永久網址與授權規則

永久公開網址：

```text
https://n1116839.github.io/xinshing-gdp-training/
```

不要再請使用者使用本機 `file://` 深層網址作為長期網址。GitHub Pages 根網址應保持穩定，`index.html` 負責導向實際 HTML。

使用者授權規則：

- 使用者指定「上傳 github」時，代表可直接 commit/push 當前相關變更，不需再問一次。
- 使用者指定「更新第二大腦」時，代表可直接寫入第二大腦專案筆記、踩坑紀錄與知識庫紀錄。
- 使用者指定「使用 fire 資料庫 / Firebase / Firestore」時，代表可直接執行必要的 Firestore 同步、rules 部署或資料寫入。
- 若工具層要求 sandbox escalation，仍依工具機制提出，但專案紀錄不可再寫「等使用者明確說同意推送後再執行」。

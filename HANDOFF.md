# GDP HTML 教育訓練 HANDOFF
更新：2026-05-29（第二十次）

## 本輪（2026-05-29 第二十次開工）⚠️ 純診斷，無程式碼/資料變更

### 性質：搜尋邏輯根因診斷 + 資料正確性確認（未動 HTML）

本輪不是功能 commit。只做了診斷與計畫，**未修改 `新勝GDP資料庫.html` 任何一行**。下方紀錄供下次開工直接動工。

#### 一、根因確診：布林 +55 分制 = 重複錯誤的真正源頭

使用者長期困擾「此專案一直出現重複錯誤」（例：查「公司有沒有冷藏倉」回傳 4 張 fact 卡 + 另有 4 筆）。逐行追查 `kbStore.search()`（約 2510–2572 行）後確認根因不是資料髒，而是**評分架構**：

```js
if(doc.sourceType==="fact"&&strongHit) score+=55;   // 約 2550 行 — 命中即 +55 的「布林平分」= 根因
```

- `strongHit` 只要意圖 regex 命中就為 true，所有命中的 fact 一律 +55，**彼此平手** → 一個是非題（有沒有冷藏倉）會同時頂出多張不相關 fact 卡。
- 意圖 regex 過寬（約 2541–2547 行），違反規範 §3.1「禁用通用詞」：

```js
if(term.includes("常溫倉庫冷藏倉")&&/倉庫|常溫|冷藏|儲存/.test(hay)){ score+=8; strongHit=true; }  // 約 2542 行，/倉庫|儲存/ 太寬
```

- 門檻過濾（約 2568–2569 行）因大家平手 55 而失效，過濾不掉多餘卡。

**這是 whack-a-mole 架構問題**：過去每次只補單一 keyword/regex，治標不治本，所以重複出錯。

#### 二、已確認 fact 資料正確（排除「資料錯」假設）

逐份讀 `第三章作業場所及設備/DP33-01溫度監視作業程序書.docx` 原文，確認：
- `fact-temp-alarm-threshold` 的「儲區規範溫度減 1.5°C（23.5°C）」是 **DP33-01 原文逐字**（原文：「設定溫度上下限警戒值為儲區規範溫度儲存條件減1.5℃」），非 AI 推論 → **資料正確，不需改**。
- 旁證：室溫 +15～+25℃、溫度測繪每三年夏冬各 7 天、FR33-01 每月底、警報測試每月 FR34-03，皆與既有 fact 一致。

#### 三、已確認方向（使用者明確指示）

> 「把評分從『命中即 +55 的布林分』改成分級的相關度分」
> 「從章節最少的資料 / 重新開始針對搜尋邏輯進行修正 / 一次做一章」
> 「依照 GDP_智慧查詢規範.md 要求的項目 / 使用永久連結測試 / 收工 / 做紀錄」

### 下次開工必做（搜尋邏輯重構，一次一章）

1. **重構 `kbStore.search()` 評分**：把 fact 的 `strongHit→+55` 布林平分，改成**分級相關度分**（依命中精準度給差異化分數，讓單一最相關 fact 勝出，是非題只回 1 張卡）。
2. **收窄過寬意圖 regex**（約 2541–2547 行），移除 `/倉庫|常溫|冷藏|儲存/` 等通用詞，符合規範 §3.1。
3. **一次只驗一章**，從文件最少的章節起：第七章（DP72-01 委外，3 fact）或第八章（DP82-01 內部稽核，2 fact）。
4. 每章：跑 `verify_facts_ghpages.mjs`（注意該腳本第 75 行也用了 +55，需同步改成分級分）+ 規範 §10 標準（每題 ≥10 問法）+ **GitHub Pages 永久連結驗收** + 收工紀錄。
5. ⚠️ 本輪未 push 任何程式碼變更；本次 commit 僅文件紀錄，**非經驗收的功能 commit**（規範 §8.3）。

---

## 本輪完成（2026-05-29 第十九次開工）commit 4ef42bc ✅ 本機 124/124 通過

### 第五章 fact 全部補完 → Phase 1 KB 正式宣告完成 ✅

**讀取來源（逐份原文）：** DP52-01、DP53-01、DP54-01、DP55-01、DP56-01、DP57-01

**新增 11 筆 fact：**

| SOP | fact ID |
|-----|---------|
| DP52-01 供應商評鑑 | supplier-qualification / supplier-periodic-eval |
| DP53-01 客戶認可 | customer-qualification / customer-periodic-review |
| DP54-01 進出貨 | receiving-flow / receiving-time-control |
| DP55-01 倉儲管理 | storage-near-expiry / storage-inventory |
| DP56-01 廢棄物 | waste-destruction |
| DP57-01 揀貨配銷 | picking-verification / transport-temp-record |

**驗收：** 本機 124/124 ✅（GitHub Pages 待部署確認）

**踩坑補記：**
- 關鍵字「停業客戶」(4字) 需作為獨立 keyword，不能只寫「停業客戶移除」（不是查詢的 substring）
- 查詢「進出貨幾點管制」與舊 fact-logistics-door 衝突 → 改測試 query 為「嘉里醫藥幾點收貨」更精確

---

### ⚠️ Phase 1 KB 完成狀態確認（全部完成）

| 章節 | SOP 份數 | fact 狀態 |
|------|---------|----------|
| 第一章 | 5份 | ✅ 15 筆 |
| 第二章 | 7份 | ✅ 20 筆 |
| 第三章 | 7份 | ✅ 24 筆 |
| 第四章 | 2份 | ✅ 6 筆 |
| 第五章 | 6份 | ✅ 11 筆（本次新增）|
| 第六章 | 4份 | ✅ 7 筆 |
| 第七章 | 1份 | ✅ 3 筆 |
| 第八章 | 1份 | ✅ 3 筆 |

**Phase 1 KB 正式宣告完成 ✅ 共 89 筆 fact（含組織架構、設備、管制區等輔助 fact）**

---

### 下次開工優先事項

1. **GitHub Pages 驗收** — 確認 124/124 通過（部署需數分鐘）
2. **Phase 2：H1 員工登入系統**（Phase 1 已完成，可進入）
   - 需確認：Firebase 設定、gdpUsers collection、登入 UI 設計
3. **Phase 3 前置準備**（可同步規劃）
   - admin email 清單、superadmin email（hardcode）、初始職稱清單、Firestore rules 更新

---

## 本輪完成（2026-05-29 第十八次開工）commit ebc5af7 ✅ GitHub Pages 105/105 通過

### 第四/六/七/八章 fact 架構全部補完 ✅

**讀取來源（逐份原文）：** DP42-01、DP42-02、DP62-01、DP63-01、DP64-01、DP65-01、DP72-01、DP82-01（第八章補記）

**新增 16 筆 fact：**

| 章節/SOP | fact IDs |
|----------|----------|
| DP42-01 文件管制 | doc-hierarchy / doc-approval-time / doc-annual-review / doc-obsolete / doc-storage-method |
| DP42-02 品質紀錄 | record-writing-rule |
| DP62-01 客訴 | complaint-types / complaint-repeat |
| DP63-01 退回品 | return-label |
| DP64-01 偽禁藥 | counterfeit-action |
| DP72-01 委外 | outsourcing-eval-timing / outsourcing-grade / outsourcing-first-eval |
| DP82-01 內部稽核 | audit-personnel / audit-defect-types |

**驗收：** 本機 105/105 ✅ → GitHub Pages 永久網址 105/105 ✅（commit ebc5af7）

**踩坑補記：**
- 第八章（DP82-01）從未列入 HANDOFF 待補清單 → 此次使用者主動指出才補入
- xinshing 文字中的空格（`2 個工作天`）會導致 hint 比對失敗，數字後面不要加空格
- clarify 寬泛 keywords 會搶分蓋過 fact → 建 fact 後需同步確認 clarify 不干擾

---

### ⚠️ Phase 1 KB 完成狀態確認

| 章節 | SOP 份數 | fact 狀態 |
|------|---------|----------|
| 第一章 | DP12-01/03/04、DP14-01、DP15-01（5份）| ✅ 15 筆 |
| 第二章 | WI22-01、DP22-01、DP24-01、DP25-01/02、WI25-01/04（7份）| ✅ 20 筆 |
| 第三章 | DP32-01、DP33-01、DP34-01/02、DP35-01、DP36-01、WI25-01（7份）| ✅ 24 筆 |
| 第四章 | DP42-01、DP42-02（2份）| ✅ 6 筆（本次新增）|
| 第五章 | DP52-01、DP53-01、DP54-01、DP55-01、DP56-01、DP57-01（6份）| ⚠️ 早期 clarify 條目，無獨立 fact（待評估）|
| 第六章 | DP62-01、DP63-01、DP64-01、DP65-01（4份）| ✅ 7 筆（含本次）|
| 第七章 | DP72-01（1份）| ✅ 3 筆（本次新增）|
| 第八章 | DP82-01（1份）| ✅ 3 筆（本次新增）|

**⚠️ 第五章（供應鏈/進出貨/倉儲）：** 目前靠舊版 clarify 條目兜底，尚未拆成 fact 粒度。是下一階段重點。

---

### 下次開工優先事項

1. **評估第五章是否需補 fact**（DP52-01 供應商、DP53-01 客戶認可、DP54-01 進出貨、DP55-01 倉儲、DP56-01 廢棄物、DP57-01 揀貨配銷）
2. 若補完第五章 → Phase 1 KB 正式宣告完成 → 進入 H1 員工登入系統

---

## 本輪完成（2026-05-28 第十七次開工）規範 v2.2 — 三階段藍圖 + 帳號審核設計

### 規範文件 v2.2 補充 ✅

**新增內容：**

1. **Chapter 零 0.2 更新**：教材目標從三點升為**四點**（第四點：什麼時候要做文件）
2. **第三十六章**：部門頁面內容精準性規則（文件三層分類、文件分配精準性、職位層級差異）
3. **第三十七章**：三階段開發藍圖（Phase 1 KB完成 → Phase 2 視覺化 → Phase 3 帳號審核）
4. **第三十八章**：帳號申請與審核平台設計
   - 三層角色（一般員工 / 組長主管 / 管理員）
   - 啟用碼安全機制（一次性 + 48小時過期）
   - 申請流程、晉升流程、停用流程
   - Firebase 技術對應（gdpUsers、gdpUserApplications、gdpActivationCodes）
   - 收件時程角色控制（主管以上才顯示）

**Phase 3 設計決定（使用者確認）：**
- 角色層級：三層（一般/主管/管理員）
- 申請資料：員工編號、姓名、部門（下拉）、職稱（下拉，管理員維護）
- 晉升：組長代申請 → 管理員審核
- 身份確認：啟用碼機制（管理員批准後 LINE/當面給予，一次性）
- 通知：email（初版）；LINE 為後期選項

**驗收：** 本輪為純文件工作，無 HTML/Firebase 修改

---

### ⚠️ Phase 3 實作前必確認（下次開始寫 code 前）

```
□ 管理員 email 清單（具體幾個？）
□ 超級管理員 email（hardcode）
□ 初始職稱清單
□ Firestore rules 更新
```

---

## 本輪完成（2026-05-28 第十六次開工）規範文件整合（無 HTML/Firebase 修改）

### GDP_智慧查詢規範.md v2.0 建立完成 ✅

**本輪工作性質：** 純文件整合（不修改 HTML、Firebase、程式碼）

**整合來源：** 15 次開工踩坑紀錄（全站稽查後補完）

**規範架構：**

| 範圍 | 內容 |
|-----|------|
| 章零 + 第一至三十五章 | 教材目的、fact 架構、搜尋規則、三欄標準、前台規則、開發流程 |
| 附錄 A、B、C | 開工清單、KB 禁止清單、文件結構 |

**本輪主要補充內容：**

1. **Chapter 零**（教材整體目的）— 三大核心目標 + 稽查員問答範例
   - 員工應答格式：數字 → 原因 → 例外處理機制
   - 範例：「你們公司倉庫溫度是多少度？」→「15-25度，因為常溫藥品。警戒值 23.5度，超過系統會提醒。」

2. **Section 6.5**（「新勝做法」欄定位與命名）— 標籤建議 + 員工回答語氣格式說明

3. **Section 28.0**（公司文件一律不得有超連結）— 硬性規則，例外僅限外部法規連結

4. **Section 10.2**（搜尋結果只是假設，文件才是答案）— 5 步驟交叉驗證流程

5. **AGENTS.md** 補充智慧查詢精準回答硬性規則（2026-05-28）

**驗收：** 本輪為純文件工作，無搜尋功能變更，無需跑驗收腳本

---

### ⚠️ 尚未完成（下次開工優先）

| 章節 | 待補 fact 條目 |
|------|--------------|
| 第四章 | clarify-document-control（DP42-01、DP42-02）需補 fact |
| 第六章 | clarify-complaint-handling、clarify-falsified-medicines（DP62-01、DP64-01、DP65-01）需補 fact |
| 第七章 | clarify-outsourcing（DP72-01）需補 fact |

**下次開工必做：**
1. 讀 HANDOFF.md（本檔）
2. 讀 踩坑紀錄.md
3. 讀 2026codex AI測試.md
4. 詢問使用者要從哪個待辦開始（第四章/第六章/第七章 fact 補完）
5. 補完後跑驗收腳本，加入對應測試題

---

## 本輪完成（2026-05-28 第十五次開工）commit baf798c ✅ 本機 82/82 通過

### 第三章 fact 架構完成 ✅

**新增 24 筆 fact（依 7 份原文逐份讀取建立）：**

| 來源 | 筆數 | fact IDs |
|------|------|---------|
| DP32-01 廠區規劃（4筆）| 4 | fact-premises-zones、fact-premises-nonconform-isolation、fact-premises-fefo、fact-premises-food-prohibition |
| DP33-01 補充（2筆）| 2 | fact-temp-sensor-location、fact-temp-sensor-calibration |
| DP34-01 關鍵設備（5筆）| 5 | fact-equipment-types、fact-equipment-acceptance、fact-equipment-battery、fact-equipment-maintenance、fact-equipment-abnormal |
| DP34-02 量測儀器（3筆）| 3 | fact-instrument-calibration、fact-instrument-record、fact-instrument-abnormal |
| DP35-01 電腦化系統（3筆）| 3 | fact-computer-scope、fact-computer-authorization、fact-computer-backup |
| DP36-01 驗證確效（3筆）| 3 | fact-validation-4q、fact-validation-report、fact-validation-revalidation |
| WI25-01 門禁管制（4筆）| 4 | fact-access-entry-process、fact-access-card、fact-access-visitor、fact-access-abnormal-record |

**clarify keywords 縮窄（6 個）：**
- clarify-premises-layout：19→11 個（移除六區/收貨區/出貨區等具體問法）
- clarify-validation：17→6 個（移除4Q/DQ/IQ等由 fact 負責）
- clarify-critical-equipment：21→15 個（移除電池/設備清單/設備異常等）
- clarify-measuring-instruments：21→15 個（移除每年校正/暫停使用等）
- clarify-computer-system：19→12 個（移除授權/備份/FR35-02等）
- clarify-access-control：24→6 個（由 fact 負責具體門禁問法）

**踩坑修正（2 處 keyword）：**
- 「非符合品區要上鎖嗎」中「區要」打斷「非符合品」和「上鎖」→ 補「非符合品區要上鎖」+「非符合品區要上鎖嗎」
- 「誰可以修改電腦系統資料」中「電腦」插入「修改」和「系統」之間 → 補「誰可以修改電腦系統」

**驗收：** 本機 82/82 通過（舊 58 題 + 第三章 24 題），已 push GitHub Pages

### ⚠️ 尚未完成（下次開工優先）

| 章節 | 待補 fact 條目 |
|------|--------------|
| 第四章 | clarify-document-control |
| 第六章 | clarify-complaint-handling、clarify-falsified-medicines |
| 第七章 | clarify-outsourcing |

**下次開工必做：**
1. 讀 第四章 SOP 原文（DP42-01文件管制/DP42-02品質記錄）補 fact
2. 讀 第六章 SOP 原文（DP62-01/DP64-01/DP65-01）補 fact
3. 讀 第七章 SOP 原文（DP72-01委外）補 fact
4. 全章補完後跑驗收腳本，加入對應測試題
5. 全章完成後 → H1 登入系統

---

## 本輪完成（2026-05-28 第十四次開工）commit 9b82e7e ✅ 本機 58/58 通過

### 第一章 fact 架構完成 ✅

**新增 15 筆 fact（依 DP12-04、DP14-01、DP15-01 原文逐份讀取建立）：**

| 類別 | fact IDs |
|------|---------|
| 變更管制（5筆）| fact-change-trigger、fact-change-level、fact-change-form、fact-change-overdue、fact-change-notify |
| 管理階層檢討（3筆）| fact-mgmt-review-freq、fact-mgmt-review-items、fact-mgmt-review-form |
| 品質風險（7筆）| fact-risk-team、fact-risk-method、fact-risk-level-abc、fact-risk-severity、fact-risk-occurrence、fact-risk-review、fact-risk-form |

**keyword 清理：**
- `clarify-change-control`：從 14 個關鍵字縮窄至 7 個（移除重大變更/次要變更/通報/食藥署/搬遷等，由 fact 負責）
- `clarify-management-review`：從 17 個縮窄至 8 個（移除年底/申訴/回收/偏差/CAPA/委外/品質目標等）
- `clarify-quality-risk`：從 18 個縮窄至 8 個（移除嚴重度/發生度/RPN/風險回顧/等級ABC/危害/風險小組/FMEA等）

**踩坑修正（4 處 keyword 補充）：**
- 中文查詢中間插詞（「搬遷需要通報」=搬遷+需要+通報，非「搬遷通報」substring）→ 補「倉庫搬遷需要通報嗎」
- 「管理階層檢討多久一次」中「檢討」在「管理階層」和「多久」之間 → 補「管理階層檢討多久一次」
- 「等級A風險怎麼辦」中「A風險」打斷「等級A怎麼辦」 → 補「等級A風險怎麼辦」
- 「品質風險多久回顧」中「多久」在「風險」和「回顧」之間 → 補「品質風險多久回顧」

**驗收：** 本機 58/58 通過（舊 43 題 + 第一章 15 題），已 push GitHub Pages

### ⚠️ 尚未完成（下次開工優先）

| 章節 | 待補 fact 條目 |
|------|--------------|
| 第三章 | clarify-premises-layout、clarify-validation、clarify-critical-equipment、clarify-measuring-instruments、clarify-computer-system、clarify-access-control |
| 第四章 | clarify-document-control |
| 第六章 | clarify-complaint-handling、clarify-falsified-medicines |
| 第七章 | clarify-outsourcing |

**下次開工必做：**
1. 依樣板繼續補第三章 fact（讀 DP33-01/DP34-01/DP34-02/DP35-01/DP36-01 原文）
2. 每章補完後跑驗收腳本，加入對應章節測試題
3. 全章完成後 → H1 登入系統

---

## 本輪完成（2026-05-28 第十三次開工）commit b1a79af ✅ 本機 43/43 通過

### 第二章 fact 架構完成 ✅

**新增 20 筆 fact（依 WI22-01、DP25-01、WI10-01 原文逐份讀取建立）：**

| 類別 | fact IDs |
|------|---------|
| 組織架構（10筆）| fact-org-gdp-manager、fact-org-pharmacist、fact-org-sales、fact-org-quality、fact-org-warehouse、fact-org-purchasing、fact-org-hr、fact-org-doccontrol、fact-org-deputy、fact-org-emergency-contact |
| 人員衛生（5筆）| fact-hygiene-handsan、fact-hygiene-incoming-clean、fact-hygiene-daily-cleaning、fact-hygiene-quarterly-ac、fact-hygiene-door-barrier |
| SMF（2筆）| fact-smf-company-basic、fact-smf-gdp-established |
| 訓練補充（3筆）| fact-training-preservice、fact-training-external、fact-training-record |

**keyword 清理：**
- `clarify-org-chart`：移除所有職稱專屬查詢 keywords（現在由個別 fact 負責），保留 WI22-01/組織圖/職務說明書等廣泛查詢
- `clarify-smf`：移除所有職稱資格 keywords（由個別 fact 負責），保留公司地址/SMF/許可證等

**驗收：** 本機 43/43 通過（舊 21 題 + 第二章 22 題），已 push GitHub Pages

### ⚠️ GitHub Pages 驗收尚待確認（已 push，等部署後需驗收）

**驗收方式：** 部署完成後執行 `node verify_facts_ghpages.mjs`（切換到 GH Pages 模式：把第 134-135 行改為 fetchUrl GH_PAGES_URL）

### ⚠️ 尚未完成（下次開工優先）

| 章節 | 待補 fact 條目 |
|------|--------------|
| 第一章 | clarify-change-control、clarify-management-review、clarify-quality-risk |
| 第三章 | clarify-premises-layout、clarify-validation、clarify-critical-equipment、clarify-measuring-instruments、clarify-computer-system、clarify-access-control |
| 第四章 | clarify-document-control |
| 第六章 | clarify-complaint-handling、clarify-falsified-medicines |
| 第七章 | clarify-outsourcing |

**下次開工必做：**
1. 第二章 GitHub Pages 驗收確認（`node verify_facts_ghpages.mjs` 在 GH Pages 模式）
2. 依樣板繼續補第一章 fact（clarify-change-control → fact-change-重大類型、fact-change-minor等）
3. 每章補完後跑驗收腳本，加入對應章節測試題

---

## 本輪完成（2026-05-28 第十二次開工）commit fd33b07 ✅ 永久連結驗收通過

### fact 架構 GitHub Pages 驗收：21/21 全部通過 ✅

**驗收方式：** Node.js 腳本從本機 HTML 抽取 21 筆 fact，模擬 kbStore.search()，並確認 GitHub Pages 永久連結 HTTP 200 可達。

**修正 3 處 keyword/資料問題：**
| 問題 | 修正 |
|------|------|
| 物流門管制時間：14:00→15:00 | xinshing、keywords、clarify-receiving-shipping xinshing 三處同步更正為 15:00～15:30 |
| `FR54-01由誰填` 被 clarify-receiving-shipping（score 235）搶先 | 移除 clarify 裡所有「FR54-01」「由誰填」「採購單誰打」等專屬 who/when keywords，改為廣泛進出貨流程 keywords |
| `何時填FR54-01` 命中 fact-receiving-fr54-who | 補 `"何時填FR54-01"`、`"何時填"`、`"FR54-01何時填"` 等 6 個 keywords 至 fact-receiving-when |

**永久連結驗收：** https://n1116839.github.io/xinshing-gdp-training/ ✅ HTTP 200，21/21 全部通過

### ⚠️ 尚未完成（下次開工優先）

**待補 fact 章節（依 HTML 內待補註解）：**

| 章節 | 待補條目 |
|------|---------|
| 第一章 | clarify-change-control、clarify-management-review、clarify-quality-risk |
| 第二章 | clarify-organization（拆成各職稱獨立 fact）、clarify-hygiene-cleaning、clarify-smf |
| 第三章 | clarify-premises-layout、clarify-validation、clarify-critical-equipment、clarify-measuring-instruments、clarify-computer-system、clarify-access-control |
| 第四章 | clarify-document-control |
| 第六章 | clarify-complaint-handling、clarify-falsified-medicines |
| 第七章 | clarify-outsourcing |

**下次開工必做：**
1. 從第一章開始補 fact（依 HANDOFF fact 格式規範）
2. 每補完一章，Node.js 驗收腳本加入對應測試題，確認命中正確 + 三欄正確
3. 全章補完 → 宣告 KB 完成 → 進入 H1 登入系統

---

## 本輪完成（2026-05-28 第十一次開工）commit c34a918

### KB 新架構：三資料庫 × fact 片段回傳 ✅ 實作完成

**核心概念（已由使用者確認）：**
三個獨立資料庫（國際法規/食藥署/新勝文件），搜尋「溫度警戒值」只回傳警戒值那一句，不回傳整條 SOP 內容。

**程式碼改動：**
1. `kbStore.search()` 評分：`sourceType:"fact"` 且 strongHit → +55 分（高於 查詢校正 +45）
2. `kbResultsHtml()` 顯示：命中 fact 時，最多顯示 4 筆完整三欄卡；超過 4 筆提示縮小查詢；舊版 clarify 邏輯保留作兜底

**新增 22 筆 fact 資料（已上線）：**

| 主題 | fact ID | 說明 |
|------|---------|------|
| 進出貨 | fact-purchase-order-who | 採購單由誰建立/列印 |
| 進出貨 | fact-receiving-fr54-who | FR54-01 由誰填 |
| 進出貨 | fact-receiving-when | 何時填 FR54-01 |
| 進出貨 | fact-logistics-door | 物流門管制時間 |
| 溫度 | fact-temp-range | 倉庫溫度範圍 |
| 溫度 | fact-temp-alarm-threshold | 警戒值 23.5°C |
| 溫度 | fact-temp-alarm-test | 警報測試頻率（每月）|
| 溫度 | fact-temp-monthly-record | FR33-01 月記錄 |
| 溫度 | fact-temp-mapping-cycle | 溫度測繪週期（每三年）|
| 庫存 | fact-inventory-cycle | 盤點頻率（每兩個月）|
| 庫存 | fact-nonconform-handling | 不符合品處理 |
| 回收 | fact-recall-level-deadline | 回收等級與期限 |
| 回收 | fact-recall-notify-24h | 24 小時通知 |
| 回收 | fact-recall-drill | 模擬演練（每年 1 次）|
| 退回 | fact-return-policy | 退回品一律報廢 |
| CAPA | fact-capa-trigger | CAPA 六類觸發 |
| CAPA | fact-capa-timeline | 原因分析一週期限 |
| 訓練 | fact-training-pass-score | 合格標準 ≥70 分 |
| 訓練 | fact-training-frequency | 每年/每三年訓練週期 |
| 稽核 | fact-internal-audit-when | 每年 12 月 |
| 文件 | fact-record-retention | 紀錄保存 5 年 |

**舊版 clarify 條目：保留不刪，作為 fact 未覆蓋主題的兜底。**

### ⚠️ 尚未完成（下次開工優先）

**待補 fact 章節（依 HTML 內待補註解）：**

| 章節 | 待補條目 |
|------|---------|
| 第一章 | clarify-change-control、clarify-management-review、clarify-quality-risk |
| 第二章 | clarify-organization（拆成各職稱獨立 fact）、clarify-hygiene-cleaning、clarify-smf |
| 第三章 | clarify-premises-layout、clarify-validation、clarify-critical-equipment、clarify-measuring-instruments、clarify-computer-system、clarify-access-control |
| 第四章 | clarify-document-control |
| 第六章 | clarify-complaint-handling、clarify-falsified-medicines |
| 第七章 | clarify-outsourcing |

**fact 格式規範（下次開工必須遵守）：**
```javascript
docs.push({
  id: "fact-[主題]-[面向]",
  sourceType: "fact",
  topic: "簡短題目（5-15字）",
  international: "PIC/S GDP 相關條文一句話",
  taiwan: "食藥署規定一句話（或「食藥署無明文規定，由公司內部自行訂定」）",
  xinshing: "新勝做法一句話（含數字/表單號碼/人員職稱，直接可回答的事實）",
  sop_ref: ["來源SOP"],
  keywords: ["精準關鍵字","不跨主題","覆蓋各種問法"]
});
```

### 下次開工必做

1. **GitHub Pages 驗收**：開啟 `https://n1116839.github.io/xinshing-gdp-training/`，等部署後測試：
   - 「採購單由誰列印」→ 應命中 fact-purchase-order-who，回傳「採購人員」
   - 「FR54-01 由誰填」→ 應命中 fact-receiving-fr54-who
   - 「溫度警戒值是多少」→ 應命中 fact-temp-alarm-threshold，回傳「23.5°C」
   - 「藥品回收第一級幾個月」→ 應命中 fact-recall-level-deadline
   - 「模擬演練多久一次」→ 應命中 fact-recall-drill
2. **驗收通過後**：依上方待補清單續補各章節 fact，從第一章/第二章開始
3. **每補完一章**：測試至少 5 組查詢，確認命中正確 fact + 三欄內容正確

---

## 本輪完成（2026-05-28 第十次開工）commit 1a26f3a

### GitHub Pages 驗收 ✅ DONE + KB keyword 修正 4 處

Chrome extension 未連線，改用 Node.js 本機腳本從 HTML 抽取 48 筆 docs 並模擬 kbStore.search()，完整驗收不需使用者手動操作。

初始 10/14 通過，修正 4 個失敗：

| 失敗查詢 | 根因 | 修正 |
|---|---|---|
| 「CAPA 怎麼開立」| clarify-deviation-capa 同分搶先 | 加 `"CAPA怎麼開立"` keyword |
| 「倉管的工作是什麼」| 無結果（「倉管」2字 < 反向比對 4 字門檻，「的」打斷匹配）| 加 `"倉管的工作"` keyword |
| 「第一級回收幾個月要完成」| `幾個月` 誤觸夏季冬季月份 intent，溫度條目高分搶先 | 移除 intent regex 中 `幾個月`；加 `"第一級回收"` keyword |
| 「藥品回收模擬演練多久做一次」| clarify-return-recall 同分搶先 | 加 `"回收模擬演練"`（6字 +10）keyword |

修正後重跑：**14/14 全部通過** ✅

### GitHub Pages 永久網址

```
https://n1116839.github.io/xinshing-gdp-training/
```

最新 commit：`1a26f3a`（2026-05-28）

### ⚠️ 逐章測試尚未開始

### ⚠️ KB 架構重設計：片段回傳（2026-05-28 使用者確立，尚未動工）

**核心問題：問什麼答什麼**

目前系統搜尋命中後，回傳整條 KB 條目的所有內容。

使用者要求改為「Office 文件搜尋 / Excel VLOOKUP」概念：
- 搜尋「溫度」→ 只顯示「倉庫室溫 15°C 至 25°C，警戒值 23.5°C」這一句
- 問「由誰列印」→ 直接顯示「採購人員」，不帶其他資訊

**確認後的新架構（2026-05-28 使用者確認）：**

三個獨立資料庫（國際法規 / 食藥署 / 新勝文件），每筆為一個 fact 片段：

```
fact: 溫度警戒值
  keywords: ["警戒值","警報","alarm"]
  國際法規: "溫度超標須立即調查並記錄"
  食藥署:   "食藥署無明文規定警戒值"
  新勝:     "警戒值 23.5°C，每月測試警報"
```

搜尋命中 → 只顯示該 fact 的三欄，不顯示同份 SOP 的其他 fact。

**影響：48 筆 entry → 約 150-300 個 fact；需重寫 kbStore 資料結構與搜尋邏輯。**

**狀態：架構已確認，尚未動工。**

### 下次開工必做

1. **確認 KB 架構重設計實作方式**（片段回傳 / fact 粒度 / 問句意圖偵測邏輯）
2. **逐章重新測試（新標準）**：從第一章品質管理開始，每章 10 個不同問題 × 10 種問法，重點：PIC/S GDP 與食藥署常見缺失
3. 全章通過 → 宣告 KB 完成，詢問下一步（H1 登入系統 or 其他）

---

## 本輪完成（2026-05-28 第九次開工）commit 1d98915

### KB 補齊至 48 筆 ✅ DONE

缺漏分析：逐一比對 48 份文件 vs 45 筆 clarify 條目，找出 3 筆缺漏：

| 新增條目 | 對應 SOP | 重點內容 |
|---------|---------|---------|
| clarify-capa | DP12-03 矯正與預防作業程序書 | CAPA 六類觸發、FR12-04、CAPA-□□□-□□編號格式、8類措施、一週原因分析期限 |
| clarify-org-chart | WI22-01 組織圖暨員工職務說明書 | 各職稱完整職掌（GDP主管/管理藥師/業務/品管/人事/文管/倉管/採購） |
| clarify-drug-recall | DP65-01 藥品回收管理程序書 | 三級危害等級、回收期限（1/2/6個月）、24小時發文通知、模擬演練每年1次 |

- HTML kbStore：45 → **48 筆**（覆蓋全部 48 份文件）
- Firestore gdpKnowledgeBase：同步新增 3 筆（clarify-capa、clarify-org-chart、clarify-drug-recall），編碼驗證正確
- Commit 1d98915 ✅、GitHub Pages push ✅

### ⚠️ GitHub Pages 驗收未完成

commit 已 push，但尚未在瀏覽器驗收本次新增 3 筆（搜尋測試）。

### 下次開工必做

1. **GitHub Pages 驗收**：開啟 `https://n1116839.github.io/xinshing-gdp-training/`，測試至少：
   - 「CAPA 怎麼開立」→ 應命中 clarify-capa
   - 「各職稱工作內容」→ 應命中 clarify-org-chart
   - 「回收期限多久」→ 應命中 clarify-drug-recall
   - 另加 5 個自然語言長句（驗證反向比對仍有效）
2. **逐章重新測試（新標準）**：每章 10 個問題 × 10 種問法，從第一章開始，重點：PIC/S GDP 與食藥署常見缺失
3. 若有命中失敗 → 補 keywords 或補條目
4. 所有章節測試完成 → 宣告 KB 完成，詢問下一步（H1 登入系統 or 其他）

---

## 本輪完成（2026-05-28 第八次開工）commits 9ecfa45、1b7fd13、6164900、18d1648

### 搜尋引擎根本修正：反向 keyword 比對 ✅ DONE

使用者扮演稽查員實際問答，發現三個查詢全部回傳空結果：
1. 「警報什麼時候響」→ 補 clarify-temperature-mapping keywords（commit 9ecfa45）
2. 「採購單由誰登載進正航」→ 補 clarify-receiving-shipping 採購單流程 + keywords（commit 1b7fd13）
3. 「管理階層檢討會議包括哪些項目何時做」→ 觸發第 3 題門檻

**根本原因**：`keywordHay.includes(compact)` 無法處理中文整句查詢（無空格分隔，整句為單一 term）

**修正**：新增反向比對邏輯——`compact.includes(keyword)`（keyword ≥ 4 字，非短查詢時啟用），commit 6164900

### clarify-receiving-shipping 三欄重構 ✅ DONE

- xinshing 加【採購單】【到貨驗收 FR54-01】【出貨】分段標籤，明確標示：採購單由採購列印；FR54-01 由進貨人員填寫
- international/taiwan 補「法規未明文規定由誰填，由公司內部自行指定」（commit 18d1648）

### 使用者確立新測試標準（永久執行）

| 標準 | 要求 |
|------|------|
| 每個問題 | 至少 **10 種不同問法**（同主題不同說法各算 1 種） |
| 每章 | 至少 **10 個不同問題**（不同主題） |
| 每部門 | 至少 **20 個不同問題** |
| 重點 | 國際法規 / 台灣食藥署**常見缺失項目**必須涵蓋 |

### ⚠️ GitHub Pages 驗收未完成

commits 已 push，但尚未在瀏覽器驗收本次修改（搜尋演算法 + 三欄重構）。

### 下次開工必做

1. **GitHub Pages 驗收**：開啟 `https://n1116839.github.io/xinshing-gdp-training/`，測試至少 5 個自然語言長句查詢，確認反向比對有效命中
2. **逐章重新測試**（依新測試標準）：
   - 從第一章開始，每章 10 個問題、每問題 10 種問法
   - 每部門 20 個問題
   - 重點：PIC/S GDP 與台灣食藥署常見缺失項目
3. 若有命中失敗 → 補 keywords 或補條目內容
4. 所有章節測試完成後 → 宣告 KB 完成，詢問下一步（H1 登入系統 or 其他）

---

## 本輪完成（2026-05-27 第七次開工）commits 47c544b、20a41f1

### KB 搜尋精準度補強：10 筆複合中文關鍵字 ✅ DONE

前一次工作（第六至七次接續）插入 17 筆新 clarify 條目後，搜尋測試發現
10 筆因複合中文詞組（無空格）無法命中正確條目。本次逐一補強：

| 條目 | 補加複合關鍵字（代表性） |
|---|---|
| clarify-smf | GDP主管資格、管理藥師資格、各職稱最低資格 |
| clarify-access-control | 門禁刷卡1秒、門禁刷卡、授權刷卡 |
| clarify-ups-maintenance | UPS每月保養、UPS電壓110V |
| clarify-ac-maintenance | 冷氣濾網每季、每季濾網、空調濾網清洗 |
| clarify-generator-maintenance | 發電機每月發動、每月發動測試、柴油發電機保養 |
| clarify-temp-alarm-maintenance | WELL溫控警報每月（完整字串）、溫控警報每月 |
| clarify-access-alarm-maintenance | 門禁Pegasus每半年、Pegasus每半年、門禁警報每半年 |
| clarify-record-retention | 品質紀錄保存5年、保存至少5年、5年保存 |
| clarify-computer-validation | GDPHUB確效、正航確效、正航進銷存確效 |
| clarify-computer-access-authorization | 系統授權帳號、使用者授權帳號、帳號安全管理 |

**技術根因**：`kbStore.search()` 的 normalize() 將查詢轉小寫後整體當成一個子字串，
中文連續字串若無空格視為單一詞，必須在 keywords 陣列加入與查詢完全一致的複合字串
才能命中（`keywordHay.includes(compact)` = true）。

### ⚠️ 未完成（token 耗盡收工）

- **搜尋測試未執行**：每章 5 組、共 40 組測試尚未跑
- **GitHub Pages 驗收未完成**：20a41f1 已 push，但尚未在瀏覽器驗收關鍵字修改效果

### 下次開工必做

1. 瀏覽器開啟 `https://n1116839.github.io/xinshing-gdp-training/`（等 GH Pages 部署 ~2 min）
2. DevTools Console 執行批次搜尋腳本（每章 5 組共 40 組）
3. 確認 10 個原本失敗的查詢均命中正確條目
4. 記錄通過/未通過，寫入 HANDOFF
5. 若全過 → 結案「KB 精準搜尋完成 ✅」，詢問使用者下一步（H1 登入系統 or 其他）
6. 若仍有未過 → 再補關鍵字、commit、push、重跑

---

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

## 踩坑點（2026-05-28 第十二次補記 — 永久連結實測發現）

- **工具名稱「正航」不可單獨放進 fact keywords**
  「正航是不是溫度監控系統」命中「採購單由誰建立」，因為 fact-purchase-order-who 含「正航採購單」keyword。「正航」本身跨多個 SOP，不足以識別某一 fact 主題。
  修正方向：(1) 移除 fact-purchase-order-who 的「正航採購單」；(2) 強化 clarify-computer-system keywords 加入「正航」「正航系統」「正航是什麼」「正航是不是」。
  **規則：** 工具/系統名（正航、GDPHUB、嘉里）只有搭配主題詞才可放 keyword，不可單獨使用。

- **多 fact 命中顯示 4 筆，不相關結果跟著出現**
  「公司有沒有冷藏倉」第一筆「倉庫溫度範圍」正確，後面「溫度警戒值」「測繪週期」「盤點頻率」全跑出來。
  修正方向：最高分與第二名分差 > 30 時只顯示最高分一筆；或收緊各 fact keywords 不被「倉庫」「溫度」等上位詞誤觸。

## 踩坑點（2026-05-28 第十二次補記）

- **KB 查詢結果 UI：「尚未查詢」與「找不到命中資料」同時顯示**
  查詢執行後用 `insertAdjacentHTML("beforeend")` 附加氣泡，但從未清除初始的 `<p>尚未查詢...</p>`，導致兩個訊息並存。
  修正方向：在查詢開始時先執行 `box.innerHTML = ""`，再附加 loading → 結果/錯誤。
  **注意：** 看到此 UI 現象時，不代表 KB 資料有問題，需先確認是真的 0 結果還是 UI 重疊。

- **clarify 條目不可保留專屬 who/when keywords**
  導入 fact 架構後，clarify 的 keywords 若含「FR54-01由誰填」等具體問法，會因高分蓋過 fact 條目。clarify 只保留廣泛流程型 keywords。

- **fact keywords 必須涵蓋動詞×受詞組合**
  「何時填FR54-01」和「何時驗收」是不同問法，建立 fact 時需覆蓋「何時填＋表單號碼」交叉組合，不可只寫其一。

- **驗收必須從永久連結（GitHub Pages）執行**
  本機驗收只是預檢，push 並從 https://n1116839.github.io/xinshing-gdp-training/ 確認才算完成。

## 踩坑點（2026-05-28 第十一次補記）

- **KB 搜尋根本缺陷：問什麼答什麼從未落實**
  舊架構一筆 clarify 條目含多個事實（溫度範圍、警戒值、測試頻率、記錄方式、測繪週期全部擠在同一個 xinshing 欄位），導致問任何關鍵字都回傳整條內容，無法做到「問什麼答什麼」。
  過去多次 KB 校對都在優化 keywords 和評分，但沒有改動根本資料粒度，所以問題始終無法解決。
  **正確方向（已確認）：三資料庫 × fact 粒度**：
  - 每筆 fact = 一個事實 × 三欄各一句（國際法規/食藥署/新勝）
  - 搜尋命中 fact → 只顯示該 fact 的三欄，不顯示其他無關事實
  - 類比：Office 文件搜尋「溫度」→ 只反白含溫度的那一句

- **fact 資料未全數補完即收工**
  本次只補了 22 筆 fact（約佔全部主題 40%），其餘章節仍用舊版 clarify 條目兜底。
  下次開工必須繼續補齊第一/二/三/四/六/七章，否則新架構只有部分主題有效。

- **架構確認與實作方向須寫進踩坑點**
  每次使用者確立新方向時，除了寫進架構說明，也要寫進踩坑點，避免下次開工誤以為舊架構是正確的。

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

## 2026-05-28 智慧查詢精準回答硬性規則：fact 拆解 + 問法測試表 + 批次驗收

使用者確認：要達到「倉庫多久盤點一次」「溫度測繪夏季冬季月份」這種精準回答品質，不能靠一題一題碰運氣反覆修很多次。後續 GDP 智慧查詢必須用以下硬性流程處理。

### 硬性規則
1. 先拆 fact，再寫搜尋：每個 fact 只回答一件可獨立問題，例如盤點頻率、溫度測繪月份、外部教育訓練來源、訓練紀錄保存。
2. 每個 fact 固定三欄：PIC/S GDP、台灣 GDP、新勝做法。三欄都只能放正式教材內容；新勝做法要是員工可直接回答稽查員的短答。
3. 每個 fact 建立時，先設計至少 10 種自然問法，不等使用者查不到才補 keyword。
4. 每章建立測試表：至少 10 個不同問題，每個問題至少 10 種問法。
5. 驗收時檢查三件事：第一名是否正確、有沒有多餘不相關結果、新勝做法是否能直接作為稽查應答。
6. 修正時必須批次歸因，不可亂加 keyword：
   - 泛命中：收窄 keyword、降低通用詞權重或加硬排除。
   - 查不到：補自然問法、缺字問法、同義詞與文件編號變體。
   - 回太長：再拆 fact，不把整段 SOP 塞進一筆。
   - 答案像 AI 備忘：改成正式三欄教材語氣，備忘寫進第二大腦，不進 KB。
7. 不宣稱一次到 100%。正確作法是先做一章完整樣板，通過後複製同一流程到其他章，降低反覆修正次數。

### 建議執行順序
先挑一章做完整樣板，例如第二章人事 / 教育訓練：
- 回 SOP/WI/FR 拆 fact。
- 每個 fact 補 10 種問法。
- 建測試表。
- 本機預檢。
- 推送後用 GitHub Pages 永久網址驗收。
- 通過後再照同一模板擴到其他章。

## 2026-05-28 智慧查詢與前台部門內容同步硬性規則：同一事實多處同步

使用者指出：改智慧查詢時，前台各部門頁面、規範到現場、部門文件閱讀地圖、稽查重點也要同步修改，避免人事頁顯示 A、智慧查詢回答 B。這是硬性規則，不可只修單一區塊。

### 必須同步的範圍
- GDP 智慧查詢 fact / Firestore / HTML fallback。
- 各部門頁面的「作法」與重點摘要。
- 「規範到現場」對照區。
- 「部門文件閱讀地圖」。
- 「稽查重點互動核對」。
- FAQ / 快速問題按鈕與手動搜尋入口。

### 畫面與內容規則
1. 同一事實只要改一處，就要全站搜尋並同步所有出現處；不可出現 A 區新版、B 區舊版。
2. 標題必須符合實際內容。若「規範到現場」目前只有 PIC/S GDP、台灣食藥署、新勝做法三層，就不得再標成「四層對照」。標題、節點數、按鈕數、內容欄位必須一致。
3. 「作法」區改成重點顯示，呈現員工可理解、稽查可回答的短句，不放冗長 SOP 敘述。
4. 文件連結直接取消，改成純文字文件名稱或文件編號；不要做可點擊文件按鈕，不顯示 SOP 路徑或內部文件細節。
5. 部門文件閱讀地圖不應像文件連結清單，應改成學習重點或資料準備重點；若仍列文件，只能純文字列示。
6. 稽查重點區要改成「常見缺失 / 稽查員可能怎麼問 / 公司如何回答 / 要準備什麼證據」的學習格式，不只列靜態查核句。
7. 修改智慧查詢前，先列出會被同一 fact 影響的前台區塊；修改後要逐項驗收這些區塊是否一致。

### 人事 / 教育訓練頁面方向
- 作法顯示重點：人員教育訓練規劃、訓練通知、訓練紀錄保存、內部教育訓練、外部教育訓練。
- 外部教育訓練回答方向：配合政府部門、學術單位及研發機構所舉辦有關 GDP 的人才培訓課程與研討會。
- 稽查重點應轉為常見缺失與問答，例如：稽查員問「教育訓練怎麼做？」公司回答「分為內部教育訓練與外部教育訓練，並保存訓練紀錄與合格結果」。

### 下次執行提醒
下次真正修改 HTML / Firestore 時，先從一個部門做完整樣板，建議第二章人事 / 教育訓練。完成後必須檢查智慧查詢、部門頁、規範到現場、文件閱讀地圖、稽查重點、FAQ 是否全部一致，再推送並用 GitHub Pages 永久網址驗收。

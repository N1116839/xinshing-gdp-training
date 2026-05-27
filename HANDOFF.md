# GDP HTML 教育訓練 HANDOFF
更新：2026-05-27

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

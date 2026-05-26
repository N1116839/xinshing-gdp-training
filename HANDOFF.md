# GDP HTML 教育訓練 HANDOFF
更新：2026-05-26

## 目前狀態
- 分支：codex/gdp-html-training-pages
- 最新 commit：3bf2f34
- GitHub Pages：https://n1116839.github.io/xinshing-gdp-training/
- Firebase：xinshing-gdp-training-20260525（Firestore rules 已部署）

## 本次已完成
1. GDP 知識庫 Q&A：kbStore 關鍵字搜尋 + Firestore gdpKnowledgeBase + 三層回覆 UI
2. 行事曆打勾 Firebase 即時同步（calendarStatusStore.subscribe + onSnapshot）
3. pagePills 重複修正：部門頁有 documentMap 時 hero pills 自動隱藏
4. 流程視覺化：deptFlowSwipe() 互動 swipe panel，取代靜態 dept-flow
5. CAPA 共同處理閉環改用 deptFlowSwipe
6. KB Q&A 冗餘文字清除（lead / panel 說明 / 更新者 meta）
7. Firestore 內容錯字修正（2026-05-26）：
   - document-retention：現実→現行、保存期满→保存期滿、換第→換廠、蒲毀→銷毀
   - document-retention keywords 新增「文件要保存」→ 快速按鈕查詢恢復正常
   - training-requirements：崇能門溺→合格門檻、再訓罰→再訓練、測驗門檻統一 70 分
   - complaint-handling：偧假袽袽/偐假袽機兢則（亂碼）→ 正確繁中、業務接包→接獲

## 下次待辦（使用者明確要求，按優先順序確認後再動工）

**A. 規範到現場四層對照 → 新勝參考資料可點擊但無動作**
- 問題：standardsSwipe docs tab 的 doc-pill-card 沒有 data-doc 屬性，bindDocButtons() 無法綁定
- 修法：解析 SOP 編號（/[A-Z]{2}\d{2}-\d{2}/）從 item text 萃取，加上 data-doc 屬性並套 openDoc()
- 同樣問題：standardsSwipe company tab 的 company-action-card 亦無點擊

**B. 部門文件閱讀地圖 — 文件列表只能看不能點**
- 問題：documentMapSection() 的 `<li>` 只顯示文字，無點擊行為
- 修法：將每個文件名稱解析出 SOP 編號，渲染為可點擊的 pill button（data-doc 觸發 openDoc）

**C. GDP 智慧查詢 — Firestore KB 必須覆蓋 sopLibrary 全部 33 份文件**
- 使用者要求：資料夾有多少文件，知識庫就要有多少條目（一份 SOP = 一筆 KB 文件）
- 現有 10 筆（inventory-cycle, temperature-monitoring, supplier-qualification, drug-recall,
  expiry-date-management, deviation-management, complaint-handling, training-requirements,
  internal-audit, document-retention）
- 待補齊 23 筆（對照 sopLibrary）：
  DM10-01, WI10-01, DP12-01, DP12-03(CAPA), DP12-04(變更), DP14-01(管審),
  DP15-01(風險), DP22-01(組職), DP25-01(人員衛生), DP25-02(病媒),
  DP32-01(場所規劃), DP34-01(關鍵設備), DP34-02(量測儀器), DP35-01(電腦化系統),
  DP36-01(確效), DP42-01(文件管制), DP53-01(客戶認可), DP54-01(進出貨),
  DP56-01(廢棄物), DP57-01(訂單揀貨), DP63-01(退回品), DP64-01(偽禁仿冒),
  DP72-01(委外), WI25-01(門禁)
- 每筆格式：topic, keywords[], international, taiwan, xinshing, sop_ref[]
- 內容依據：sopLibrary 內各文件的 content[] 陣列（已有中文摘要可直接參考）

**D. 全站互動性升級** — 使用者不滿意現有流程頁視覺化：
- Scroll fade-in：元素進入畫面時滑入顯現
- Hover 微互動：按鈕/卡片 hover 陰影與顏色過渡加強
- 點擊 ripple：按鈕點擊時的波紋/下陷動畫
- 流程步驟（執行流程/處理流程/認可流程）點擊展開詳情
- 稽查重點互動核對：視覺化豐富化
- 稽查時最常看的證據鏈：hover tooltip 或動畫展開

**E. 未完成的待辦**
- 重複區塊整合（各部門頁面中重複出現的行事曆/表單區塊）
- Firestore 其餘文件亂碼核對（internal-audit 等）

## 踩坑點
- git packed-refs.lock 警告：無害，commit 仍成功，忽略即可
- HANDOFF 待辦清單裡的項目，每次都要先問使用者要從哪一項開始，不可自行決定
- UI 裡不可放「資料由公司人員定期更新」「更新者：system」等 meta 說明文字
- pagePills 在有 departmentDocumentMaps 的頁面已隱藏；不需在兩處顯示同樣文件
- kbSection 用 panel() 直接放入 .grid，不可用 kb-wrap 包裝（會縮成 1 欄）
- KB 快速按鈕 keyword 匹配：按鈕 data-q 的完整字串必須是 keyword 的超字串（.includes()）
  例如「文件要保存幾年」含"要"，原 keyword"文件保存"無法命中 → 要在 Firestore 加 "文件要保存"
- Firestore seed data 有 AI 生成亂碼（如「偧假袽袽」「崇能門溺」）需人工核對所有欄位

## 環境
- 主檔：G:\我的雲端硬碟\2026codex\AI測試\gdp_internal_training.html
- Firebase rules：G:\我的雲端硬碟\2026codex\AI測試\firestore.rules
- 預覽 server：npx serve -p 3333（launch.json 已設定）

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

## 下次待辦（使用者明確要求，按優先順序確認後再動工）
**A. 全站互動性升級** — 使用者不滿意現有流程頁視覺化，要求加入：
- Scroll fade-in：元素進入畫面時滑入顯現
- Hover 微互動：按鈕/卡片 hover 陰影與顏色過渡加強
- 點擊 ripple：按鈕點擊時的波紋/下陷動畫
- 流程步驟（執行流程/處理流程/認可流程）點擊展開詳情（取代或補充現有 swipe）
- 稽查重點互動核對：視覺化豐富化
- 稽查時最常看的證據鏈：hover tooltip 或動畫展開

**B. 未完成的待辦（確認優先順序後再做）**
- 重複區塊整合（各部門頁面中重複出現的行事曆/表單區塊）

## 踩坑點
- git packed-refs.lock 警告：無害，commit 仍成功，忽略即可
- HANDOFF 待辦清單裡的項目，每次都要先問使用者要從哪一項開始，不可自行決定
- UI 裡不可放「資料由公司人員定期更新」「更新者：system」等 meta 說明文字
- pagePills 在有 departmentDocumentMaps 的頁面已隱藏；不需在兩處顯示同樣文件
- kbSection 用 panel() 直接放入 .grid，不可用 kb-wrap 包裝（會縮成 1 欄）

## 環境
- 主檔：G:\我的雲端硬碟\2026codex\AI測試\gdp_internal_training.html
- Firebase rules：G:\我的雲端硬碟\2026codex\AI測試\firestore.rules
- 預覽 server：npx serve -p 3333（launch.json 已設定）

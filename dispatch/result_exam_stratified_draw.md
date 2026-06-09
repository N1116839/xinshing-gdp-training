# 測試專區抽題分層派工結果

## 完成狀態
部分由 OpenCode 產生初稿，最終由 Codex 本機審查與補強完成。

## OpenCode 執行情形
- OpenCode/NVIDIA smoke test 成功，可建立 `result_smoke_暫存.md`。
- 正式任務 `dispatch/task_exam_stratified_draw.md` 兩次執行皆逾時，未寫出 `dispatch/result_exam_stratified_draw.md`。
- 第二次逾時前曾修改 `HTML資料庫/新勝GDP資料庫.html` 的 `buildQuestions` 函式。
- Codex 已停止逾時的 `opencode` 程序，未留下背景派工。

## Codex 審查與補強
審查 `git diff` 後，OpenCode 修改範圍集中在 `buildQuestions`，未碰題目內容、KB facts、部門頁或來源資料夾。

Codex 本機補強：
- 增加 `questionSource(q)`，避免題目缺 `source` 時崩潰。
- `isCommon(q)` 改用安全字串判斷 DM10-01 / WI10-01。
- `isGov(q)` 增加政府公開缺失相關關鍵詞。
- 年度測驗若有政府公開缺失題且題數大於 1，會保留 1 題名額給政府公開缺失題。
- 共同基礎題、各專業文件來源與剩餘隨機補題仍維持不重複抽題。
- 保留既有 `options[0]` 為資料層正解的慣例，考生看到的選項仍由既有洗牌邏輯產生。

## 驗收
- `JS_PARSE_OK 1` 通過。
- `node verify_facts_ghpages.mjs`：`1296/1296` 通過，0 失敗。
- 待補：本機抽題來源統計檢查（不輸出題目全文）。

## 注意
本任務沒有核對任何 SOP 原文，也沒有新增或修改題目內容。275 題逐題答案回 SOP 核對仍需本機處理，不可派 NVIDIA 雲端模型。

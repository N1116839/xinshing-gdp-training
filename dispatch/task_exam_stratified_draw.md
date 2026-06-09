# 任務：測試專區抽題改分層（非敏感程式結構）

## 目標
修改 `HTML資料庫/新勝GDP資料庫.html` 的測試專區抽題邏輯，讓每次測驗不是單純隨機 slice，而是依來源類型與 SOP 文件分層抽題。

## 安全邊界
- 本任務只處理程式結構，不核對 SOP 原文，不新增題目，不修改題目文字、選項、答案或解析。
- 不要讀取第一章至第八章來源資料夾。
- 不要整理、引用、輸出任何 SOP 原文。
- 不要修改 `examTemplates.*.draftQuestions` 題目內容。
- 不要修改公司部門頁、KB facts、年度行事曆、Firebase 設定。

## 允許修改範圍
只允許修改測試專區抽題相關函式，優先查找並修改：
- `function buildQuestions(...)`
- 與其直接相關的 helper（若需要可新增小型 helper）

嚴禁格式化整個 HTML 或重排無關區塊。

## 現況問題
目前 `buildQuestions` 疑似是將題庫洗牌後直接 slice，可能造成：
- 共同基礎 DM10-01 / WI10-01 沒抽到。
- 某個 roleDocs 專業 SOP 完全沒抽到。
- 政府公開缺失題在年度測驗中不一定出現。
- 新人測驗與年度測驗只差題數，來源層次不夠穩定。

## 規格
1. 保持既有資料慣例：`options[0]` 是資料層正解。考生看到的選項仍需洗牌，不能破壞既有 correctIndex 邏輯。
2. 分層抽題建議：
   - 將題目依 `sourceDoc` / `sourceDocs` / `sourceBlock` / `topicType` / 題目既有欄位可判斷的來源分組。
   - 共同基礎題（DM10-01 / WI10-01 / commonDocs 相關）至少抽到。
   - 每個 roleDocs 專業 SOP 原則上至少 1 題；若測驗題數小於 SOP 數，則以洗牌後輪替抽取，不得超出題數。
   - 年度測驗若題庫中有政府公開缺失或公開查核重點題，至少抽 1 題。
   - 剩餘名額從未抽題目中隨機補足。
3. 題目總數仍需符合既有新人/年度題數設定。
4. 不可重複抽同一題。
5. 保持既有回傳資料 shape，不破壞作答、計分、列印。

## 驗收
修改後執行：
- `node -e` 檢查 HTML script `new Function()`，需輸出 `JS_PARSE_OK 1`。
- 若可行，寫一段本機 Node 檢查，不輸出題目全文，只輸出每個職責新人/年度抽題來源統計，例如 common / roleDocs / gov count。

## 輸出要求
完成後寫入 `dispatch/result_exam_stratified_draw.md`：
- 完成狀態
- 修改了哪些函式
- 分層邏輯摘要
- JS 語法檢查結果
- 是否有無法完成或需 Codex 本機接手處

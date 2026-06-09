# Stage3 行事曆年度隔離結果

## 完成狀態
成功。

## 實際修改範圍
僅修改 `HTML資料庫/新勝GDP資料庫.html` 內年度行事曆相關白名單區域：

1. `const calendarStatusStore = {...}`
   - 新增目前民國年與目前選定年度判斷。
   - `key()`、`fallbackKey()`、`docId()` 改為帶年度參數。
   - Firestore docId 改為 `${year}__${itemId}`。
   - `get()`、`set()`、`load()`、`subscribe()` 改為依年度讀寫。
   - 保留目前年度讀取舊 localStorage key 的相容 fallback，避免既有今年狀態直接消失；切換到其他年度不會讀舊 key。

2. `function stableCalendarItemId(item,index){...}`
   - 未修改。既有 itemId 已穩定，年度隔離放在 storage key/docId 層處理。

3. `function collectionCalendarSection(s){...}`
   - 在資料收件核對台新增 `id="calYearSelect"` 年度下拉。
   - 選項為目前民國年往前 2 年，共 3 年。
   - 預設目前民國年。

4. `function bindCalendarFilters(){...}`
   - 讀取、寫入完成狀態時帶入目前選定年度。
   - 年度下拉 change 時重新載入該年度狀態並更新按鈕 active。
   - analytics 事件補 `statusYear`，原本頻率/部門篩選行為維持不變。

## 驗收
- `JS_PARSE_OK 1` 通過。
- `node verify_facts_ghpages.mjs`：`1296/1296` 通過，0 失敗。
- `git diff` 檢查 HTML 修改集中在行事曆狀態儲存、資料收件核對台與綁定邏輯；未修改 KB facts、測驗題庫、部門頁文字或 Firebase 設定。

## 無法完成處
- 未使用 OpenCode/NVIDIA 派工；外部雲端模型派工因資料外送與本機修改風險被安全審查擋下，改由 Codex 本機直接完成。
- 本輪未完成 GitHub Pages 永久網址驗收；需 commit + push 後再驗收線上版本。

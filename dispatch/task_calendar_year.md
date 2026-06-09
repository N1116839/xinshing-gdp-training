# 任務：年度行事曆完成狀態加上「民國年度」隔離

## 目標
讓 `HTML資料庫/新勝GDP資料庫.html` 的「年度資料收件行事曆」每筆項目的「已完成/未完成」狀態**依民國年度分開儲存**，並加一個年度切換器。使用者今年標「已完成」，明年打開時該年度應回到「未完成」（不沿用去年狀態）。

## 背景（現況）
目前完成狀態的 localStorage key 與 Firestore docId 都**不含年度**，所以週期性項目（每年內稽、每月溫度…）今年標完成、明年仍顯示完成，造成誤判。

## 只能改這些（嚴禁改動其他任何內容）
**白名單——只准修改下列 4 個函式/物件，其他一律不准動：**
1. `const calendarStatusStore = {...}`（約第 1490 行起）
2. `function stableCalendarItemId(item,index){...}`（約第 3657 行）
3. `function collectionCalendarSection(s){...}`（約第 4164 行）
4. `function bindCalendarFilters(){...}`（約第 5671 行）

**絕對禁止：**
- 不准改任何 `docs.push(...)` 知識庫 fact 資料。
- 不准改 `examTemplates`、`sections` 陣列、任何部門頁文字、KB、Firebase 設定。
- 不准重排版、不准格式化整個檔案、不准刪註解。
- 不准把檔案編碼改成含 BOM；存檔維持 UTF-8 無 BOM、不要改既有換行。

## 規格
1. 新增當前民國年：`const rocYear = new Date().getFullYear() - 1911;`（放在 calendarStatusStore 可取用處）。
2. `calendarStatusStore` 的 `key(itemId)`、`docId(itemId)`、`fallbackKey(index)`、Firestore 路徑都要**帶入年度參數**，例如 `key(itemId, year)` 回傳 `gdp-calendar-status-${year}-${itemId}`；Firestore docId 改 `${year}__${itemId}`。`get/set/load` 都要多收一個 `year` 參數，預設用目前選定年度。
3. `collectionCalendarSection(s)` 在「資料收件核對台」標題列或篩選列旁，新增一個**年度下拉選單**：選項為「目前民國年 rocYear」往前 2 年共 3 個年度（例：115、114、113），預設選 rocYear。下拉加 `id="calYearSelect"`。
4. `bindCalendarFilters()`：
   - 讀取目前選定年度（預設 rocYear）。
   - 完成狀態的讀取/寫入都帶入選定年度。
   - 年度下拉 change 時，重新依該年度載入每筆狀態並更新按鈕 active（不重整頁面）。
5. 維持所有既有行為（freq 篩選、部門篩選、KPI、Firestore 同步、analytics log）不變，只是多了年度維度。

## 輸出要求
- 直接修改 `HTML資料庫/新勝GDP資料庫.html`。
- 改完後自我檢查：用 `node -e` 把所有 `<script>` 內容丟進 `new Function()` 確認**無語法錯誤**（忽略 firebase/import/export 類訊息）。
- 把結果摘要寫進 `dispatch/result_calendar_year.md`：完成狀態（成功/失敗）、實際改了哪幾個函式、各做了什麼、JS 語法檢查是否通過、有無無法完成處。

## 注意事項
- 這是公司教育訓練平台的關鍵單一檔案，改壞會整站失效。改動要**外科手術式最小化**，只動白名單函式。
- 不需要、也不准把任何公司 SOP 內文或表單內容寫進結果檔。

# Project Instructions
> 任何 AI agent 開始工作前必讀。此為四台電腦、四個 AI 共用的唯一開工入口。
> 最後更新：2026-05-26

---

## 專案現況

| 項目 | 值 |
|------|-----|
| 專案名稱 | 新勝醫藥 GDP 內訓 HTML 資料庫 |
| 本機路徑 | `G:\我的雲端硬碟\2026codex\AI測試` |
| 主要交付物 | `HTML資料庫/新勝GDP資料庫.html` |
| GitHub Repo | `https://github.com/N1116839/xinshing-gdp-training` |
| GitHub 分支 | `codex/gdp-html-training-pages` |
| 永久網址 | `https://n1116839.github.io/xinshing-gdp-training/` |
| Firebase 專案 | `xinshing-gdp-training-20260525` |
| Git 使用者 | N1116839 |

**✅ PPT 合規簡報已完成**：`新勝醫藥_GDP合規簡報_v11_final.pptx`（共 17 頁），不需要再修改。

---

## 開工必讀（每次開工、專案繼續、換電腦都必須讀）

**按順序讀完，才能動手做任何事：**

1. **`HANDOFF.md`**（本資料夾）
   → 目前 Git 狀態、Firestore 狀態、待辦事項優先順序與踩坑點

2. **`G:\我的雲端硬碟\我的第二大腦\踩坑紀錄.md`**
   → 全域長期規則、已知錯誤模式與下次避免方式

3. **`G:\我的雲端硬碟\我的第二大腦\專案\2026codex AI測試.md`**
   → 專案完整歷程、決策紀錄與收工補記

讀完三個文件，再由使用者指定從哪一個待辦項目開始，不可自行決定。

---

## 資料夾結構

| 資料夾 | 用途 | 備註 |
|--------|------|------|
| `HTML資料庫/` | 新勝 GDP 資料庫網頁 | 主要工作區 |
| `簡報資料/` | PPT 簡報與輸出 | 已完成，勿覆蓋 |
| `Firebase設定/` | firestore.rules、sync 腳本 | 部署前確認 |
| 第一章至第八章 | 原始 SOP / WI / FR 文件 | 唯一依據，勿修改 |

---

## Firebase 狀態（2026-05-26 最新）

- Firestore rules：**已部署**（gdpDocStats, gdpUsageEvents, gdpUserStats, gdpQuestionStats, gdpRegulationReview）
- Firestore KB（`gdpKnowledgeBase`）：目前 71 筆，來自 52 個來源檔（2026-05-26 最後同步，排除 HTML/README/HANDOFF 非訓練來源）
- 使用者已授權：指定「上傳 github」「更新第二大腦」「使用 Firebase/Firestore」時，可直接執行，不需再問一次

---

## GitHub 狀態（2026-05-26 最新）

- 最後 push commit：`896d03b 修正 GDP 查詢盤點與溫度依據`
- Pages build：成功，永久網址已反映 896d03b 內容
- 只改 HTML/CSS/JS 搜尋邏輯時，必須 commit + push 永久網址才會生效
- 只改 Firestore 資料時，永久網址即時反映，不需推 GitHub

---

## 核心規則（違反即為錯誤，需立刻修正）

1. **KB 欄位只放教材內容**
   - `international` 欄：只放 PIC/S GDP 規範說明
   - `taiwan` 欄：只放台灣 GDP（西藥優良運銷準則）規範要求
   - `xinshing` 欄：只放新勝醫藥正面事實性作業描述
   - **嚴禁**：「不可寫成…」「目前資料索引…」「此筆來自…」等 AI 指令語

2. **資料必須可追溯 SOP/WI/FR 原文**
   - 不可自行推論、補充文件上沒有的事項
   - 有新舊版本時，以資料夾內較新的文件為主
   - 若目錄與 SOP 有出入，列出差異讓使用者確認

3. **公司無冷藏倉**
   - 所有 KB 與 HTML 不可出現冷鏈、冷藏倉、冷藏庫相關描述

4. **非訓練來源不可進入 KB**
   - 同步腳本排除：HTML 本身、README、HANDOFF、AGENTS、index 與 Firebase 設定檔

5. **收工必做四件事**
   - 更新 `HANDOFF.md`（記錄本輪狀態與下輪待辦）
   - 更新第二大腦踩坑紀錄與專案 note
   - `git commit`
   - `git push`（永久網址才會生效）

---

## 待辦事項（詳見 HANDOFF.md）

| 優先 | 項目 | 狀態 |
|------|------|------|
| 最高 | KB-1：clarify-* 條目台灣/新勝欄含指令語 | ❌ 未修 |
| 高 | C：KB 待補 18 筆三階回覆條目（DM10-01 等） | ❌ 未完成 |
| 高 | F：KB 全量逐章逐題校對（每章 ≥5 題，回 SOP 核對） | ❌ 長期工作，未完成 |
| 中 | 統計：問題排行榜/熱門文件/季度追蹤無有效資料 | ❌ 未確認 |
| 中 | D：全站互動性升級（稽查重點 checkbox、scroll fade-in 等） | ❌ 回退待重做 |
| 中 | E：重複區塊整合（三處文件清單、時程） | ❌ 未做 |
| 低 | eyebrow 字體 16px → 18px | ❌ 回退 |

**重要提醒：待辦順序由使用者決定，每次開工先詢問要從哪項開始。**

---

## 技能（Skills）同步

| 技能 | 用途 |
|------|------|
| `startup-sync` | 開工讀第二大腦與狀態 |
| `shutdown-sync` | 收工更新第二大腦、commit、push |
| `html-training-deck` | HTML 內訓教材製作規則 |
| `html-evidence-training-builder` | GDP KB 可追溯資料模型 |

- **Canonical 路徑**：`G:\我的雲端硬碟\我的第二大腦\Codex標準\skills`
- **換電腦安裝**：從 Canonical 路徑複製到 `%USERPROFILE%\.codex\skills`
- **GitHub 懶人包**：`https://github.com/N1116839/codex-skills-lazy-pack`

---

## 已知環境限制

- PowerShell 5.1 環境；`python` / `py` 不可用
- Bash tool 可用但路徑需帶完整絕對路徑
- 中文路徑用 UTF-8 儲存，避免亂碼
- Obsidian MCP 中文路徑有時亂碼，改用 Read tool 直接讀寫第二大腦

---

## 智慧查詢精準回答硬性規則（2026-05-28）

使用者確認：要達到「倉庫多久盤點一次」「溫度測繪夏季冬季月份」這種精準回答品質，不能靠一題一題碰運氣反覆修很多次。後續 GDP 智慧查詢必須用以下硬性流程處理。

1. **先拆 fact，再寫搜尋**
   - 每個 fact 只回答一件可獨立問題，例如盤點頻率、溫度測繪月份、外部教育訓練來源、訓練紀錄保存。

2. **每個 fact 固定三欄**
   - PIC/S GDP
   - 台灣 GDP
   - 新勝做法
   - 三欄都只能放正式教材內容；新勝做法要是員工可直接回答稽查員的短答。

3. **每個 fact 先設計問法**
   - 建立時先設計至少 10 種自然問法，不等使用者查不到才補 keyword。

4. **每章建立測試表**
   - 每章至少 10 個不同問題。
   - 每個問題至少 10 種問法。

5. **驗收標準**
   - 第一名是否正確。
   - 有沒有多餘不相關結果。
   - 新勝做法是否能直接作為稽查應答。

6. **修正必須批次歸因，不可亂加 keyword**
   - 泛命中：收窄 keyword、降低通用詞權重或加硬排除。
   - 查不到：補自然問法、缺字問法、同義詞與文件編號變體。
   - 回太長：再拆 fact，不把整段 SOP 塞進一筆。
   - 答案像 AI 備忘：改成正式三欄教材語氣，備忘寫進第二大腦，不進 KB。

7. **不宣稱一次到 100%**
   - 正確作法是先做一章完整樣板，通過後複製同一流程到其他章，降低反覆修正次數。

建議先從第二章人事 / 教育訓練做完整樣板：回 SOP/WI/FR 拆 fact、每個 fact 補 10 種問法、建立測試表、本機預檢、推送後用 GitHub Pages 永久網址驗收，通過後再照同一模板擴到其他章。

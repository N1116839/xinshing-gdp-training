# Claude Code 開工指示
> 此為 Claude Code 專用版開工指示，與 AGENTS.md 同步。
> 最後更新：2026-05-28

---

## 你正在工作的專案

這是**新勝醫藥 GDP 內訓 HTML 資料庫**，不是 PPT 簡報（PPT v11_final 已完成，不需再動）。

- 主要工作區：`HTML資料庫/新勝GDP資料庫.html`
- 永久網址：`https://n1116839.github.io/xinshing-gdp-training/`
- Firebase：`xinshing-gdp-training-20260525`（Firestore rules 已部署）
- GitHub 分支：`codex/gdp-html-training-pages`

---

## 開工必讀（每次對話開始都必須讀，缺一不可）

**按順序讀完，才能動手做任何事：**

1. `HANDOFF.md`（本資料夾）
   → 上次做到哪、下次必做什麼、目前 commit hash

2. `G:\我的雲端硬碟\我的第二大腦\踩坑紀錄.md`
   → 長期規則、已知錯誤模式

3. `G:\我的雲端硬碟\我的第二大腦\專案\2026codex AI測試.md`
   → 專案整體方向與決策記錄

4. `GDP_智慧查詢規範.md`（本資料夾）← 2026-05-28 新增為必讀
   → 平台設計規範全文（40章）
   → fact架構、三欄標準、知識安全邊界（Layer 1/2/3）、常見缺失來源規則、
      三階段開發藍圖（Phase 1→2→3）、帳號審核設計、資料庫維護機制
   → 不讀此文件 = 不知道所有設計規則，必然重複踩坑

讀完後，詢問使用者要從哪個待辦項目開始，**不可自行決定**。

---

## 絕對禁止

- KB 欄位（international / taiwan / xinshing）放 AI 指令語、備忘、校正提示
- 資料庫同步時把 HTML 本身、README、HANDOFF 放入 KB
- 出現「冷藏倉」「冷鏈」相關描述（公司無冷藏倉）
- 收工時只口頭說收工，不 commit + push + 更新 HANDOFF + 更新第二大腦
- KB「常見缺失」由 AI 自行推測（必須來自 PIC/S 或食藥署公開稽查資料）
- Phase 1 未完成前動 Phase 2 或 Phase 3

---

## 收工必做

1. 更新 `HANDOFF.md`
2. 更新 `G:\我的雲端硬碟\我的第二大腦\踩坑紀錄.md`
3. 更新 `G:\我的雲端硬碟\我的第二大腦\專案\2026codex AI測試.md`
4. `git commit`
5. `git push origin codex/gdp-html-training-pages`

---

## 授權說明

使用者已預先授權：
- 「上傳 github」→ 直接 commit + push
- 「更新第二大腦」→ 直接寫入踩坑紀錄與專案 note
- 「使用 Firebase / Firestore / fire 資料庫」→ 直接執行同步或部署

---

詳細規則、待辦清單、Firestore 狀態請見 `AGENTS.md`、`HANDOFF.md`、`GDP_智慧查詢規範.md`。

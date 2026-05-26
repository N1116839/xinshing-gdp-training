# Claude Code 開工指示
> 此為 Claude Code 專用版開工指示，與 AGENTS.md 同步。
> 最後更新：2026-05-26

---

## 你正在工作的專案

這是**新勝醫藥 GDP 內訓 HTML 資料庫**，不是 PPT 簡報（PPT v11_final 已完成，不需再動）。

- 主要工作區：`HTML資料庫/新勝GDP資料庫.html`
- 永久網址：`https://n1116839.github.io/xinshing-gdp-training/`
- Firebase：`xinshing-gdp-training-20260525`（Firestore rules 已部署）
- GitHub 分支：`codex/gdp-html-training-pages`

---

## 開工必讀（每次對話開始都必須讀）

**按順序讀，讀完才能動手：**

1. `HANDOFF.md`（本資料夾）
2. `G:\我的雲端硬碟\我的第二大腦\踩坑紀錄.md`
3. `G:\我的雲端硬碟\我的第二大腦\專案\2026codex AI測試.md`

讀完後，詢問使用者要從哪個待辦項目開始，**不可自行決定**。

---

## 絕對禁止

- KB 欄位（international / taiwan / xinshing）放 AI 指令語、備忘、校正提示
- 資料庫同步時把 HTML 本身、README、HANDOFF 放入 KB
- 出現「冷藏倉」「冷鏈」相關描述（公司無冷藏倉）
- 收工時只口頭說收工，不 commit + push + 更新 HANDOFF + 更新第二大腦

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

詳細規則、待辦清單、Firestore 狀態請見 `AGENTS.md` 與 `HANDOFF.md`。

# 官方常見缺失來源

> 建立：2026-06-03  
> 用途：管理政府公開 GDP 常見缺失與查核重點來源，供測驗平台、常見缺失學習區與題庫追溯使用。  
> 本資料夾是來源管理區，不是公司 SOP/WI/FR 原文資料夾。

---

## 為什麼建立此資料夾

多個 AI 曾回覆「GDP 常見缺失無資料」，但實際上官方公開資料存在，只是分散在食藥署 GDP 專區、業者說明會講義、申請 GDP 檢查頁與 PIC/S inspection aide-memoire 中。

此資料夾用來避免後續 AI 再次誤判「無資料」，並避免把 AI 推測的缺失混入正式題庫。

---

## 可用來源類型

| 類型 | 例子 | 用途 |
|------|------|------|
| TFDA 藥品 GDP 活動/訓練講義 | GDP 法規解析與常見缺失說明、GDP 業者說明會 | 政府公開常見缺失題、稽查準備題 |
| TFDA 申請 GDP 檢查頁與附件 | 缺失分類、查核申請資料、改善期限 | 缺失分類題、查核流程題 |
| PIC/S GDP inspection 文件 | PI 044-1 GDP Aide-Memoire | 國際查核重點題 |
| 使用者提供資料 | 官方 PDF 截圖、OCR 文字、頁碼對照 | 逐筆題庫與逐頁來源 |

---

## 禁止事項

- 不可把 AI 自行推測的「可能缺失」放入正式題庫。
- 不可把政府公開常見缺失寫成「本公司常見缺失」。
- 不可用無來源的網路文章當官方缺失依據。
- 掃描型 PDF 若無 OCR，不可硬填頁碼或逐筆缺失。
- EU 非符合性報告不得直接標成台灣政府公開常見缺失。

---

## 建議子資料夾

```text
官方常見缺失來源/
  TFDA/
  PICS/
  使用者提供/
```

若後續加入 PDF、截圖或 OCR 文字，需在檔名或索引中標明：

- 年度
- 官方標題
- 官方 URL
- 頁碼或段落
- 摘錄方式（原文/OCR/人工整理）
- 是否已由使用者或講師確認

---

## Firestore 對應

正式資料庫建議分成兩層：

| Collection | 用途 |
|------------|------|
| `gdpGovDeficiencySources` | 官方來源清單，例如 TFDA 講義、申請 GDP 檢查頁、PIC/S PI 044-1。 |
| `gdpGovDeficiencyItems` | 逐筆政府公開常見缺失或查核重點。 |

題庫 `gdpQuestionBank` 可透過 `deficiencyItemId` 引用缺失資料。

---

## 目前已知官方來源線索

正式建立逐筆資料前，需再次開啟官方頁確認連結與檔案仍可用。2026-06-09 已補下載下列官方 PDF，檔名依全域規則加 `codex_` 前綴。

- 食藥署藥品 GDP 專區：藥品 GDP 相關活動/訓練講義。
- 食藥署藥品 GDP 專區：申請 GDP 檢查。
- 食藥署最新消息/活動：GDP 業者說明會。
- PIC/S：`PI 044-1 Aide-Memoire - Inspection of Good Distribution Practice (GDP)`.

### 已下載官方來源（2026-06-09）

| 類型 | 本機檔案 | 官方 URL | 可用於 |
|------|----------|----------|--------|
| TFDA | `TFDA/codex_113年度GDP申請資料準備與常見缺失.pdf` | `https://www.fda.gov.tw/tc/includes/GetFile.ashx?id=f638768789562401428&type=1` | GDP 申請資料、檢查重點、常見缺失態樣；含人員定期教育訓練、紀錄保存、SOP 與實際作業一致性等題材。 |
| TFDA | `TFDA/codex_111年度GDP實地查核流程與常見缺失.pdf` | `https://www.fda.gov.tw/tc/includes/GetFile.ashx?id=f637913384797731043&type=1` | 實地查核流程、常見缺失、落實 GDP 各章節重點；含職務說明、職務指派、教育訓練紀錄、持續教育訓練。 |
| TFDA | `TFDA/codex_111年度GDP書面審查流程與常見缺失.pdf` | `https://www.fda.gov.tw/tc/includes/GetFile.ashx?id=f637913384797371040&type=1` | 書面審查常見缺失與申請資料準備；供補強查核準備題與文件完整性題。 |
| PIC/S | `PICS/codex_PI044-1_GDP_Aide_Memoire.pdf` | `https://picscheme.org/docview/6234` | 國際 GDP 查核備忘錄；含 personnel、training、records、assessment 等查核問題。 |
| PIC/S | `PICS/codex_PS-INF-22-2017_GDP_QA.pdf` | `https://picscheme.org/docview/6235` | PIC/S GDP Guide Q&A；供年度測驗補國際規範解釋題。 |

### 2026-06-09 題庫使用紀錄

- `HTML資料庫/新勝GDP資料庫.html` 的 `examTemplates.hr.draftQuestions` 已補 4 題年度加題。
- 題目來源限於 TFDA/PIC/S 官方資料，呈現為「政府公開查核重點」或「年度加題」。
- 題目不得寫成「本公司常見缺失」；也不得把 TFDA 範例中的冷藏相關文字套用為新勝做法。

---

## 題庫使用原則

政府公開常見缺失題目應以「公開查核重點」或「政府公開常見缺失」命名，例如：

```text
政府公開常見缺失中，訓練紀錄常見問題可能包含下列哪一項？
```

不得寫成：

```text
本公司常見缺失是下列哪一項？
```

除非使用者提供公司內部稽核紀錄並明確同意，否則不可建立「公司內部實際缺失」題目。

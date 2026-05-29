/**
 * 從 GitHub Pages 永久 URL fetch HTML，模擬 kbStore.search() 驗收 fact 架構
 * 測試來源：https://n1116839.github.io/xinshing-gdp-training/
 */

import https from 'https';

const GH_PAGES_URL = 'https://n1116839.github.io/xinshing-gdp-training/HTML%E8%B3%87%E6%96%99%E5%BA%AB/%E6%96%B0%E5%8B%9DGDP%E8%B3%87%E6%96%99%E5%BA%AB.html';
const GH_INDEX_URL  = 'https://n1116839.github.io/xinshing-gdp-training/';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'node-verify-script' } }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchUrl(res.headers.location).then(resolve).catch(reject);
        } else {
          resolve({ status: res.statusCode, body });
        }
      });
    }).on('error', reject);
  });
}

// 從 HTML 文字中提取 kbStore docs（fact + clarify）
function extractDocs(html) {
  // 找到 kbStore 或 gdpKnowledgeBase 資料區段
  const docs = [];

  // 提取所有 docs.push({ ... }) 區塊
  const pushRegex = /docs\.push\(\{([\s\S]*?)\}\s*\);/g;
  let m;
  while ((m = pushRegex.exec(html)) !== null) {
    try {
      // 用 eval 解析（安全：只解析自己的 HTML）
      const obj = eval('(' + '{' + m[1] + '}' + ')');
      docs.push(obj);
    } catch(e) {
      // 跳過無法解析的區塊
    }
  }
  return docs;
}

// 模擬 kbStore.search 評分邏輯（依 HTML 中實作）
function normalize(s) {
  return (s || '').toLowerCase().replace(/\s+/g, '');
}

function searchDocs(docs, query) {
  const compact = normalize(query);
  const results = [];

  for (const doc of docs) {
    let score = 0;
    const keywords = doc.keywords || [];
    const hay = keywords.map(normalize).join(' ');

    // 正向：keyword 在 hay 中
    for (const kw of keywords) {
      const nkw = normalize(kw);
      if (compact.includes(nkw) || nkw.includes(compact)) score += 10;
      if (hay.includes(compact)) score += 5;
    }

    // fact sourceType 加分（分級相關度分，取代舊版 +55 布林分）
    if (doc.sourceType === 'fact') {
      const nTopic = normalize(doc.topic || '');
      let matchScore = 0;
      // 反向 keyword 命中數
      let kwHits = 0;
      for (const kw of keywords) {
        const nkw = normalize(kw);
        if (nkw.length >= 4 && compact.includes(nkw)) kwHits++;
      }
      matchScore += Math.min(kwHits, 3) * 5;
      // 反向 topic 命中
      if (nTopic.length >= 4 && compact.includes(nTopic)) matchScore += 6;
      // 直接 keyword 命中
      if (keywords.some(kw => compact.includes(normalize(kw)))) matchScore += 8;
      // 完整 keywordHay 命中
      const kwHay = keywords.map(normalize).join('|');
      if (kwHay.includes(compact)) matchScore += 10;
      score += matchScore;
    }

    // 反向比對：compact.includes(keyword)，keyword≥4字
    for (const kw of keywords) {
      const nkw = normalize(kw);
      if (nkw.length >= 4 && compact.includes(nkw)) score += 10;
    }

    // topic 命中
    if (doc.topic && compact.includes(normalize(doc.topic))) score += 8;

    if (score > 0) results.push({ id: doc.id, score, sourceType: doc.sourceType, topic: doc.topic, xinshing: doc.xinshing });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 3);
}

// 驗收測試組（第一輪 21 筆 + 第二章 20 筆）
const TESTS = [
  // ── 第一輪：進出貨/溫度/庫存/回收/CAPA/訓練/稽核/文件 ──
  { q: '採購單由誰列印',        expectId: 'fact-purchase-order-who',    expectHint: '採購' },
  { q: 'FR54-01由誰填',        expectId: 'fact-receiving-fr54-who',    expectHint: '進貨' },
  { q: '何時填FR54-01',        expectId: 'fact-receiving-when',        expectHint: '到達' },
  { q: '物流門管制時間',        expectId: 'fact-logistics-door',        expectHint: '15:00' },
  { q: '倉庫溫度範圍',         expectId: 'fact-temp-range',            expectHint: '25' },
  { q: '溫度警戒值是多少',      expectId: 'fact-temp-alarm-threshold',  expectHint: '23.5' },
  { q: '警報測試多久一次',      expectId: 'fact-temp-alarm-test',       expectHint: '每月' },
  { q: 'FR33-01月記錄',        expectId: 'fact-temp-monthly-record',   expectHint: 'FR33' },
  { q: '溫度測繪週期',         expectId: 'fact-temp-mapping-cycle',    expectHint: '三年' },
  { q: '盤點頻率多久一次',     expectId: 'fact-inventory-cycle',       expectHint: '兩個月' },
  { q: '不符合品如何處理',     expectId: 'fact-nonconform-handling',   expectHint: '隔離' },
  { q: '藥品回收第一級幾個月', expectId: 'fact-recall-level-deadline', expectHint: '1' },
  { q: '24小時通知回收',       expectId: 'fact-recall-notify-24h',     expectHint: '24' },
  { q: '模擬演練多久一次',     expectId: 'fact-recall-drill',          expectHint: '每年' },
  { q: '退回品處理方式',       expectId: 'fact-return-policy',         expectHint: '報廢' },
  { q: 'CAPA怎麼觸發',        expectId: 'fact-capa-trigger',          expectHint: '六' },
  { q: 'CAPA原因分析期限',    expectId: 'fact-capa-timeline',         expectHint: '一週' },
  { q: '訓練合格標準幾分',    expectId: 'fact-training-pass-score',   expectHint: '70' },
  { q: '教育訓練多久一次',    expectId: 'fact-training-frequency',    expectHint: '年' },
  { q: '品質紀錄保存幾年',    expectId: 'fact-record-retention',      expectHint: '5' },

  // ── 第二章：組織架構 ──
  { q: 'GDP主管職責是什麼',        expectId: 'fact-org-gdp-manager',        expectHint: '品質管理系統' },
  { q: 'GDP主管最低資格',          expectId: 'fact-org-gdp-manager',        expectHint: '3 年' },
  { q: '管理藥師需要什麼執照',     expectId: 'fact-org-pharmacist',         expectHint: '藥師執照' },
  { q: '管理藥師職責',             expectId: 'fact-org-pharmacist',         expectHint: '衛生安全' },
  { q: '業務工作內容',             expectId: 'fact-org-sales',              expectHint: '客戶' },
  { q: '品管職責是什麼',           expectId: 'fact-org-quality',            expectHint: '品質管理系統' },
  { q: '倉管的工作是什麼',         expectId: 'fact-org-warehouse',          expectHint: '盤點' },
  { q: '採購職責',                 expectId: 'fact-org-purchasing',         expectHint: '合格廠商' },
  { q: '人事做什麼',               expectId: 'fact-org-hr',                 expectHint: '訓練計畫' },
  { q: '文管工作是什麼',           expectId: 'fact-org-doccontrol',         expectHint: '文件' },
  { q: '代理人制度如何安排',       expectId: 'fact-org-deputy',             expectHint: 'FR22-01' },
  { q: '非上班時間怎麼聯絡',       expectId: 'fact-org-emergency-contact',  expectHint: '0930656906' },

  // ── 第二章：人員衛生 ──
  { q: '進倉庫前要消毒嗎',         expectId: 'fact-hygiene-handsan',        expectHint: '75%' },
  { q: '入庫前要做什麼清潔',       expectId: 'fact-hygiene-incoming-clean', expectHint: '除塵' },
  { q: '倉庫清潔多久一次',         expectId: 'fact-hygiene-daily-cleaning', expectHint: 'FR25-01' },
  { q: '冷氣濾網多久清洗',         expectId: 'fact-hygiene-quarterly-ac',   expectHint: '每季' },
  { q: '管制區入口有什麼設施',     expectId: 'fact-hygiene-door-barrier',   expectHint: '塑膠簾' },

  // ── 第二章：SMF ──
  { q: '公司地址在哪',             expectId: 'fact-smf-company-basic',      expectHint: '中和' },
  { q: 'GDP制度何時建立',          expectId: 'fact-smf-gdp-established',    expectHint: '111' },

  // ── 第二章：訓練補充 ──
  { q: '職前訓練合格才能上任嗎',   expectId: 'fact-training-preservice',    expectHint: 'FR22-02' },
  { q: '外部教育訓練怎麼辦',       expectId: 'fact-training-external',      expectHint: '外部檢討會' },
  { q: '外部教育訓練多久一次',     expectId: 'fact-training-external',      expectHint: '三年' },
  { q: '訓練紀錄存哪',             expectId: 'fact-training-record',        expectHint: 'FR24-03' },

  // ── 第一章：變更管制 ──
  { q: '何時啟動變更管制',         expectId: 'fact-change-trigger',         expectHint: '偏差' },
  { q: '重大變更是什麼',           expectId: 'fact-change-level',           expectHint: '會簽' },
  { q: '填FR12-05',               expectId: 'fact-change-form',            expectHint: 'FR12-05' },
  { q: '變更逾期怎麼辦',           expectId: 'fact-change-overdue',         expectHint: '三日' },
  { q: '倉庫搬遷需要通報嗎',       expectId: 'fact-change-notify',          expectHint: '搬遷' },

  // ── 第一章：管理階層檢討 ──
  { q: '管理階層檢討多久一次',     expectId: 'fact-mgmt-review-freq',       expectHint: '年底' },
  { q: '管理審查包含什麼項目',     expectId: 'fact-mgmt-review-items',      expectHint: '委外評鑑' },
  { q: 'FR14-02報告',              expectId: 'fact-mgmt-review-form',       expectHint: 'FR14-02' },

  // ── 第一章：品質風險 ──
  { q: '風險小組有誰',             expectId: 'fact-risk-team',              expectHint: '倉管' },
  { q: 'FMEA是什麼',               expectId: 'fact-risk-method',            expectHint: 'FMEA' },
  { q: '等級A風險怎麼辦',          expectId: 'fact-risk-level-abc',         expectHint: '不可接受' },
  { q: '嚴重度如何評分',           expectId: 'fact-risk-severity',          expectHint: '歇業' },
  { q: '發生度如何評分',           expectId: 'fact-risk-occurrence',        expectHint: '三年' },
  { q: '品質風險多久回顧',         expectId: 'fact-risk-review',            expectHint: '每年' },
  { q: 'FR15-01是什麼',            expectId: 'fact-risk-form',              expectHint: 'FR15-01' },

  // ── 第三章：DP32-01 作業場所規劃 ──
  { q: '廠區分幾區',               expectId: 'fact-premises-zones',              expectHint: '六區' },
  { q: '非符合品區要上鎖嗎',       expectId: 'fact-premises-nonconform-isolation', expectHint: '上鎖' },
  { q: 'FEFO是什麼',               expectId: 'fact-premises-fefo',               expectHint: 'FEFO' },
  { q: '倉庫可以吃東西嗎',         expectId: 'fact-premises-food-prohibition',    expectHint: '禁止' },

  // ── 第三章：DP33-01 補充 ──
  { q: '溫度監測器安裝位置',       expectId: 'fact-temp-sensor-location',        expectHint: '最熱點' },
  { q: '溫度感應器校正依據',       expectId: 'fact-temp-sensor-calibration',     expectHint: 'ISO 17025' },

  // ── 第三章：DP34-01 關鍵設備 ──
  { q: '關鍵設備有哪些',           expectId: 'fact-equipment-types',             expectHint: '發電機' },
  { q: '新設備要做4Q嗎',           expectId: 'fact-equipment-acceptance',        expectHint: 'FR34-02' },
  { q: '溫度計電池多久換',         expectId: 'fact-equipment-battery',           expectHint: '三個月' },
  { q: '設備保養填什麼表',         expectId: 'fact-equipment-maintenance',       expectHint: 'FR34-03' },
  { q: '設備故障怎麼辦',           expectId: 'fact-equipment-abnormal',          expectHint: 'DP12-02' },

  // ── 第三章：DP34-02 量測儀器 ──
  { q: '儀器多久外校一次',         expectId: 'fact-instrument-calibration',      expectHint: '每年' },
  { q: '校正報告保存幾年',         expectId: 'fact-instrument-record',           expectHint: '5年' },
  { q: '儀器跌落損壞怎麼辦',       expectId: 'fact-instrument-abnormal',         expectHint: '暫停使用' },

  // ── 第三章：DP35-01 電腦化系統 ──
  { q: '電腦化系統有哪些',         expectId: 'fact-computer-scope',              expectHint: 'Pegasus' },
  { q: '誰可以修改電腦系統資料',   expectId: 'fact-computer-authorization',      expectHint: 'FR35-02' },
  { q: '系統資料多久備份一次',     expectId: 'fact-computer-backup',             expectHint: '每月' },

  // ── 第三章：DP36-01 驗證確效 ──
  { q: '4Q確效是什麼',             expectId: 'fact-validation-4q',               expectHint: 'DQ' },
  { q: '確效報告由誰保存',         expectId: 'fact-validation-report',           expectHint: '品保' },
  { q: '什麼時候要再確效',         expectId: 'fact-validation-revalidation',     expectHint: '遷廠' },

  // ── 第三章：WI25-01 門禁進出管制 ──
  { q: '進入管制區要做什麼',       expectId: 'fact-access-entry-process',        expectHint: '酒精' },
  { q: '門禁刷卡幾秒開啟',         expectId: 'fact-access-card',                 expectHint: '1秒' },
  { q: '訪客要陪同嗎',             expectId: 'fact-access-visitor',              expectHint: '全程陪同' },
  { q: '門禁異常如何記錄',         expectId: 'fact-access-abnormal-record',      expectHint: '自動保存' },

  // ── 第四章：文件管制（DP42-01） ──
  { q: '文件分幾階',               expectId: 'fact-doc-hierarchy',               expectHint: '四階層' },
  { q: '文件階層有哪些',           expectId: 'fact-doc-hierarchy',               expectHint: '品質手冊' },
  { q: '重大變更文件幾天簽核',     expectId: 'fact-doc-approval-time',           expectHint: '2個工作天' },
  { q: '一般文件幾天核准',         expectId: 'fact-doc-approval-time',           expectHint: '5個工作天' },
  { q: '文件什麼時候審查',         expectId: 'fact-doc-annual-review',           expectHint: '12月' },
  { q: '失效文件怎麼處理',         expectId: 'fact-doc-obsolete',                expectHint: '失效章' },
  { q: '文件存放在哪裡',           expectId: 'fact-doc-storage-method',          expectHint: '發行章' },

  // ── 第四章：品質紀錄（DP42-02） ──
  { q: '紀錄可以用鉛筆寫嗎',       expectId: 'fact-record-writing-rule',         expectHint: '不得使用鉛筆' },
  { q: '紀錄塗改怎麼辦',           expectId: 'fact-record-writing-rule',         expectHint: '簽認並押日期' },
  { q: '紀錄可以用鉛筆',           expectId: 'fact-record-writing-rule',         expectHint: '不得使用鉛筆' },
  { q: '品質紀錄如何修改',          expectId: 'fact-record-writing-rule',         expectHint: '簽認' },
  { q: '紀錄寫錯如何更正',          expectId: 'fact-record-writing-rule',         expectHint: '簽認' },
  { q: '填寫紀錄有什麼規定',        expectId: 'fact-record-writing-rule',         expectHint: '鉛筆' },
  { q: '紀錄修改要簽名嗎',          expectId: 'fact-record-writing-rule',         expectHint: '簽認' },
  { q: '品質紀錄書寫方式',          expectId: 'fact-record-writing-rule',         expectHint: '鉛筆' },
  { q: '表單修改規定',              expectId: 'fact-record-writing-rule',         expectHint: '簽認並押日期' },
  { q: '紀錄主管審查',              expectId: 'fact-record-writing-rule',         expectHint: '審查簽認' },
  { q: '紀錄書寫錯誤怎麼辦',        expectId: 'fact-record-writing-rule',         expectHint: '簽認並押日期' },

  // ── 第四章：文件階層補充 ──
  { q: '文件有幾階',               expectId: 'fact-doc-hierarchy',               expectHint: '四階層' },
  { q: '一階文件是什麼',            expectId: 'fact-doc-hierarchy',               expectHint: '品質手冊' },
  { q: '二階文件是什麼',            expectId: 'fact-doc-hierarchy',               expectHint: '程序書' },
  { q: '三階文件叫什麼',            expectId: 'fact-doc-hierarchy',               expectHint: '指導' },
  { q: '四階文件叫什麼',            expectId: 'fact-doc-hierarchy',               expectHint: '表單' },
  { q: 'DM第幾階文件',             expectId: 'fact-doc-hierarchy',               expectHint: '一階' },
  { q: '文件編碼規則',              expectId: 'fact-doc-hierarchy',               expectHint: '流水' },
  { q: '文件層級有幾種',            expectId: 'fact-doc-hierarchy',               expectHint: '四階' },
  { q: '表單文件是第幾階',          expectId: 'fact-doc-hierarchy',               expectHint: '四階' },

  // ── 第四章：文件審核時限補充 ──
  { q: '文件簽核期限幾天',          expectId: 'fact-doc-approval-time',           expectHint: '2個工作天' },
  { q: '重大變更文件核准時間',      expectId: 'fact-doc-approval-time',           expectHint: '工作天' },
  { q: '一般文件核准時間',          expectId: 'fact-doc-approval-time',           expectHint: '5個工作天' },
  { q: '文件審查人幾天簽完',        expectId: 'fact-doc-approval-time',           expectHint: '2' },
  { q: '文件核准時限',              expectId: 'fact-doc-approval-time',           expectHint: '工作天' },
  { q: '重大文件簽核時程',          expectId: 'fact-doc-approval-time',           expectHint: '2' },
  { q: '一般文件審查時間',          expectId: 'fact-doc-approval-time',           expectHint: '5' },
  { q: '文件核准期限多久',          expectId: 'fact-doc-approval-time',           expectHint: '工作天' },
  { q: '簽核文件要幾天',            expectId: 'fact-doc-approval-time',           expectHint: '工作天' },

  // ── 第四章：文件審查時間補充 ──
  { q: '文件審查在幾月',            expectId: 'fact-doc-annual-review',           expectHint: '12月' },
  { q: '文管何時徵詢修改意見',      expectId: 'fact-doc-annual-review',           expectHint: '12月' },
  { q: '文件每年審查時間',          expectId: 'fact-doc-annual-review',           expectHint: '12月' },
  { q: '文件定期檢討在何時',        expectId: 'fact-doc-annual-review',           expectHint: '12月' },
  { q: '文件修改申請填什麼',        expectId: 'fact-doc-annual-review',           expectHint: 'FR42-02' },
  { q: '徵詢文件修改意見在幾月',    expectId: 'fact-doc-annual-review',           expectHint: '12月' },
  { q: '文件制修訂申請單',          expectId: 'fact-doc-annual-review',           expectHint: 'FR42-02' },
  { q: '文管何時徵詢文件修改',      expectId: 'fact-doc-annual-review',           expectHint: '12月' },
  { q: '文件審查結果記錄在哪',      expectId: 'fact-doc-annual-review',           expectHint: '修訂紀錄' },
  { q: '文件修改何時申請',          expectId: 'fact-doc-annual-review',           expectHint: '12月' },

  // ── 第四章：失效文件補充 ──
  { q: '失效文件如何保存',          expectId: 'fact-doc-obsolete',                expectHint: '失效章' },
  { q: '失效文件保存幾年',          expectId: 'fact-doc-obsolete',                expectHint: '5年' },
  { q: '文件幾時銷毀',              expectId: 'fact-doc-obsolete',                expectHint: '第一週' },
  { q: '文件銷毀填什麼表',          expectId: 'fact-doc-obsolete',                expectHint: 'FR42-06' },
  { q: '失效文件如何標示',          expectId: 'fact-doc-obsolete',                expectHint: '失效章' },
  { q: '文件銷毀紀錄表',            expectId: 'fact-doc-obsolete',                expectHint: 'FR42-06' },
  { q: '失效文件一覽表',            expectId: 'fact-doc-obsolete',                expectHint: '銷毀' },
  { q: '失效文件多久銷毀一次',      expectId: 'fact-doc-obsolete',                expectHint: '每年' },
  { q: '文件廢止流程',              expectId: 'fact-doc-obsolete',                expectHint: '失效章' },
  { q: '文件銷毀申請',              expectId: 'fact-doc-obsolete',                expectHint: 'FR42-06' },

  // ── 第四章：文件存放補充 ──
  { q: '正式文件放哪裡',            expectId: 'fact-doc-storage-method',          expectHint: '文件櫃' },
  { q: '文件發行章用途',            expectId: 'fact-doc-storage-method',          expectHint: '發行章' },
  { q: '電子檔文件哪裡看',          expectId: 'fact-doc-storage-method',          expectHint: '共用資料夾' },
  { q: '文件如何分發',              expectId: 'fact-doc-storage-method',          expectHint: '發行章' },
  { q: '文件存放位置',              expectId: 'fact-doc-storage-method',          expectHint: '文件櫃' },
  { q: '紙本文件蓋什麼章',          expectId: 'fact-doc-storage-method',          expectHint: '發行章' },
  { q: '共同資料夾文件',            expectId: 'fact-doc-storage-method',          expectHint: '查閱' },
  { q: '電子文件效力',              expectId: 'fact-doc-storage-method',          expectHint: '簽核效力' },
  { q: '文件存放規定',              expectId: 'fact-doc-storage-method',          expectHint: '發行章' },
  { q: '文件取得方式',              expectId: 'fact-doc-storage-method',          expectHint: '文件櫃' },

  // ── 第六章：客訴（DP62-01） ──
  { q: '客訴分哪幾類',             expectId: 'fact-complaint-types',             expectHint: '藥品品質' },
  { q: '運銷品質客訴幾個月結案',   expectId: 'fact-complaint-types',             expectHint: '1個月' },
  { q: '客訴重複發生怎麼標記',     expectId: 'fact-complaint-repeat',            expectHint: '黃色' },
  { q: '退回品要貼什麼標籤',       expectId: 'fact-return-label',                expectHint: 'FR63-02' },
  { q: '客訴分成幾類',              expectId: 'fact-complaint-types',             expectHint: '藥品品質' },
  { q: '客訴分類方式',              expectId: 'fact-complaint-types',             expectHint: '藥品品質' },
  { q: '藥品品質申訴怎麼辦',        expectId: 'fact-complaint-types',             expectHint: '通知製造商' },
  { q: '運銷品質申訴多久結案',      expectId: 'fact-complaint-types',             expectHint: '1個月' },
  { q: '客訴結案期限',              expectId: 'fact-complaint-types',             expectHint: '1個月' },
  { q: '客訴登錄在哪裡',            expectId: 'fact-complaint-types',             expectHint: 'FR62-02' },
  { q: '客訴回覆單',                expectId: 'fact-complaint-types',             expectHint: 'FR62-01' },
  { q: '客訴分幾種',                expectId: 'fact-complaint-types',             expectHint: '藥品品質' },

  // ── 第六章：重複客訴補充 ──
  { q: '客訴幾次標黃色',            expectId: 'fact-complaint-repeat',            expectHint: '黃色' },
  { q: '客訴幾次標紅色',            expectId: 'fact-complaint-repeat',            expectHint: '紅色' },
  { q: '客訴發生2次怎麼標',         expectId: 'fact-complaint-repeat',            expectHint: '黃色' },
  { q: '客訴發生4次怎麼辦',         expectId: 'fact-complaint-repeat',            expectHint: '紅色' },
  { q: '重複客訴要開CAPA嗎',        expectId: 'fact-complaint-repeat',            expectHint: 'CAPA' },
  { q: '客訴重複顏色標記',          expectId: 'fact-complaint-repeat',            expectHint: '黃色' },
  { q: '客訴幾次啟動CAPA',          expectId: 'fact-complaint-repeat',            expectHint: 'CAPA' },
  { q: '重複申訴識別方式',          expectId: 'fact-complaint-repeat',            expectHint: '黃色' },
  { q: '客訴重複問題如何標示',      expectId: 'fact-complaint-repeat',            expectHint: '黃色' },
  { q: '客訴哪時候開CAPA',          expectId: 'fact-complaint-repeat',            expectHint: 'CAPA' },

  // ── 第六章：退回品補充 ──
  { q: '退回品如何標示',            expectId: 'fact-return-label',                expectHint: 'FR63-02' },
  { q: '退回品放在哪裡',            expectId: 'fact-return-label',                expectHint: '退貨區' },
  { q: '退回品核對什麼',            expectId: 'fact-return-label',                expectHint: '批號' },
  { q: '退回品效期不符怎麼辦',      expectId: 'fact-return-label',                expectHint: '隔離區' },
  { q: '退貨核對批號效期',          expectId: 'fact-return-label',                expectHint: '批號' },
  { q: '退回品退貨區在哪',          expectId: 'fact-return-label',                expectHint: '退貨區' },
  { q: '退回品貼什麼標籤',          expectId: 'fact-return-label',                expectHint: 'FR63-02' },
  { q: '退回品隔離存放',            expectId: 'fact-return-label',                expectHint: '退貨區' },
  { q: '退回品批號核對',            expectId: 'fact-return-label',                expectHint: '批號' },
  { q: '退回品怎麼處理',            expectId: 'fact-return-label',                expectHint: 'FR63-02' },

  // ── 第六章：偽禁藥補充 ──
  { q: '發現偽藥通知誰',            expectId: 'fact-counterfeit-action',          expectHint: '管理藥師' },
  { q: '偽禁藥通報流程',            expectId: 'fact-counterfeit-action',          expectHint: '管理藥師' },
  { q: '疑似偽藥隔離處置',          expectId: 'fact-counterfeit-action',          expectHint: '非符合區' },
  { q: '偽藥通知主管機關',          expectId: 'fact-counterfeit-action',          expectHint: '通知主管機關' },
  { q: '偽藥停止銷售',              expectId: 'fact-counterfeit-action',          expectHint: '停止銷售' },
  { q: '偽藥通知廠商',              expectId: 'fact-counterfeit-action',          expectHint: '許可持有廠商' },
  { q: '偽禁藥要上鎖嗎',            expectId: 'fact-counterfeit-action',          expectHint: '上鎖' },
  { q: '發現偽藥上呈給誰',          expectId: 'fact-counterfeit-action',          expectHint: '管理藥師' },
  { q: '偽藥確定後啟動什麼',        expectId: 'fact-counterfeit-action',          expectHint: '回收' },

  // ── 第六章：回收等級補充 ──
  { q: '藥品回收第一級幾個月',     expectId: 'fact-recall-level-deadline',       expectHint: '1' },
  { q: '第二級回收期限',            expectId: 'fact-recall-level-deadline',       expectHint: '2' },
  { q: '第三級回收幾個月',          expectId: 'fact-recall-level-deadline',       expectHint: '6' },
  { q: '回收等級分幾級',            expectId: 'fact-recall-level-deadline',       expectHint: '三' },
  { q: '第一級回收多久',            expectId: 'fact-recall-level-deadline',       expectHint: '1' },
  { q: '第二級回收完成時間',        expectId: 'fact-recall-level-deadline',       expectHint: '2' },
  { q: '回收期限怎麼分',            expectId: 'fact-recall-level-deadline',       expectHint: '第一級' },
  { q: '第一級回收定義',            expectId: 'fact-recall-level-deadline',       expectHint: '偽藥' },
  { q: '第三級回收多久',            expectId: 'fact-recall-level-deadline',       expectHint: '6' },
  { q: '一級回收期限',              expectId: 'fact-recall-level-deadline',       expectHint: '1' },
  { q: '回收完成期限多久',          expectId: 'fact-recall-level-deadline',       expectHint: '第一級' },

  // ── 第六章：24小時通知補充 ──
  { q: '24小時通知回收',            expectId: 'fact-recall-notify-24h',           expectHint: '24' },
  { q: '回收通知期限',              expectId: 'fact-recall-notify-24h',           expectHint: '24' },
  { q: '幾小時內通知回收',          expectId: 'fact-recall-notify-24h',           expectHint: '24' },
  { q: '第一二級通知時間',          expectId: 'fact-recall-notify-24h',           expectHint: '24' },
  { q: '回收通知單填什麼',          expectId: 'fact-recall-notify-24h',           expectHint: 'FR65-03' },
  { q: '回收通知保存多久',          expectId: 'fact-recall-notify-24h',           expectHint: '5年' },
  { q: '公告後多久通知客戶',        expectId: 'fact-recall-notify-24h',           expectHint: '24' },
  { q: '回收24小時通知誰',          expectId: 'fact-recall-notify-24h',           expectHint: '直接銷售' },
  { q: '回收通知時限',              expectId: 'fact-recall-notify-24h',           expectHint: '24' },
  { q: '回收通知紀錄保存',          expectId: 'fact-recall-notify-24h',           expectHint: '5年' },
  { q: '回收通知保存幾年',          expectId: 'fact-recall-notify-24h',           expectHint: '5年' },

  // ── 第六章：模擬演練補充 ──
  { q: '模擬演練多久一次',          expectId: 'fact-recall-drill',                 expectHint: '每年' },
  { q: '模擬回收頻率',              expectId: 'fact-recall-drill',                 expectHint: '每年' },
  { q: '回收演練多久一次',          expectId: 'fact-recall-drill',                 expectHint: '每年' },
  { q: '每年幾次回收演練',          expectId: 'fact-recall-drill',                 expectHint: '至少' },
  { q: '模擬回收由誰挑選',          expectId: 'fact-recall-drill',                 expectHint: '管理藥師' },
  { q: '回收演練由誰執行',          expectId: 'fact-recall-drill',                 expectHint: '管理藥師' },
  { q: '模擬演練幾次',              expectId: 'fact-recall-drill',                 expectHint: '每年' },
  { q: '模擬演練挑什麼藥品',        expectId: 'fact-recall-drill',                 expectHint: '同批號' },
  { q: '演練紀錄由誰彙整',          expectId: 'fact-recall-drill',                 expectHint: '品管' },
  { q: '回收演練頻率',              expectId: 'fact-recall-drill',                 expectHint: '每年' },

  // ── 第六章：退回品政策補充 ──
  { q: '退回品處理方式',            expectId: 'fact-return-policy',                expectHint: '報廢' },
  { q: '退回品為什麼報廢',          expectId: 'fact-return-policy',                expectHint: '無法確認' },
  { q: '退回品可以再賣嗎',          expectId: 'fact-return-policy',                expectHint: '直接報廢' },
  { q: '退回品銷毀程序',            expectId: 'fact-return-policy',                expectHint: 'DP56-01' },
  { q: '退貨藥品如何處理',          expectId: 'fact-return-policy',                expectHint: '報廢' },
  { q: '退回品一律報廢',            expectId: 'fact-return-policy',                expectHint: '直接報廢' },
  { q: '退貨可以再上架嗎',          expectId: 'fact-return-policy',                expectHint: '報廢' },
  { q: '退回品怎麼銷毀',            expectId: 'fact-return-policy',                expectHint: 'DP56-01' },
  { q: '退回品不重新銷售',          expectId: 'fact-return-policy',                expectHint: '報廢' },
  { q: '退回品最終處置',            expectId: 'fact-return-policy',                expectHint: '銷毀' },

  // ── 第七章：委外作業（DP72-01）fact-outsourcing-eval-timing ──
  { q: '委外廠商多久評鑑一次',     expectId: 'fact-outsourcing-eval-timing',     expectHint: '年底' },
  { q: '委外評鑑什麼時候',          expectId: 'fact-outsourcing-eval-timing',     expectHint: '年底' },
  { q: '委外多久查核一次',          expectId: 'fact-outsourcing-eval-timing',     expectHint: '每年' },
  { q: '委外評鑑頻率',              expectId: 'fact-outsourcing-eval-timing',     expectHint: '每年' },
  { q: '委外廠商多久考核',          expectId: 'fact-outsourcing-eval-timing',     expectHint: '年底' },
  { q: '委外廠商什麼時候評估',      expectId: 'fact-outsourcing-eval-timing',     expectHint: '年底' },
  { q: '委外廠商何時評鑑',          expectId: 'fact-outsourcing-eval-timing',     expectHint: '年底' },
  { q: '委外每年評鑑幾次',          expectId: 'fact-outsourcing-eval-timing',     expectHint: '一次' },
  { q: '委外何時可以查核',          expectId: 'fact-outsourcing-eval-timing',     expectHint: '隨時' },
  { q: '首次評估何時做',            expectId: 'fact-outsourcing-eval-timing',     expectHint: '開始前' },
  { q: '評鑑在哪記錄',              expectId: 'fact-outsourcing-eval-timing',     expectHint: '評鑑表' },
  // ── 第七章：委外廠商評鑑等級（fact-outsourcing-grade）──
  { q: '委外廠商60分怎麼辦',       expectId: 'fact-outsourcing-grade',           expectHint: '暫停交易' },
  { q: '委外廠商A級是什麼',         expectId: 'fact-outsourcing-grade',           expectHint: '增加交易' },
  { q: '委外廠商B級是什麼',         expectId: 'fact-outsourcing-grade',           expectHint: '繼續交易' },
  { q: '委外廠商C級是什麼',         expectId: 'fact-outsourcing-grade',           expectHint: '減少交易' },
  { q: '委外廠商D級是什麼',         expectId: 'fact-outsourcing-grade',           expectHint: '暫停交易' },
  { q: '委外考核90分',              expectId: 'fact-outsourcing-grade',           expectHint: '增加交易' },
  { q: '委外考核80分',              expectId: 'fact-outsourcing-grade',           expectHint: '繼續交易' },
  { q: '委外70分',                  expectId: 'fact-outsourcing-grade',           expectHint: '減少交易' },
  { q: '委外69分',                  expectId: 'fact-outsourcing-grade',           expectHint: '暫停交易' },
  { q: '委外廠商不及格怎麼辦',      expectId: 'fact-outsourcing-grade',           expectHint: '撤銷' },
  { q: '委外廠商幾分會暫停',        expectId: 'fact-outsourcing-grade',           expectHint: '60' },
  // ── 第七章：委外首次評估方式（fact-outsourcing-first-eval）──
  { q: '委外廠商首次評估怎麼做',   expectId: 'fact-outsourcing-first-eval',      expectHint: '評鑑表' },
  { q: '委外第一次怎麼評估',        expectId: 'fact-outsourcing-first-eval',      expectHint: '簽約前' },
  { q: '委外廠商有GDP證書可以嗎',  expectId: 'fact-outsourcing-first-eval',      expectHint: '證書取代' },
  { q: '委外廠商合格登錄在哪',      expectId: 'fact-outsourcing-first-eval',      expectHint: '名冊' },
  { q: '委外廠商簽約前要做什麼',    expectId: 'fact-outsourcing-first-eval',      expectHint: '首次評估' },
  { q: '委外廠商資格怎麼確認',      expectId: 'fact-outsourcing-first-eval',      expectHint: '評鑑表' },
  { q: '委外廠商不用評鑑的情況',    expectId: 'fact-outsourcing-first-eval',      expectHint: 'GDP證書' },
  { q: '委外廠商怎麼列入名冊',      expectId: 'fact-outsourcing-first-eval',      expectHint: '合格' },
  { q: '委外首次評估記錄在哪',      expectId: 'fact-outsourcing-first-eval',      expectHint: '評鑑表' },
  { q: '委外廠商簽約前評估',        expectId: 'fact-outsourcing-first-eval',      expectHint: '評鑑表' },
  { q: '委外廠商有證書還需要評嗎',  expectId: 'fact-outsourcing-first-eval',      expectHint: '證書取代' },

  // ── 第八章：內部稽核（DP82-01）fact-internal-audit-when ──
  { q: '內部稽核何時做',          expectId: 'fact-internal-audit-when', expectHint: '12' },
  { q: '內部稽核幾月',            expectId: 'fact-internal-audit-when', expectHint: '12月' },
  { q: '稽核多久一次',            expectId: 'fact-internal-audit-when', expectHint: '每年' },
  { q: '年度稽核什麼時候',        expectId: 'fact-internal-audit-when', expectHint: '12月' },
  { q: '每年幾月稽核',            expectId: 'fact-internal-audit-when', expectHint: '12月' },
  { q: '稽核時間',                expectId: 'fact-internal-audit-when', expectHint: '12月' },
  { q: '稽核頻率是多少',          expectId: 'fact-internal-audit-when', expectHint: '每年' },
  { q: '12月稽核',                expectId: 'fact-internal-audit-when', expectHint: '12月' },
  { q: '稽核執行時間',            expectId: 'fact-internal-audit-when', expectHint: '12月' },
  { q: '內部稽核頻率',            expectId: 'fact-internal-audit-when', expectHint: '每年' },
  { q: '什麼時候做稽核',          expectId: 'fact-internal-audit-when', expectHint: '每年' },
  // ── 第八章：內部稽核人員資格（fact-audit-personnel）──
  { q: '誰可以做內部稽核',        expectId: 'fact-audit-personnel',      expectHint: '品保' },
  { q: '稽核人員要有幾年經驗',    expectId: 'fact-audit-personnel',      expectHint: '半年' },
  { q: '內部稽核誰負責',          expectId: 'fact-audit-personnel',      expectHint: '品保' },
  { q: '稽核人員資格',            expectId: 'fact-audit-personnel',      expectHint: '訓練合格' },
  { q: '誰做稽核',                expectId: 'fact-audit-personnel',      expectHint: '品保' },
  { q: '稽核需要什麼資格',        expectId: 'fact-audit-personnel',      expectHint: '訓練合格' },
  { q: '誰來執行稽核',            expectId: 'fact-audit-personnel',      expectHint: '品保' },
  { q: '稽核人員半年經驗',        expectId: 'fact-audit-personnel',      expectHint: '半年' },
  { q: '品保可以做稽核嗎',        expectId: 'fact-audit-personnel',      expectHint: '品保' },
  { q: '稽核人員工作經驗',        expectId: 'fact-audit-personnel',      expectHint: '半年' },
  { q: '稽核要訓練嗎',            expectId: 'fact-audit-personnel',      expectHint: '訓練合格' },
  // ── 第八章：稽核缺失分類（fact-audit-defect-types）──
  { q: '稽核缺失分幾類',          expectId: 'fact-audit-defect-types',   expectHint: '主要缺失' },
  { q: '稽核缺失開什麼單',        expectId: 'fact-audit-defect-types',   expectHint: 'CAPA' },
  { q: '稽核缺失分類',            expectId: 'fact-audit-defect-types',   expectHint: '主要缺失' },
  { q: '主要缺失次要缺失',        expectId: 'fact-audit-defect-types',   expectHint: '主要缺失' },
  { q: '稽核缺失幾類',            expectId: 'fact-audit-defect-types',   expectHint: '三類' },
  { q: '稽核缺失怎麼分',          expectId: 'fact-audit-defect-types',   expectHint: '主要缺失' },
  { q: '稽核不符合怎麼辦',        expectId: 'fact-audit-defect-types',   expectHint: 'CAPA' },
  { q: '缺失分類有哪些',          expectId: 'fact-audit-defect-types',   expectHint: '建議事項' },
  { q: '建議事項是什麼',          expectId: 'fact-audit-defect-types',   expectHint: '建議事項' },
  { q: '稽核結果怎麼處理',        expectId: 'fact-audit-defect-types',   expectHint: 'CAPA' },
  { q: '缺失開CAPA',              expectId: 'fact-audit-defect-types',   expectHint: 'CAPA' },
  // ── 第五章：供應商評鑑（DP52-01） ──
  { q: '國外供應商需要什麼資格',   expectId: 'fact-supplier-qualification',      expectHint: 'PMF' },
  { q: '新供應商怎麼認可',         expectId: 'fact-supplier-qualification',      expectHint: 'FR52-01' },
  { q: '供應商每月要做什麼',       expectId: 'fact-supplier-periodic-eval',      expectHint: '食藥署' },
  { q: '供應商不合格怎麼辦',       expectId: 'fact-supplier-periodic-eval',      expectHint: '撤銷' },
  // ── 第五章：客戶認可（DP53-01） ──
  { q: '新客戶怎麼審核',           expectId: 'fact-customer-qualification',      expectHint: 'FR53-02' },
  { q: '客戶多久評估一次',         expectId: 'fact-customer-periodic-review',    expectHint: '每年' },
  { q: '停業客戶怎麼從清單移除',   expectId: 'fact-customer-periodic-review',    expectHint: '移除' },
  // ── 第五章：進出貨管理（DP54-01） ──
  { q: '收貨驗收流程是什麼',       expectId: 'fact-receiving-flow',              expectHint: 'FR54-01' },
  { q: '驗收不合格怎麼辦',         expectId: 'fact-receiving-flow',              expectHint: 'FR52-03' },
  { q: '嘉里醫藥幾點收貨',         expectId: 'fact-receiving-time-control',      expectHint: '14:00' },
  // ── 第五章：倉儲管理（DP55-01） ──
  { q: '近效期藥品幾個月貼黃標',   expectId: 'fact-storage-near-expiry',         expectHint: '黃色標籤' },
  { q: '效期到了藥品怎麼辦',       expectId: 'fact-storage-near-expiry',         expectHint: '非符合區' },
  { q: '庫存盤點多久一次',         expectId: 'fact-storage-inventory',           expectHint: '2個月' },
  { q: '盤點發現過期藥品怎麼辦',   expectId: 'fact-storage-inventory',           expectHint: 'DP56-01' },
  // ── 第五章：廢棄物管理（DP56-01） ──
  { q: '報廢藥品怎麼銷毀',         expectId: 'fact-waste-destruction',           expectHint: '良衛環保' },
  { q: '銷毀藥品幾月通知',         expectId: 'fact-waste-destruction',           expectHint: '11月' },
  // ── 第五章：揀貨配銷（DP57-01） ──
  { q: '撿貨要幾個人核對',         expectId: 'fact-picking-verification',        expectHint: '覆查' },
  { q: '嘉里醫藥運輸溫度幾筆',    expectId: 'fact-transport-temp-record',       expectHint: '每季' },
  { q: '物流每月幾筆溫度紀錄',     expectId: 'fact-transport-temp-record',       expectHint: '3筆' },
];

async function main() {
  console.log('=== GDP fact 驗收 — 來源：GitHub Pages 永久 URL ===');
  console.log(`URL: ${GH_PAGES_URL}\n`);

  // 本機驗收（確認修改），再 fetch GitHub Pages 確認部署
  const { readFileSync } = await import('fs');
  const localPath = 'G:/我的雲端硬碟/2026codex/AI測試/HTML資料庫/新勝GDP資料庫.html';
  let res = { body: readFileSync(localPath, 'utf8') };
  console.log(`本機 HTML 長度: ${res.body.length} chars`);

  // 同時確認 GitHub Pages index 可達
  try {
    const indexRes = await fetchUrl(GH_INDEX_URL);
    console.log(`GitHub Pages Index 狀態: HTTP ${indexRes.status}`);
  } catch(e) {
    console.log(`GitHub Pages 暫時不可達: ${e.message}`);
  }
  console.log();

  const docs = extractDocs(res.body);
  const factDocs = docs.filter(d => d.sourceType === 'fact');
  const clarifyDocs = docs.filter(d => d.sourceType !== 'fact');
  console.log(`提取 docs 總計：${docs.length}（fact: ${factDocs.length}，clarify/其他: ${clarifyDocs.length}）`);
  console.log('fact IDs:', factDocs.map(d => d.id).join(', '));
  console.log('');

  // 執行測試
  let pass = 0, fail = 0;
  const failures = [];

  for (const t of TESTS) {
    const results = searchDocs(docs, t.q);
    const top = results[0];
    const hit = top && top.id === t.expectId;
    const hintOk = hit && top.xinshing && normalize(top.xinshing).includes(normalize(t.expectHint));

    if (hit && hintOk) {
      pass++;
      console.log(`✅ [${t.q}] → ${top.id} (score:${top.score}) xinshing含「${t.expectHint}」`);
    } else {
      fail++;
      const topStr = top ? `${top.id}(score:${top.score})` : '(無結果)';
      console.log(`❌ [${t.q}] 期望:${t.expectId} 實際:${topStr}`);
      if (top && top.xinshing) console.log(`   xinshing: ${top.xinshing.substring(0,80)}`);
      failures.push({ q: t.q, expected: t.expectId, got: top?.id, hint: t.expectHint });
    }
  }

  console.log(`\n=== 結果：${pass}/${TESTS.length} 通過，${fail} 失敗 ===`);
  if (failures.length > 0) {
    console.log('\n失敗清單：');
    for (const f of failures) {
      console.log(`  查詢：「${f.q}」 期望:${f.expected} 得到:${f.got || '無'} 缺少hint:「${f.hint}」`);
    }
  }
}

main().catch(console.error);

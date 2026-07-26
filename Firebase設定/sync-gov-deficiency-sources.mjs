import { readFileSync, writeFileSync } from 'fs';
import { runInNewContext } from 'vm';
import crypto from 'crypto';

const PROJECT_ID = 'xinshing-gdp-training-20260525';
const HTML_PATH = 'HTML資料庫/新勝GDP資料庫.html';
const FIREBASE_TOOLS_CONFIG = `${process.env.USERPROFILE}/.config/configstore/firebase-tools.json`;

function docIdHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16).toLowerCase();
}

function getTokenFromConfig() {
  const config = JSON.parse(readFileSync(FIREBASE_TOOLS_CONFIG, 'utf-8'));
  if (config.tokens && config.tokens.access_token) return config.tokens;
  throw new Error('No tokens found in firebase-tools config. Run: npx firebase-tools login');
}

function readConfig() {
  return JSON.parse(readFileSync(FIREBASE_TOOLS_CONFIG, 'utf-8'));
}

async function refreshAccessToken(config) {
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
      client_secret: 'j9iVZfS0i2V7FeEYkF1PkO15',
      refresh_token: config.tokens.refresh_token,
      grant_type: 'refresh_token'
    }).toString()
  });
  if (!resp.ok) throw new Error(`Token refresh failed: ${await resp.text()}`);
  const data = await resp.json();
  config.tokens.access_token = data.access_token;
  config.tokens.expires_at = Date.now() + (data.expires_in || 3599) * 1000;
  writeFileSync(FIREBASE_TOOLS_CONFIG, JSON.stringify(config, null, '\t'), 'utf-8');
  return data.access_token;
}

async function firestoreWrite(collection, docId, data) {
  const fields = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      fields[key] = { arrayValue: { values: value.map(v => ({ stringValue: String(v).slice(0, 1400) })) } };
    } else if (typeof value === 'number') {
      fields[key] = { integerValue: value };
    } else {
      fields[key] = { stringValue: String(value).slice(0, 12000) };
    }
  }
  const config = readConfig();
  let token = config.tokens.access_token;

  // Refresh if expired (5 min buffer)
  if (config.tokens.expires_at && Date.now() >= config.tokens.expires_at - 300000) {
    console.log('  Token expired, refreshing...');
    token = await refreshAccessToken(config);
  }

  const body = JSON.stringify({ fields });
  const encodedId = encodeURIComponent(docId);
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${encodedId}`;
  const resp = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body });

  if (resp.status === 401) {
    console.log('  Token invalid, refreshing and retrying...');
    token = await refreshAccessToken(config);
    const resp2 = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body });
    if (!resp2.ok) {
      const text = await resp2.text();
      throw new Error(`Firestore write failed (${resp2.status}): ${text.slice(0, 200)}`);
    }
    return resp2.json();
  }
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Firestore write failed (${resp.status}): ${text.slice(0, 200)}`);
  }
  return resp.json();
}

function sourceMetaForItem(item) {
  const src = String(item.source || 'TFDA').toUpperCase();
  const type = String(item.type || '');
  const year = String(item.year || '');
  if (src === 'PICS' || src === 'PIC/S') {
    return { title: 'PIC/S PI 044-1 Aide-Memoire on GDP Inspections', url: 'https://picscheme.org/docview/6234', localFile: 'PICS/codex_PI044-1_GDP_Aide_Memoire.pdf' };
  }
  if (type.includes('行政指導')) {
    return { title: '食藥署藥品 GDP 專區：申請 GDP 檢查注意事項', url: 'https://www.fda.gov.tw/TC/siteContent.aspx?sid=7876', localFile: '' };
  }
  if (year === '2024') {
    return { title: '食藥署 113年度GDP業者說明會-GDP申請資料準備與常見缺失', url: 'https://www.fda.gov.tw/tc/includes/GetFile.ashx?id=f638768789562401428&type=1', localFile: 'TFDA/codex_113年度GDP申請資料準備與常見缺失.pdf' };
  }
  if (year === '2022') {
    return { title: '食藥署 111年度GDP業者說明會-實地查核流程與常見缺失', url: 'https://www.fda.gov.tw/tc/includes/GetFile.ashx?id=f637913384797731043&type=1', localFile: 'TFDA/codex_111年度GDP實地查核流程與常見缺失.pdf' };
  }
  return { title: '食藥署藥品GDP相關活動/訓練講義：GDP法規解析與常見缺失說明', url: 'https://www.fda.gov.tw/tc/siteListContent.aspx?id=27151&sid=4072', localFile: '' };
}

// 只收錄已在官方來源／既有題庫逐筆核對的年度公開查核重點。
// staff 是日常執行與紀錄；leader 是複核、趨勢監督與異常改善追蹤。
const GOV_EXAM_QUESTIONS = [
  {questionId:'gov-exam-wh-staff-fefo',roleKeys:['warehouse_staff'],level:'staff',topic:'公開查核重點：揀貨',questionText:'食藥署公開常見缺失指出，倉儲出貨揀貨時常見的問題是什麼？',options:['未依先到期先出貨（FEFO）原則運作','揀貨速度太慢','揀貨人員太多','揀貨走道太寬'],correctIndex:0,explanation:'政府公開查核重點：倉儲出貨揀貨應依 FEFO 原則執行。',sourceTitle:'TFDA 111年度GDP實地查核流程與常見缺失',sourceSection:'倉儲與出貨公開查核重點',sourceQuote:'公開常見缺失：倉儲出貨揀貨未依先到期先出貨（FEFO）原則運作。',sourceId:'gov-src-tfda-111'},
  {questionId:'gov-exam-wh-staff-calibration',roleKeys:['warehouse_staff'],level:'staff',topic:'公開查核重點：溫度監測',questionText:'溫度監測設備的日常管理，應保留哪一項證據以符合公開查核重點？',options:['定期校正報告；委外校正也需有公司文件化紀錄','只要設備仍可開機','設備購買發票','設備品牌型錄'],correctIndex:0,explanation:'公開查核重點包括溫度監測設備定期校正及校正報告留存。',sourceTitle:'TFDA 111年度GDP實地查核流程與常見缺失',sourceSection:'溫度監測設備公開查核重點',sourceQuote:'溫度監測設備應定期校正並留存校正報告，委外校正亦需公司文件化紀錄。',sourceId:'gov-src-tfda-111'},
  {questionId:'gov-exam-wh-lead-mapping',roleKeys:['warehouse_lead'],level:'leader',topic:'組長公開查核重點：溫度測繪複核',questionText:'倉庫組長準備溫度測繪資料供查核時，應確認哪一項作法？',options:['夏季與冬季各測足具代表性天數，並依結果決定記錄器放置位置','只在冷氣故障時測一天','只量辦公區溫度','由物流商口頭保證即可'],correctIndex:0,explanation:'公開查核重點：溫度測繪需涵蓋夏冬代表性條件，並據以決定監測點。',sourceTitle:'TFDA 111年度GDP實地查核流程與常見缺失',sourceSection:'溫度測繪公開查核重點',sourceQuote:'夏季與冬季各測足具代表性天數，並依測繪結果決定溫度記錄器放置位置。',sourceId:'gov-src-tfda-111'},
  {questionId:'gov-exam-wh-lead-fefo-review',roleKeys:['warehouse_lead'],level:'leader',topic:'組長公開查核重點：FEFO複核',questionText:'倉庫組長針對公開查核常見缺失做複核時，應優先確認哪一項紀錄與現場是否一致？',options:['揀貨批號與效期是否依 FEFO 原則執行','外箱顏色是否一致','揀貨人員是否穿同款制服','物流車外觀是否新穎'],correctIndex:0,explanation:'公開缺失的重點是實際揀貨未落實 FEFO，組長應以批號、效期和揀貨紀錄交叉複核。',sourceTitle:'TFDA 111年度GDP實地查核流程與常見缺失',sourceSection:'倉儲與出貨公開查核重點',sourceQuote:'公開常見缺失：倉儲出貨揀貨未依先到期先出貨（FEFO）原則運作。',sourceId:'gov-src-tfda-111'},
  {questionId:'gov-exam-sales-staff-customer',roleKeys:['sales_staff','sales_assistant'],level:'staff',topic:'公開查核重點：客戶認可',questionText:'業務或業助處理新客戶交易前，哪一項是政府公開查核重點？',options:['確認客戶資格認可完整，並確認其 GDP／GMP 符合性','先完成第一筆交易再補資料','只確認客戶願意付款','只保存名片即可'],correctIndex:0,explanation:'公開缺失指出客戶或供應商資格認可不完整，是 GDP 查核重點。',sourceTitle:'TFDA 111年度GDP實地查核流程與常見缺失',sourceSection:'客戶資格公開查核重點',sourceQuote:'政府公開查核重點：資格認可應完整並確認 GDP／GMP 符合性。',sourceId:'gov-src-tfda-111'},
  {questionId:'gov-exam-sales-staff-complaint',roleKeys:['sales_staff','sales_assistant'],level:'staff',topic:'公開查核重點：客訴紀錄',questionText:'業務或業助接到客訴時，為避免公開查核常見缺失，第一步應做到什麼？',options:['完整登錄客訴原始細節，並依程序分類處理','只口頭告知主管','等客戶再次來電再記錄','先承諾退款後不留資料'],correctIndex:0,explanation:'客訴處理應保留可追溯的原始紀錄並依程序分類。',sourceTitle:'TFDA 113年度GDP申請資料準備與常見缺失',sourceSection:'紀錄完整性公開查核重點',sourceQuote:'GDP 相關紀錄與實際作業須一致、完整且可追溯。',sourceId:'gov-src-tfda-113'},
  {questionId:'gov-exam-sales-lead-customer-review',roleKeys:['sales_lead'],level:'leader',topic:'組長公開查核重點：客戶資格複核',questionText:'業務組長針對客戶資格公開查核重點執行年度複核時，最應防止什麼情形？',options:['資格認可資料不完整，未確認客戶持續符合 GDP／GMP 要求','客戶數量增加','客戶聯絡人異動','客戶下單頻率改變'],correctIndex:0,explanation:'組長應以年度複核防止資格認可不完整或未確認持續符合性的缺失。',sourceTitle:'TFDA 111年度GDP實地查核流程與常見缺失',sourceSection:'客戶資格公開查核重點',sourceQuote:'政府公開查核重點：資格認可應完整並確認 GDP／GMP 符合性。',sourceId:'gov-src-tfda-111'},
  {questionId:'gov-exam-sales-lead-record-review',roleKeys:['sales_lead'],level:'leader',topic:'組長公開查核重點：紀錄追溯',questionText:'業務組長複核客訴與運銷紀錄時，何種結果最符合公開查核要求？',options:['紀錄與實際作業一致、完整且可追溯，異常有後續處置證據','只要客戶沒有再抱怨','只保留最後一封回覆郵件','由個人自行保存不需彙整'],correctIndex:0,explanation:'政府公開查核重點是 GDP 紀錄須與實際作業一致、完整且可追溯。',sourceTitle:'TFDA 113年度GDP申請資料準備與常見缺失',sourceSection:'紀錄完整性公開查核重點',sourceQuote:'GDP 相關紀錄與實際作業須一致、完整且可追溯。',sourceId:'gov-src-tfda-113'}
];

async function main() {
  console.log('Reading HTML...');
  const html = readFileSync(HTML_PATH, 'utf-8');

  // Extract sections array using balanced brace matching
  const sectionsStart = html.indexOf('const sections = [');
  if (sectionsStart === -1) throw new Error('Could not find sections array start');
  let depth = 0;
  let i = sectionsStart + 'const sections = '.length;
  let sectionsEnd = -1;
  for (; i < html.length; i++) {
    if (html[i] === '[' || html[i] === '{') depth++;
    else if (html[i] === ']' || html[i] === '}') {
      depth--;
      if (depth === 0) { sectionsEnd = i + 1; break; }
    }
  }
  if (sectionsEnd === -1) throw new Error('Could not find sections array end');
  const sectionsCode = html.slice(sectionsStart + 'const sections = '.length, sectionsEnd);

  // Parse sections - clean up trailing comma before ] and trailing semicolon
  const cleanCode = sectionsCode.replace(/;\s*$/, '');
  const sections = runInNewContext(cleanCode, {}, { timeout: 5000 });
  console.log(`Found ${sections.length} sections`);

  // Collect all focus items with section info, exclude EU
  const allItems = [];
  const sourceMap = new Map();

  for (const sec of sections) {
    if (!sec.focus || !Array.isArray(sec.focus) || sec.focus.length === 0) continue;
    const sectionId = sec.id || 'unknown';
    const sectionTitle = sec.title || sectionId;
    for (const item of sec.focus) {
      const src = String(item.source || 'TFDA').toUpperCase();
      if (src === 'EU') continue;
      const year = parseInt(item.year, 10) || 0;
      const type = String(item.type || '');
      const sourceKey = `${src}_${year}_${type}`;
      const meta = sourceMetaForItem(item);

      if (!sourceMap.has(sourceKey)) {
        const sourceId = `gov-src-${docIdHash(sourceKey)}`;
        sourceMap.set(sourceKey, {
          sourceId,
          title: meta.title,
          type: src,
          year,
          url: meta.url,
          localFile: meta.localFile,
          description: `${src} ${year} ${type} - ${meta.title}`
        });
      }

      const rawText = item.text || '';
      const itemIdBase = rawText.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '').slice(0, 40);
      const itemId = `gov-item-${docIdHash(itemIdBase + sourceKey)}`;

      allItems.push({
        itemId,
        text: String(item.text || ''),
        source: src,
        year,
        type,
        sectionId,
        sectionTitle,
        sourceId: sourceMap.get(sourceKey).sourceId,
        evidenceToPrepare: item.evidenceToPrepare || '',
        auditQuestion: item.auditQuestion || '',
        answerDirection: item.answerDirection || ''
      });
    }
  }

  console.log(`Found ${sourceMap.size} unique sources, ${allItems.length} deficiency items (EU excluded)`);

  // Write sources
  console.log('\n--- Writing gdpGovDeficiencySources ---');
  let written = 0;
  for (const [key, source] of sourceMap) {
    try {
      const data = { ...source, createdAt: new Date().toISOString() };
      await firestoreWrite('gdpGovDeficiencySources', source.sourceId, data);
      console.log(`  [OK] ${source.sourceId} - ${source.title.slice(0, 50)}...`);
      written++;
    } catch (e) {
      console.error(`  [FAIL] ${source.sourceId}: ${e.message}`);
    }
  }
  console.log(`Sources: ${written}/${sourceMap.size} written`);

  // Write items
  console.log('\n--- Writing gdpGovDeficiencyItems ---');
  let itemWritten = 0;
  for (const item of allItems) {
    try {
      const data = { ...item, createdAt: new Date().toISOString() };
      await firestoreWrite('gdpGovDeficiencyItems', item.itemId, data);
      itemWritten++;
      if (itemWritten % 20 === 0) console.log(`  ${itemWritten}/${allItems.length} items written...`);
    } catch (e) {
      console.error(`  [FAIL] ${item.itemId.slice(0, 30)}: ${e.message}`);
    }
  }
  console.log(`Items: ${itemWritten}/${allItems.length} written`);

  console.log('\n--- Writing gdpGovExamQuestions ---');
  let questionWritten = 0;
  for (const question of GOV_EXAM_QUESTIONS) {
    try {
      await firestoreWrite('gdpGovExamQuestions', question.questionId, {...question, createdAt:new Date().toISOString()});
      questionWritten++;
    } catch (e) { console.error(`  [FAIL] ${question.questionId}: ${e.message}`); }
  }
  console.log(`Exam questions: ${questionWritten}/${GOV_EXAM_QUESTIONS.length} written`);

  console.log('\n=== Sync complete ===');
  console.log(`Sources: ${written}/${sourceMap.size}`);
  console.log(`Items: ${itemWritten}/${allItems.length}`);
  console.log(`Exam questions: ${questionWritten}/${GOV_EXAM_QUESTIONS.length}`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });

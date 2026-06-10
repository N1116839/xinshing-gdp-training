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

  console.log('\n=== Sync complete ===');
  console.log(`Sources: ${written}/${sourceMap.size}`);
  console.log(`Items: ${itemWritten}/${allItems.length}`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });

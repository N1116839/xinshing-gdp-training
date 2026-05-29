import { readFileSync } from 'fs';
function normalize(s) { return (s||'').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim(); }
function searchDocs(docs, query) {
  const compact = normalize(query);
  const results = [];
  for (const doc of docs) {
    let score = 0;
    const keywords = doc.keywords || [];
    const hay = keywords.map(normalize).join(' ');
    for (const kw of keywords) {
      const nkw = normalize(kw);
      if (compact.includes(nkw) || nkw.includes(compact)) score += 10;
      if (hay.includes(compact)) score += 5;
    }
    if (doc.sourceType === 'fact') {
      const nTopic = normalize(doc.topic || '');
      let matchScore = 0;
      let kwHits = 0;
      for (const kw of keywords) {
        const nkw = normalize(kw);
        if (nkw.length >= 4 && compact.includes(nkw)) kwHits++;
      }
      matchScore += Math.min(kwHits, 3) * 5;
      if (nTopic.length >= 4 && compact.includes(nTopic)) matchScore += 6;
      if (keywords.some(kw => compact.includes(normalize(kw)))) matchScore += 8;
      const kwHay = keywords.map(normalize).join('|');
      if (kwHay.includes(compact)) matchScore += 10;
      score += matchScore;
    }
    for (const kw of keywords) {
      const nkw = normalize(kw);
      if (nkw.length >= 4 && compact.includes(nkw)) score += 10;
    }
    if (doc.topic && compact.includes(normalize(doc.topic))) score += 8;
    if (score > 0) results.push({ id: doc.id, score, sourceType: doc.sourceType, topic: doc.topic, xinshing: doc.xinshing });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 3);
}
function extractDocs(html) {
  const docs = [];
  const re = /docs\.push\(\{([\s\S]{0,4000}?\})\);/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const raw = m[1];
      const idM = raw.match(/id:\s*"([^"]+)"/);
      const stM = raw.match(/sourceType:\s*"([^"]+)"/);
      const topicM = raw.match(/topic:\s*"([^"]+)"/);
      const intlM = raw.match(/international:\s*"([\s\S]{0,2000}?)",\s*taiwan/);
      const twM = raw.match(/taiwan:\s*"([\s\S]{0,2000}?)",\s*xinshing/);
      const xinM = raw.match(/xinshing:\s*"([\s\S]{0,2000}?)",\s*sop_ref/);
      const kwM = raw.match(/keywords:\s*\[([\s\S]{0,2000}?)\]/);
      if (!idM) continue;
      const doc = { id: idM[1], sourceType: stM?.[1] || '', topic: topicM?.[1] || '' };
      doc.international = intlM ? intlM[1] : '';
      doc.taiwan = twM ? twM[1] : '';
      doc.xinshing = xinM ? xinM[1] : '';
      if (kwM) {
        try { doc.keywords = JSON.parse('[' + kwM[1] + ']'); } catch { doc.keywords = []; }
      } else doc.keywords = [];
      docs.push(doc);
    } catch {}
  }
  return docs;
}
const html = readFileSync('G:/我的雲端硬碟/2026codex/AI測試/HTML資料庫/新勝GDP資料庫.html', 'utf8');
const docs = extractDocs(html);
const results = searchDocs(docs, '委外評鑑什麼時候');
console.log('委外評鑑什麼時候:');
results.forEach(r => console.log(`  ${r.id} score=${r.score}`));
const results2 = searchDocs(docs, '委外廠商何時評鑑');
console.log('委外廠商何時評鑑:');
results2.forEach(r => console.log(`  ${r.id} score=${r.score}`));
const results3 = searchDocs(docs, '委外首次評估記錄在哪');
console.log('委外首次評估記錄在哪:');
results3.forEach(r => console.log(`  ${r.id} score=${r.score}`));

import { readFileSync } from 'fs';
function normalize(s) { return (s||'').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim(); }
const html = readFileSync('G:/我的雲端硬碟/2026codex/AI測試/HTML資料庫/新勝GDP資料庫.html', 'utf8');
const docMatch = html.match(/docs\.push\(\{id:"fact-outsourcing-eval-timing"[\s\S]{0,400}?\}\);/);
if (!docMatch) { console.log('NOT FOUND'); process.exit(1); }
const raw = docMatch[0];
const kwMatch = raw.match(/keywords:\s*\[([^\]]+)\]/);
if (kwMatch) {
  const kwStr = '[' + kwMatch[1] + ']';
  const kws = JSON.parse(kwStr);
  console.log('Keyword count:', kws.length);
  console.log('Includes 委外評鑑:', kws.includes('委外評鑑'));
  const testQuery = '委外評鑑什麼時候';
  for (const kw of kws) {
    if (testQuery.includes(kw)) console.log('MATCH: query includes', kw);
  }
} else {
  console.log('Keywords not found');
}

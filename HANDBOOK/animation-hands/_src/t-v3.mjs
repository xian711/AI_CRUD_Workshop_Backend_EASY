// 第三版快速檢查：載入有沒有錯、段數／句數、每段句數是否跟講稿一樣、預錄選項有沒有出現
import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 1100 } });
const errs = [], warns = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') warns.push(m.text()); });
await p.goto('file:///' + process.argv[2].split('\\').join('/') + '#s1-1'); await p.waitForTimeout(1500);
const info = await p.evaluate(() => ({ scenes: window.__animIndex.length, lines: window.__animIndex.reduce((a, s) => a + s.steps.length, 0),
  rec: Object.keys(window.__audio || {}).length, voice: document.getElementById('voiceSel').value, who: document.getElementById('who').textContent }));
console.log(JSON.stringify(info));
// 每一段都跳一次，抓執行錯誤
for (let i = 1; i <= info.scenes; i++) { await p.evaluate(x => { location.hash = x }, '#s' + i + '-1'); await p.waitForTimeout(250); }
console.log('errors', JSON.stringify(errs.slice(0, 10)));
console.log('warnings', JSON.stringify(warns.filter(w => !/api\/config|Failed to load resource/.test(w)).slice(0, 15)));
await b.close();

// 檢查裝進 repo 的版本：手冊上方的連結、點進去動畫能播、截圖都載入得到
import { chromium } from 'playwright';
const repo = 'file:///D:/AIWORK/_AICLASS/AI_CRUD_Workshop_Frontend_EASY/HANDBOOK/';
const out = process.argv[2];
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
const bad = []; p.on('requestfailed', r => { if (!/api\/config/.test(r.url())) bad.push(r.url()); });
await p.goto(repo + 'HANDBOOK.html'); await p.waitForTimeout(800);
await p.screenshot({ path: out + '/hb-top.png', clip: { x: 0, y: 0, width: 1400, height: 330 } });
await p.click('a.anim-link'); await p.waitForTimeout(1500);
console.log('url:', p.url());
for (const h of ['#s19-3', '#s28-5', '#s23-1']) { await p.evaluate(x => { location.hash = x }, h); await p.waitForTimeout(2500); }
await p.screenshot({ path: out + '/anim-installed.png' });
console.log('failed requests:', JSON.stringify(bad));
await b.close();

// 第三版播放測試：按開始 → 預錄有在播 → 播完自動換下一句 → 暫停記住位置 → 繼續從原位置接著播
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1600, height: 1100 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file:///' + process.argv[2].split('\\').join('/') + '#s2-1'); await p.waitForTimeout(1200);
const st = () => p.evaluate(() => { const d = window.__dbg(); const a = d.curAudio; return { scene: d.cur + 1, step: d.stepI + 1, playing: d.playing, a: a ? { t: +a.currentTime.toFixed(2), paused: a.paused, src: a.src.split('/').pop() } : null, who: document.getElementById('who').textContent } });
await p.click('#bStart'); await p.waitForTimeout(1500);
const s1 = await st(); console.log('after start', JSON.stringify(s1));
// 等它自己換句（2-1 大約 6 秒）
let s2 = s1; for (let i = 0; i < 30 && s2.step === s1.step; i++) { await p.waitForTimeout(500); s2 = await st(); }
console.log('auto-advanced', JSON.stringify(s2), 'advanced:', s2.step !== s1.step);
await p.waitForTimeout(1500); await p.click('#bPlay'); const sp = await st();
await p.waitForTimeout(2000); const sp2 = await st();
console.log('paused', JSON.stringify(sp), 'still same t after 2s:', sp.a && sp2.a && sp.a.t === sp2.a.t);
await p.click('#bPlay'); await p.waitForTimeout(1200); const sr = await st();
console.log('resumed', JSON.stringify(sr), 'continued from position:', sr.a && sp.a && sr.a.src === sp.a.src && sr.a.t > sp.a.t);
// 改倍速：整句重來，不會兩個聲音一起播
await p.selectOption('#speedSel', { index: 0 }); await p.waitForTimeout(1200);
const sv = await st(); console.log('after speed change', JSON.stringify(sv), 'audios playing:', await p.evaluate(() => [...document.querySelectorAll('audio')].length));
// 換成別的聲音：舊的預錄要停
const opts = await p.locator('#voiceSel option').count();
if (opts > 1) { await p.selectOption('#voiceSel', { index: 1 }); await p.waitForTimeout(800); const sw = await st(); console.log('after voice switch', JSON.stringify(sw), 'old audio stopped:', !sw.a || sw.a.paused); }
else console.log('only one voice option (no browser voices in headless)');
console.log('errors', JSON.stringify(errs));
await b.close();

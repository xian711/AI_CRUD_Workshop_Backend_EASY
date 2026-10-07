// 聲音延遲測試：每個 mp3 下載故意延遲 1.5 秒（模擬線上版網路），量「換到新句子 → 真的出聲」要等多久
// 用法：node t-latency.mjs <anim.html> [段數=3]
const { chromium } = await import('file:///D:/AIWORK/pw-shots-tmp/node_modules/playwright/index.mjs')
const file = process.argv[2], N = +(process.argv[3] || 3)
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage({ viewport: { width: 1600, height: 1000 } })
await p.route('**/*.mp3', async route => { await new Promise(r => setTimeout(r, 1500)); await route.continue() })
await p.goto('file:///' + file.split('\\').join('/') + '#s1-1'); await p.waitForTimeout(2500)
await p.evaluate(() => {
  window.__lat = []; let last = ''
  setInterval(() => {
    const d = window.__dbg(); const key = d.cur + '-' + d.stepI
    if (key !== last) { last = key; window.__lat.push({ key, t0: performance.now(), heard: null }) }
    const e = window.__lat[window.__lat.length - 1]
    if (e && e.heard == null && d.curAudio && d.curAudio.currentTime > 0.05 && !d.curAudio.paused) e.heard = Math.round(performance.now() - e.t0)
  }, 20)
})
const start = p.locator('#bStart'); if (await start.isVisible()) await start.click(); else await p.locator('#bPlay').click()
const total = await p.evaluate(n => window.__script.slice(0, n).reduce((a, s) => a + s.lines.length, 0), N)
for (let i = 0; i < 400; i++) { await p.waitForTimeout(500); const done = await p.evaluate(t => window.__lat.filter(e => e.heard != null).length >= t, total); if (done) break }
const lat = await p.evaluate(() => window.__lat)
const ms = lat.filter(e => e.heard != null).map(e => e.heard)
console.log(lat.map(e => e.key + ':' + e.heard).join('  '))
console.log('sentences', ms.length, 'first', ms[0], 'max after first', Math.max(...ms.slice(1)), 'avg after first', Math.round(ms.slice(1).reduce((a, v) => a + v, 0) / Math.max(1, ms.length - 1)))
await b.close()
